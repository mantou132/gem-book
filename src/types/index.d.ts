interface NavItem {
  title: string;
  link?: string;
  children?: NavItem[]; // dropdown menu
}

interface BookConfig {
  title: string;
  sidebar: NavItem[];
  nav?: NavItem[];
  github?: string;
  srouceDir?: string;
}
