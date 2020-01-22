import path from 'path';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import marked from 'marked';

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

export function getMdTitle(fullPath: string) {
  // markdown h1
  const content = fs.readFileSync(fullPath, { encoding: 'utf8' });
  const html = marked(content);
  const dom = new JSDOM(html);
  const h1 = dom.window.document.querySelector('h1');
  if (h1?.textContent) {
    return h1.textContent;
  }
  return '';
}

export function getHeading(mdPath: string): NavItem[] {
  const content = fs.readFileSync(mdPath, { encoding: 'utf8' });
  const html = marked(content);
  const dom = new JSDOM(html);
  const titles = dom.window.document.querySelectorAll('h2');
  return [...titles].map(heading => ({
    title: heading.textContent as string,
    link: `#${heading.id}`,
  }));
}

// only support /README.md & *.md
export function getTitle(fullPath: string) {
  if (fs.statSync(fullPath).isDirectory()) {
    const files = fs.readdirSync(fullPath);
    if (files.includes('README.md')) {
      const title = getMdTitle(path.join(fullPath, 'README.md'));
      if (title) {
        return title;
      } else {
        return path.basename(path.dirname(fullPath));
      }
    }
  } else {
    if (path.extname(fullPath) === '.md') {
      const title = getMdTitle(fullPath);
      if (title) {
        return title;
      } else {
        return getFilename(fullPath);
      }
    }
  }
}
