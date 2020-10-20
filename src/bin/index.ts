#!/usr/bin/env node

/**
 * Automatically generate configuration from directory
 *
 * @example
 * gem-book -c book.config.json src/docs
 * gem-book -t documentTitle src/docs
 */

import program from 'commander';
import colors from 'colors';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import gitRemoteOriginUrl from 'git-remote-origin-url';
import getRepoInfo from 'git-repo-info';
import { getGitUrl, getTitle, getFilename, getHeading } from './utils';

program.version(require(path.resolve(__dirname, '../package.json')).version || '', '-v, --version');

let debug = false;
let watch = false;
let output = '';
const bookConfig: Partial<BookConfig> = {};

function readDir(dir: string, link = '/'): NavItem[] | undefined {
  const result: NavItem[] = [];
  fs.readdirSync(dir)
    .sort((file1, file2) => {
      const [, rank1] = file1.match(/^(\d*-)?(.*)/) as RegExpMatchArray;
      const [, rank2] = file2.match(/^(\d*-)?(.*)/) as RegExpMatchArray;
      if (file1 === 'README.md') return -1;
      if (parseInt(rank1) > parseInt(rank2) || !rank2) return 1;
      return -1;
    })
    .forEach(file => {
      const item: NavItem = { title: '' };
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isFile()) {
        if (path.extname(fullPath) === '.md') {
          const filename = getFilename(fullPath);
          item.title = (getTitle(fullPath) as string).replace(/^\d*-/, '');
          item.link = `${link}${filename === 'README' ? '' : filename}`;
          const titles = getHeading(fullPath);
          if (titles.length) item.children = titles;
          result.push(item);
        }
      } else {
        item.title = file.replace(/^\d*-/, '');
        item.children = readDir(fullPath, path.join(link, file) + '/');
        result.push(item);
      }
    });
  if (result.length) {
    return result;
  } else {
    return;
  }
}

async function command(dir: string) {
  // read github info
  if (bookConfig.github === undefined) {
    const git = await gitRemoteOriginUrl(dir);
    bookConfig.github = getGitUrl(git);
  }

  const fullDir = path.join(process.cwd(), dir);

  // default title
  if (bookConfig.title === undefined) {
    bookConfig.title = getTitle(fullDir);
  }

  // default sourceDir
  if (bookConfig.sourceDir === undefined) {
    bookConfig.sourceDir = dir;
  }

  // default sourceBranch
  if (bookConfig.sourceBranch === undefined) {
    bookConfig.sourceBranch = getRepoInfo().branch;
  }

  // recursive scan dir
  // fill sidebar
  bookConfig.sidebar = readDir(fullDir);

  // create file
  const out = output || dir; // default dir
  const outputFile = out.endsWith('.json') ? out : path.join(out, 'book.json'); // default filename
  const fullPath = path.join(process.cwd(), outputFile);
  mkdirp.sync(path.dirname(fullPath));
  const configStr = JSON.stringify(bookConfig, null, 2) + '\n';
  if (debug) console.log(configStr);
  fs.writeFileSync(fullPath, configStr);
}

program
  .option('-c, --config <config file>', 'specify config file', (configPath: string) => {
    try {
      Object.assign(bookConfig, fs.readFileSync(configPath, { encoding: 'utf8' }));
    } catch {
      console.log(colors.red('config file read fail'));
    }
  })
  .option('-t, --title <title>', 'document title', (title: string) => {
    bookConfig.title = title;
  })
  .option('-i, --icon <icon>', 'project icon', (icon: string) => {
    bookConfig.icon = icon;
  })
  .option('-d, --source-dir <source dir>', 'github source dir', (sourceDir: string) => {
    bookConfig.sourceDir = sourceDir;
  })
  .option('-b, --source-branch <source branch>', 'github source branch', (sourceBranch: string) => {
    bookConfig.sourceBranch = sourceBranch;
  })
  .option('--github', 'github link', (link: string) => {
    bookConfig.sourceBranch = link;
  })
  .option('--debug', 'enabled debug mode', () => {
    debug = true;
  })
  .option('--watch', 'watch mode', () => {
    watch = true;
  })
  .option('-o, --output <ouput file>', `ouput json file, default \`${output}\``, (out: string) => {
    output = out;
  })
  .arguments('<dir>')
  .action((dir: string) => {
    command(dir);
    if (watch) {
      fs.watch(dir, { recursive: true }, () => command(dir));
    }
  });

program.parse(process.argv);
