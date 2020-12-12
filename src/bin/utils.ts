import path from 'path';
import fs from 'fs';
import util from 'util';
import { URL } from 'url';
import gitRemoteOriginUrl from 'git-remote-origin-url';
import parseGithub from 'parse-github-url';
import { JSDOM } from 'jsdom';
import marked from 'marked';
import fm from 'front-matter';
import YAML from 'yaml';
import { startCase } from 'lodash';

import { NavItem } from '../common/config';
import { FrontMatter } from '../common/frontmatter';
import { isIndexFile, parseFilename } from '../common/utils';

// https://github.com/webpack/webpack/issues/4175#issuecomment-277232067
declare global {
  let __non_webpack_require__: typeof require;
}

export async function getGithubUrl() {
  const repoDir = process.cwd();
  try {
    const repoPkg = __non_webpack_require__(path.resolve(repoDir, './package.json'));
    const repo = repoPkg?.repository;
    const git = typeof repo === 'string' ? repo : repo?.url || (await gitRemoteOriginUrl(repoDir));
    const parsed = parseGithub(git);
    if (parsed?.repository) {
      return `https://github.com/${parsed.repository}`;
    }
  } catch {}
}

export function getRepoTitle() {
  const repoDir = process.cwd();
  try {
    const repoPkg = __non_webpack_require__(path.resolve(repoDir, './package.json'));
    if (!repoPkg.title) throw 'no title';
    return repoPkg.title;
  } catch {
    return startCase(path.basename(process.cwd()));
  }
}

export function resolveTheme(p: string) {
  if (!p) return { theme: null, resolveThemePath: p };
  const file = p.startsWith('.json') ? p : `${p}.json`;
  try {
    const resolveThemePath = path.resolve(process.cwd(), file);
    return { resolveThemePath, theme: __non_webpack_require__(resolveThemePath) };
  } catch {
    const resolveThemePath = path.resolve(__dirname, `../themes/${file}`);
    return { resolveThemePath, theme: __non_webpack_require__(resolveThemePath) };
  }
}

export function checkRelativeLink(fullPath: string, docsRootDir: string) {
  const md = fs.readFileSync(fullPath, 'utf8');
  const lines = md.split('\n');
  const results = [...md.matchAll(/\[.*?\]\((.*?)(\s+.*?)?\)/g)];
  const links = results.map(([, link]) => link).filter((link) => /^\.?\.?\//.test(link));
  links.forEach((link, index) => {
    const targetPath = link.startsWith('/') ? path.join(docsRootDir, link) : path.resolve(path.dirname(fullPath), link);
    if (!fs.existsSync(targetPath)) {
      const strIndex = results[index].index || 0;
      let currentNum = 0;
      let lineNum = 1;
      let colNum = 1;
      for (const line of lines) {
        if (strIndex > currentNum + line.length) {
          lineNum += 1;
        } else {
          colNum = strIndex - currentNum + 1;
          break;
        }
        currentNum += line.length + 1;
      }
      const position = `(${lineNum},${colNum})`;
      console.warn(`${fullPath}${position} link warn: ${link}`);
    }
  });
}

type FileMetadata = FrontMatter & {
  title: string;
  headings?: NavItem[];
};

export function getMetadata(fullPath: string, displayRank: boolean | undefined): FileMetadata {
  const getTitle = () => {
    const basename = path.basename(fullPath);
    if (isIndexFile(basename)) return '';
    const filename = basename.replace(/\.[^.]*$/, '');
    return displayRank ? filename : parseFilename(filename).title;
  };
  const parseMd = (fullPath: string) => {
    const md = fs.readFileSync(fullPath, 'utf8');
    const { attributes, body } = fm<FileMetadata>(md);
    const html = marked(body);
    const { window } = new JSDOM(html);
    const h1 = window.document.querySelector('h1');
    const h2s = window.document.querySelectorAll('h2');
    return {
      ...(attributes as FileMetadata),
      title: attributes.title || h1?.textContent || getTitle(),
      headings: h2s.length
        ? [...h2s].map(
            (heading) =>
              ({
                title: heading.textContent as string,
                link: `#${heading.id}`,
                type: 'heading',
              } as NavItem),
          )
        : undefined,
    };
  };

  if (fs.statSync(fullPath).isDirectory()) {
    const files = fs.readdirSync(fullPath);
    const result = {
      title: getTitle(),
    };
    const configFile = files.find(isDirConfigFile);
    if (configFile) {
      const config = YAML.parse(fs.readFileSync(path.join(fullPath, configFile), 'utf-8'));
      return {
        ...result,
        ...config,
      };
    } else {
      return result;
    }
  } else if (isMdfile(fullPath)) {
    return parseMd(fullPath);
  }
  return { title: '' };
}

export function isMdfile(filename: string) {
  return /\.md$/i.test(path.extname(filename));
}

export function isDirConfigFile(filename: string) {
  return /config\.ya?ml$/i.test(path.basename(filename));
}

export function isURL(s: string) {
  try {
    return !!new URL(s);
  } catch {
    return false;
  }
}

export function inTheDir(dir: string, dir2: string) {
  return !path.relative(dir, dir2).startsWith('.');
}

export function isSomeContent(filePath: string, content: string) {
  return fs.existsSync(filePath) && content === fs.readFileSync(filePath, 'utf-8');
}

export function inspectObject(obj: any) {
  console.log(util.inspect(obj, { colors: true, depth: null }));
}
