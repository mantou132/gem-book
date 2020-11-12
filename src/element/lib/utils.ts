import { history } from '@mantou/gem';

import { NavItem } from '../../common/config';
import { parseFilename } from '../../common/utils';

export type NavItemWithOriginLink = NavItem & { originLink?: string };
export type NavItemWithLink = NavItem & { originLink: string; link: string };

export function capitalize(s: string) {
  return s.replace(/^\w/, (s: string) => s.toUpperCase());
}

export function flatNav(nav: NavItem[]): NavItemWithLink[] {
  return nav
    .map((item) => {
      if (item.link) return item as NavItemWithLink;
      if (item.children) return flatNav(item.children);
      return [];
    })
    .flat();
}

export function getMdPath(link: string, lang?: string) {
  const { pathname } = new URL(link, location.origin);
  const langPath = lang ? `/${lang}` : '';
  if (pathname.endsWith('/')) {
    return `${history.basePath}${langPath}${pathname}README.md`;
  } else {
    return `${history.basePath}${langPath}${pathname}.md`;
  }
}

export function isSameOrigin(link: string) {
  const { origin } = new URL(link, location.origin);
  return origin === location.origin;
}

export function removeLinkRank(link: string) {
  const parts = link.split('/');
  return parts.map((part) => parseFilename(part).title).join('/');
}
