import { history } from '@mantou/gem';

export function capitalize(s: string) {
  return s.replace(/^\w/, (s: string) => s.toUpperCase());
}

export function flatNav(nav: NavItem[]): (NavItem & { link: string })[] {
  return nav
    .map((item: NavItem) => {
      if (item.link) return item as NavItem & { link: string };
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
