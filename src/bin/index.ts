#!/usr/bin/env node

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
import startCase from 'lodash/startCase';
import { getFilename, getGithubUrl, getMetadata } from './utils';
import lang from './lang.json';

program.version(require(path.resolve(__dirname, '../package.json')).version || '', '-v, --version');

let debug = false;
let watch = false;
let output = '';
const bookConfig: Partial<BookConfig> = {};

function readDir(dir: string, link = '/') {
  const result: NavItem[] = [];
  fs.readdirSync(dir)
    .sort((file1, file2) => {
      const [, rank1] = file1.match(/^(\d*-)?(.*)/) as RegExpMatchArray;
      const [, rank2] = file2.match(/^(\d*-)?(.*)/) as RegExpMatchArray;
      if (file1 === 'README.md') return -1;
      if (parseInt(rank1) > parseInt(rank2) || !rank2) return 1;
      return -1;
    })
    .forEach((itemname) => {
      const item: NavItem = { title: '' };
      const fullPath = path.join(dir, itemname);
      if (fs.statSync(fullPath).isFile()) {
        if (path.extname(fullPath) === '.md') {
          const filename = getFilename(fullPath);
          item.link = `${link}${filename === 'README' ? '' : filename}`;
          const { title, headings: children, isNav, navTitle, sidebarIgnore } = getMetadata(fullPath);
          Object.assign(item, { title, children, isNav, navTitle, sidebarIgnore });
          result.push(item);
        }
      } else {
        item.children = readDir(fullPath, path.join(link, itemname) + '/');
        const { title, isNav, navTitle, sidebarIgnore } = getMetadata(fullPath);
        Object.assign(item, { title, isNav, navTitle, sidebarIgnore });
        result.push(item);
      }
    });
  return result;
}

async function command(dir: string) {
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

  // create file
  const out = output || dir; // default dir
  const outputFile = out.endsWith('.json') ? out : path.join(out, 'book.json'); // default filename
  const fullPath = path.join(process.cwd(), outputFile);
  mkdirp.sync(path.dirname(fullPath));
  const configStr = JSON.stringify(bookConfig, null, 2) + '\n';
  if (debug) console.log(configStr);
  fs.writeFileSync(fullPath, configStr);
}

function addNavItem(item: string) {
  bookConfig.nav = bookConfig.nav || [];
  const [title, link] = item.split(',');
  if (!link) throw new Error('nav options error');
  bookConfig.nav.push({ title, link });
}

program
  .option('-c, --config <config file>', 'specify config file', (configPath: string) => {
    Object.assign(bookConfig, require(path.resolve(process.cwd(), configPath)));
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
  .option('--i18n', 'enabled i18n', () => {
    bookConfig.i18n = true;
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
  .arguments('<dir>')
  .action((dir: string) => {
    command(dir);
    if (watch) {
      fs.watch(dir, { recursive: true }, (_type, filename) => {
        if (path.extname(filename) === '.md') {
          command(dir);
        }
      });
    }
  });

program.parse(process.argv);
