import { FrontMatter } from './frontmatter';

export type NavItem = FrontMatter & {
  title: string;
  link: string;
  type?: 'dir' | 'file' | 'heading';
  children?: NavItem[];
};

export type SidebarConfig = NavItem[] | { [lang: string]: { name: string; data: NavItem[] } };

export interface BookConfig {
  // navbar icon absolute path
  icon: string;
  title: string;
  sidebar: SidebarConfig;
  nav?: NavItem[];
  github?: string;
  sourceDir?: string;
  sourceBranch?: string;
  displayRank?: boolean;
  homeMode?: boolean;
  footer?: string;
}
