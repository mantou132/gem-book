import { history } from '@mantou/gem';
import { NavItem } from '../../common/config';
import { isIndexFile, parseFilename } from '../../common/utils';

export type NavItemWithLink = NavItem & {
  originLink: string;
  userFullPath: string;
  children?: NavItemWithLink[];
};

export function capitalize(s: string) {
  return s.replace(/^\w/, (s: string) => s.toUpperCase());
}

// type error
export function flatNav(nav: NavItem[]): NavItemWithLink[] {
  return nav
    .map((item) => {
      if (item.type === 'dir') return item.children ? flatNav(item.children) : [];
      return item as NavItemWithLink;
    })
    .flat();
}

export function getMdPath(originPath: string, lang?: string) {
  const langPath = lang ? `/${lang}` : '';
  return `${langPath}${originPath}`;
}

export function getAlternateUrl(lang: string) {
  const { origin } = location;
  const { path, query, hash } = history.getParams();
  return `${origin}/${lang}${path}${query}${hash}`;
}

export function isSameOrigin(link: string) {
  const { origin } = new URL(link, location.origin);
  return origin === location.origin;
}

// 001-xxx.md => /xxx
export function getLinkPath(originPath: string, displayRank?: boolean) {
  const path = encodeURI(originPath.replace(/\.md$/i, ''));
  return displayRank
    ? path
    : path
        .split('/')
        .map((part) => parseFilename(part).title)
        .join('/');
}

// /001-xxx.md => /xxx
// /readme.md => /
export function getUserLink(originPath: string, displayRank?: boolean) {
  const parts = originPath.split('/');
  const filename = parts.pop() || '';
  if (isIndexFile(filename)) {
    return getLinkPath(parts.join('/') + '/', displayRank);
  } else {
    return getLinkPath(originPath, displayRank);
  }
}

const scriptCache = new Map<string, Promise<unknown>>();
export async function loadScript(src: string) {
  if (scriptCache.has(src)) return scriptCache.get(src);
  const script = document.createElement('script');
  script.src = src;
  document.body.append(script);
  const promise = new Promise((res, rej) => {
    script.onload = res;
    script.onerror = rej;
  });
  scriptCache.set(src, promise);
  return promise;
}

const div = document.createElement('div');
export function escapeHTML(s: string) {
  div.textContent = s;
  return div.innerHTML;
}
