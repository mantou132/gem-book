import path from 'path';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import marked from 'marked';
import fm from 'front-matter';
import YAML from 'yaml';

export function getGitUrl(git = '') {
  const matchResult = git.match(/^git@(.*):(.*)\/(.*)\.git/);
  if (matchResult) {
    const [, origin, user, repo] = matchResult;
    return `https://${origin}/${user}/${repo}`;
  }
  return '';
}

export function getFilename(fullPath: string) {
  const basename = path.basename(fullPath);
  const extname = path.extname(fullPath);
  return basename.replace(extname, '');
}

interface FileMetadata {
  title: string;
  isNav?: boolean;
  navTitle?: string;
  headings?: NavItem[];
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
        ? [...h2s].map(heading => ({
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
      return {
        ...result,
        ...YAML.parse(fs.readFileSync(path.join(fullPath, 'config.yml'), 'utf-8')),
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
