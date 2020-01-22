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
import { getGitUrl, getTitle, getFilename, getHeading } from './utils';

program.version(require(path.resolve(__dirname, '../package.json')).version || '', '-v, --version');

let debug = false;
let output = 'book.json';
const bookConfig: Partial<BookConfig> = {};

function readDir(dir: string, link = '/'): NavItem[] | undefined {
  const result: NavItem[] = [];
  fs.readdirSync(dir).forEach(file => {
    const item: NavItem = { title: '' };
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile()) {
      if (path.extname(fullPath) === '.md') {
        const filename = getFilename(fullPath);
        item.title = getTitle(fullPath) as string;
        item.link = `${link}${filename === 'README' ? '' : filename}`;
        const titles = getHeading(fullPath);
        if (titles.length) item.children = titles;
        result.push(item);
      }
    } else {
      item.title = file;
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
  .option('-d, --source-dir <source dir>', 'github source dir', (sourceDir: string) => {
    bookConfig.sourceDir = sourceDir;
  })
  .option('--debug', 'enabled debug mode', () => {
    debug = true;
  })
  .option('-o, --output <ouput file>', `ouput json file, default \`${output}\``, (out: string) => {
    if (out.endsWith('.json')) {
      output = out;
    } else {
      output = path.join(out, output);
    }
  })
  .arguments('<dir>')
  .action(async (dir: string) => {
    // read github info
    const git = await gitRemoteOriginUrl(dir);
    bookConfig.github = getGitUrl(git);

    const fullDir = path.join(process.cwd(), dir);

    if (!bookConfig.title) {
      bookConfig.title = getTitle(fullDir);
    }

    // recursive scan dir
    // fill sidebar
    bookConfig.sidebar = readDir(fullDir);

    // create file
    const fullPath = path.join(process.cwd(), output);
    mkdirp.sync(path.dirname(fullPath));
    const configStr = JSON.stringify(bookConfig, null, 2) + '\n';
    if (debug) console.log(configStr);
    fs.writeFileSync(fullPath, configStr);
  });

program.parse(process.argv);
