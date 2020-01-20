import { history } from '@mantou/gem';
export default function add(a: number, b: number) {
  return a + b;
}

export function capitalize(s: string) {
  return s.replace(/^\w/, (s: string) => s.toUpperCase());
}

export function flatNav(nav: NavItem[]): NavItem[] {
  return nav
    .map((item: NavItem) => {
      return item.children ? flatNav(item.children) : item;
    })
    .flat();
}

export function getMdPath(path: string) {
  if (path === '/') {
    return `${history.basePath}/README.md`;
  } else {
    return `${history.basePath}${path}.md`;
  }
}
