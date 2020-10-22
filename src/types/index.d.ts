interface NavItem {
  title: string;
  link?: string;
  children?: NavItem[]; // dropdown menu
  isNav?: boolean;
  navTitle?: string;
  sidebarIgnore?: boolean;
}

type SidebarConfig = NavItem[] | { [lang: string]: { name: string; data: NavItem[] } };

interface BookConfig {
  icon: string;
  title: string;
  sidebar: SidebarConfig;
  nav?: NavItem[];
  github?: string;
  sourceDir?: string;
  sourceBranch?: string;
  i18n?: boolean;
}
