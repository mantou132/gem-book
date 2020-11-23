export interface NavItem {
  title: string;
  link?: string;
  children?: NavItem[]; // dropdown menu
  isNav?: boolean;
  navTitle?: string;
  sidebarIgnore?: boolean;
}

export type SidebarConfig = NavItem[] | { [lang: string]: { name: string; data: NavItem[] } };

export interface BookConfig {
  icon: string;
  title: string;
  sidebar: SidebarConfig;
  nav?: NavItem[];
  github?: string;
  sourceDir?: string;
  sourceBranch?: string;
  i18n?: boolean;
  displayRank?: boolean;
  homeMode?: boolean;
  footer?: string;
}
