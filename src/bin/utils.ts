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

import { NavItem } from '../common/config';
import { FrontMatter } from '../common/frontmatter';
import { isIndexFile, parseFilename } from '../common/utils';

// https://github.com/webpack/webpack/issues/4175#issuecomment-277232067
declare global {
  let __non_webpack_require__: (mod: string) => any;
}

export async function getGithubUrl() {
  const repoDir = process.cwd();
  try {
    const repoPkg = __non_webpack_require__(path.resolve(repoDir, './package.json'));
    const git = repoPkg?.repository?.url || (await gitRemoteOriginUrl(repoDir));
    const parsed = parseGithub(git);
    if (parsed?.repository) {
      return `https://github.com/${parsed.repository}`;
    }
  } catch {}
}

type FileMetadata = FrontMatter & {
  title: string;
  headings?: NavItem[];
};

export function getMetadata(fullPath: string, displayRank?: boolean): FileMetadata {
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
  } else {
    if (isMdfile(fullPath)) {
      return parseMd(fullPath);
    }
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
