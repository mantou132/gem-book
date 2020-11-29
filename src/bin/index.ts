/**
 * Automatically generate configuration from directory
 *
 * @example
 * gem-book -c book.config.json src/docs
 * gem-book -t documentTitle src/docs
 */

import program from 'commander';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import getRepoInfo from 'git-repo-info';
import { debounce } from 'lodash';

import { version } from '../../package.json';
import { BookConfig, NavItem, SidebarConfig } from '../common/config';
import { DEFAULT_FILE } from '../common/constant';
import { isIndexFile, parseFilename } from '../common/utils';

import {
  getGithubUrl,
  isDirConfigFile,
  getMetadata,
  isMdfile,
  inTheDir,
  isURL,
  isSomeContent,
  inspectObject,
  getRepoTitle,
} from './utils';
import { startBuilder, builderEventTarget } from './builder';

// https://developers.google.com/search/docs/advanced/crawling/localized-versions#language-codes
import lang from './lang.json';

program.version(version, '-v, --version');

let output = '';
let templatePath = '';
let themePath = '';
let iconPath = '';
let plugins = '';
let buildMode = false;
let onlyJson = false;
let debugMode = false;
const bookConfig: Partial<BookConfig> = {};

function readDir(dir: string, link = '/') {
  const result: NavItem[] = [];
  const filenames = fs.readdirSync(dir);
  const filenameWithoutRankNumberList = filenames.map((filename) => {
    const { title } = parseFilename(filename);
    return title;
  });
  if (!bookConfig.displayRank && new Set(filenameWithoutRankNumberList).size !== filenames.length) {
    throw new Error('After removing the rank number, duplicate file names are found, use `--display-rank`');
  }
  filenames
    .sort((filename1, filename2) => {
      const { rank: rank1 } = parseFilename(filename1);
      const { rank: rank2 } = parseFilename(filename2);
      if (isIndexFile(filename1)) return -1;
      if (parseInt(rank1) > parseInt(rank2) || !rank2) return 1;
      return -1;
    })
    .forEach((filename) => {
      const item: NavItem = { title: '', link: '' };
      const fullPath = path.join(dir, filename);
      if (fs.statSync(fullPath).isFile()) {
        if (isMdfile(fullPath)) {
          item.type = 'file';
          item.link = `${link}${filename}`;
          const { title, headings: children, isNav, navTitle, sidebarIgnore } = getMetadata(
            fullPath,
            bookConfig.displayRank,
          );
          Object.assign(item, { title, children, isNav, navTitle, sidebarIgnore });
          result.push(item);
        }
      } else {
        item.type = 'dir';
        item.link = `${link}${filename}/`;
        item.children = readDir(fullPath, path.posix.join(link, filename) + '/');
        const { title, isNav, navTitle, sidebarIgnore } = getMetadata(fullPath);
        Object.assign(item, { title, isNav, navTitle, sidebarIgnore });
        result.push(item);
      }
    });
  return result;
}

async function generateBookConfig(dir: string) {
  const fullDir = path.resolve(process.cwd(), dir);

  //icon path
  if (iconPath) {
    bookConfig.icon ??= isURL(iconPath)
      ? iconPath
      : `/${inTheDir(dir, iconPath) ? path.relative(dir, iconPath) : path.basename(iconPath)}`;
  }

  // read github info
  bookConfig.github ??= await getGithubUrl();

  // default title
  bookConfig.title ??= getRepoTitle();

  // default sourceDir
  bookConfig.sourceDir ??= dir;

  // default sourceBranch
  // CI not support
  bookConfig.sourceBranch ??= getRepoInfo().branch || 'master';

  if (bookConfig.i18n) {
    const sidebarConfig: SidebarConfig = {};
    fs.readdirSync(fullDir).forEach((code) => {
      const fullPath = path.join(fullDir, code);
      if (fs.statSync(fullPath).isDirectory()) {
        sidebarConfig[code] = {
          data: readDir(path.join(fullDir, code)),
          name: code in lang ? lang[code as keyof typeof lang] : code,
        };
      }
    });
    bookConfig.sidebar = sidebarConfig;
  } else {
    // recursive scan dir
    // fill sidebar
    bookConfig.sidebar = readDir(fullDir);
  }

  // create file
  const configPath = path.resolve(output || dir, output.endsWith('.json') ? '' : DEFAULT_FILE);
  const configStr = JSON.stringify(bookConfig, null, 2) + '\n';
  // buildMode: embeds the configuration into front-end resources
  if (!(!onlyJson && buildMode)) {
    if (!isSomeContent(configPath, configStr)) {
      mkdirp.sync(path.dirname(configPath));
      // Trigger rename event
      fs.writeFileSync(configPath, configStr);
    }
  }
  if (debugMode) inspectObject(JSON.parse(configStr));

  builderEventTarget.emit('update');
}

const debounceCommand = debounce(generateBookConfig, 300);

function addNavItem(item: string) {
  bookConfig.nav = bookConfig.nav || [];
  const [title, link] = item.split(',');
  if (!link) throw new Error('nav options error');
  bookConfig.nav.push({ title, link });
}

program
  .option('-t, --title <title>', 'document title', (title: string) => {
    bookConfig.title = title;
  })
  .option('-i, --icon <icon>', 'project icon path or url', (path: string) => {
    iconPath = path;
  })
  .option('-o, --output <ouput file>', `ouput json file, default \`${output}\``, (dir: string) => {
    output = dir;
  })
  .option('-d, --source-dir <source dir>', 'github source dir', (sourceDir: string) => {
    bookConfig.sourceDir = sourceDir;
  })
  .option('-b, --source-branch <source branch>', 'github source branch', (sourceBranch: string) => {
    bookConfig.sourceBranch = sourceBranch;
  })
  .option('--github <link>', 'github link', (link: string) => {
    bookConfig.sourceBranch = link;
  })
  .option('--footer <footer>', 'footer markdown', (footer: string) => {
    bookConfig.footer = footer;
  })
  .option('--i18n', 'enabled i18n', () => {
    bookConfig.i18n = true;
  })
  .option('--display-rank', 'sorting number is not displayed in the link', () => {
    bookConfig.displayRank = true;
  })
  .option('--home-mode', 'use homepage mode', () => {
    bookConfig.homeMode = true;
  })
  .option('--nav1 <title,link>', 'attach a nav item', addNavItem)
  .option('--nav2 <title,link>', 'attach a nav item', addNavItem)
  .option('--nav3 <title,link>', 'attach a nav item', addNavItem)
  .option('--plugins <plugin,plugin>', 'load plugins', (names: string) => {
    plugins = names;
  })
  .option('--template <path>', 'html template', (path) => {
    templatePath = path;
  })
  .option('--theme <path>', 'html template', (path) => {
    themePath = path;
  })
  .option('--build', 'output all front-end assets or book.json', () => {
    buildMode = true;
  })
  .option('--json', 'only output book.json', () => {
    onlyJson = true;
  })
  .option('--config <config file>', 'specify config file', (configPath: string) => {
    Object.assign(bookConfig, __non_webpack_require__(path.resolve(process.cwd(), configPath)));
  })
  .option('--debug', 'enabled debug mode', () => {
    debugMode = true;
  })
  .arguments('<dir>')
  .action(async (dir: string) => {
    await generateBookConfig(dir);
    if (!buildMode) {
      fs.watch(dir, { recursive: true }, (type, filePath) => {
        if (type === 'rename' || isDirConfigFile(filePath) || isMdfile(filePath)) {
          debounceCommand(dir);
        }
      });
    }
    if (!onlyJson) {
      const builderOptions = { dir, debugMode, buildMode, themePath, templatePath, output, iconPath, plugins };
      if (debugMode) inspectObject(builderOptions);
      startBuilder(builderOptions, bookConfig);
    }
  });

program.parse(process.argv);

if (!program.args.length) {
  program.outputHelp(() => program.help());
}
