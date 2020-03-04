interface NavItem {
  title: string;
  link?: string;
  children?: NavItem[]; // dropdown menu
}

interface BookConfig {
  icon: string;
  title: string;
  sidebar: NavItem[];
  nav?: NavItem[];
  github?: string;
  sourceDir?: string;
  sourceBranch?: string;
}
