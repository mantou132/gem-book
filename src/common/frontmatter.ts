export interface Hero {
  title: string;
  desc: string;
  actions: { text: string; link: string }[];
}

export interface Feature {
  icon?: string;
  title: string;
  desc: string;
}

export interface FrontMatter {
  title?: string;
  isNav?: boolean;
  navTitle?: string;
  sidebarIgnore?: boolean;
  // home page
  hero?: Hero;
  features?: Feature[];
}
