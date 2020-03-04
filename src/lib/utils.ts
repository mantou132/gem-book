import { history } from '@mantou/gem';

export function capitalize(s: string) {
  return s.replace(/^\w/, (s: string) => s.toUpperCase());
}

export function flatNav(nav: NavItem[]): NavItem[] {
  return nav
    .map((item: NavItem) => {
      return item.link ? item : item.children ? flatNav(item.children) : [];
    })
    .flat();
}

export function getMdPath(link: string) {
  const { pathname } = new URL(link, location.origin);
  if (pathname.endsWith('/')) {
    return `${history.basePath}${pathname}README.md`;
  } else {
    return `${history.basePath}${pathname}.md`;
  }
}

export function isSameOrigin(link: string) {
  const { origin } = new URL(link, location.origin);
  return origin === location.origin;
}
