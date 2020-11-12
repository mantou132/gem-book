import path from 'path';
import fs from 'fs';
import gitRemoteOriginUrl from 'git-remote-origin-url';
import parseGithub from 'parse-github-url';
import { JSDOM } from 'jsdom';
import marked from 'marked';
import fm from 'front-matter';
import YAML from 'yaml';

import { NavItem } from '../common/config';

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

export function getFilename(fullPath: string) {
  const basename = path.basename(fullPath);
  const extname = path.extname(fullPath);
  return basename.replace(extname, '');
}

interface FileMetadata {
  headings?: NavItem[];
  title: string;
  isNav?: boolean;
  navTitle?: string;
  sidebarIgnore?: boolean;
}

export function getMetadata(fullPath: string): FileMetadata {
  const getTitle = (p: string) => getFilename(p).replace(/^\d*-/, '');
  const parseMd = (fullPath: string) => {
    const md = fs.readFileSync(fullPath, 'utf8');
    const { attributes, body } = fm<FileMetadata>(md);
    const html = marked(body);
    const { window } = new JSDOM(html);
    const h1 = window.document.querySelector('h1');
    const h2s = window.document.querySelectorAll('h2');
    return {
      ...(attributes as FileMetadata),
      title: attributes.title || h1?.textContent || getTitle(fullPath),
      headings: h2s.length
        ? [...h2s].map((heading) => ({
            title: heading.textContent as string,
            link: `#${heading.id}`,
          }))
        : undefined,
    };
  };

  if (fs.statSync(fullPath).isDirectory()) {
    const files = fs.readdirSync(fullPath);
    const result = {
      title: getTitle(fullPath),
    };
    if (files.includes('config.yml')) {
      const config = YAML.parse(fs.readFileSync(path.join(fullPath, 'config.yml'), 'utf-8'));
      return {
        ...result,
        ...config,
      };
    } else {
      return result;
    }
  } else {
    if (path.extname(fullPath) === '.md') {
      return parseMd(fullPath);
    }
  }
  return { title: '' };
}
