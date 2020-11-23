/**
 * Automatically generate configuration from directory
 *
 * @example
 * gem-book -c book.config.json src/docs
 * gem-book -t documentTitle src/docs
 */

import program from 'commander';
import path from 'path';
import util from 'util';
import fs from 'fs';
import mkdirp from 'mkdirp';
import getRepoInfo from 'git-repo-info';
import { startCase, debounce } from 'lodash';

import { version } from '../../package.json';
import { BookConfig, NavItem, SidebarConfig } from '../common/config';
import { isIndexFile, parseFilename } from '../common/utils';
import { getGithubUrl, isDirConfigFile, getMetadata, isMdfile } from './utils';
import { startBuilder, builderEventTarget } from './builder';
import lang from './lang.json';

program.version(version, '-v, --version');

let debug = false;
let serve = false;
let watch = false;
let output = '';
let outputFe = false;
const bookConfig: Partial<BookConfig> = {};
let resolveBookConfig: (value?: unknown) => void;
const bookPromise = new Promise((res) => (resolveBookConfig = res));

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
      const item: NavItem = { title: '' };
      const fullPath = path.join(dir, filename);
      if (fs.statSync(fullPath).isFile()) {
        if (isMdfile(fullPath)) {
          item.link = `${link}${filename}`;
          const { title, headings: children, isNav, navTitle, sidebarIgnore } = getMetadata(
            fullPath,
            bookConfig.displayRank,
          );
          Object.assign(item, { title, children, isNav, navTitle, sidebarIgnore });
          result.push(item);
        }
      } else {
        item.children = readDir(fullPath, path.posix.join(link, filename) + '/');
        const { title, isNav, navTitle, sidebarIgnore } = getMetadata(fullPath);
        Object.assign(item, { title, isNav, navTitle, sidebarIgnore });
        result.push(item);
      }
    });
  return result;
}

async function generateBookConfig(dir: string) {
  const fullDir = path.join(process.cwd(), dir);

  // read github info
  bookConfig.github ??= await getGithubUrl();

  // default title
  bookConfig.title ??= startCase(path.basename(process.cwd()));

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

  resolveBookConfig();
  builderEventTarget.emit('update');

  // create file
  // Should I still output book.json when packaging front-end resources?
  const out = output || dir; // default dir
  const outputFile = out.endsWith('.json') ? out : path.join(out, 'book.json'); // default filename
  const fullPath = path.join(process.cwd(), outputFile);
  const configStr = JSON.stringify(bookConfig, null, 2) + '\n';
  if (fs.existsSync(fullPath) && configStr === fs.readFileSync(fullPath, 'utf-8')) {
    mkdirp.sync(path.dirname(fullPath));
    // Trigger rename event
    fs.writeFileSync(fullPath, configStr);
  }
  if (debug) console.log(util.inspect(JSON.parse(configStr), { colors: true, depth: null }));
}

const debounceCommand = debounce(generateBookConfig, 300);

function addNavItem(item: string) {
  bookConfig.nav = bookConfig.nav || [];
  const [title, link] = item.split(',');
  if (!link) throw new Error('nav options error');
  bookConfig.nav.push({ title, link });
}

program
  .option('-c, --config <config file>', 'specify config file', (configPath: string) => {
    Object.assign(bookConfig, __non_webpack_require__(path.resolve(process.cwd(), configPath)));
  })
  .option('-t, --title <title>', 'document title', (title: string) => {
    bookConfig.title = title;
  })
  .option('-i, --icon <icon>', 'project icon', (icon: string) => {
    bookConfig.icon = icon;
  })
  .option('-o, --output <ouput file>', `ouput json file, default \`${output}\``, (out: string) => {
    output = out;
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
  .option('--debug', 'enabled debug mode', () => {
    debug = true;
  })
  .option('--watch', 'watch mode', () => {
    watch = true;
  })
  .option('--serve', 'serve mode', () => {
    serve = true;
  })
  // index.html, bundle.js
  .option('--output-fe', 'output all front-end assets', () => {
    outputFe = true;
  })
  .arguments('<dir>')
  .action((dir: string) => {
    generateBookConfig(dir);
    if (serve || watch) {
      fs.watch(dir, { recursive: true }, (type, filePath) => {
        if (type === 'rename' || isDirConfigFile(filePath) || isMdfile(filePath)) {
          debounceCommand(dir);
        }
      });
    }
    if (serve || outputFe) {
      bookPromise.then(() => {
        startBuilder({ dir, debug, outputFe }, bookConfig);
      });
    }
  });

program.parse(process.argv);
