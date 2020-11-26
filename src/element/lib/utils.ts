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
