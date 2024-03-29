import { connect, createStore, html, updateStore } from '@mantou/gem';
import { RouteItem } from '@mantou/gem/elements/route';
import { I18n } from '@mantou/gem/helper/i18n';
import { BookConfig, NavItem } from '../common/config';
import { selfI18n } from './helper/i18n';
import { getLinkPath, getUserLink, NavItemWithLink, flatNav, capitalize } from './lib/utils';

import { GemBookElement } from '.';

import './elements/main';
import './elements/404';

interface CurrentBookConfig {
  config: BookConfig;

  links: NavItemWithLink[];
  nav: NavItem[];
  routes: RouteItem[];

  lang: string;
  langList: { code: string; name: string }[];
  languagechangeHandle: (_: string) => void;
  currentSidebar: NavItemWithLink[];
  homePage: string;
  currentLinks: NavItemWithLink[];
  getCurrentLink: () => NavItemWithLink;
}

export const bookStore = createStore<Partial<CurrentBookConfig>>({});

function getI18nSidebar(config: BookConfig | undefined) {
  let sidebar: NavItem[] = [];
  let lang = '';
  let langList: { code: string; name: string }[] = [];
  let languagechangeHandle = (_lang: string) => {
    //
  };
  if (config) {
    if (config.sidebar instanceof Array) {
      sidebar = config.sidebar;
    } else {
      const sidebarConfig = config.sidebar;
      langList = Object.keys(config.sidebar).map((code) => ({ code, name: sidebarConfig[code].name }));
      const fallbackLanguage = langList[0].code;
      // detect language
      const i18n = new I18n<any>({ fallbackLanguage, resources: sidebarConfig, cache: true, urlParamsType: 'path' });
      lang = i18n.currentLanguage;
      history.basePath = `/${lang}`;
      sidebar = sidebarConfig[lang].data;
      languagechangeHandle = async (lang: string) => {
        const { path, query, hash } = history.getParams();
        // will modify `history.getParams()`
        history.basePath = `/${lang}`;
        await i18n.setLanguage(lang);
        // Use custom anchors id to ensure that the hash is correct after i18n switching
        history.replace({ path, query, hash });
      };
    }
  }

  if (lang) {
    selfI18n.setLanguage(lang in selfI18n.resources ? lang : selfI18n.fallbackLanguage);
  }
  return { sidebar, lang, langList, languagechangeHandle };
}

function processSidebar(sidebar: NavItem[], displayRank: boolean | undefined) {
  const process = (item: NavItem): NavItemWithLink => {
    return {
      ...item,
      // /guide/
      link: item.link && getUserLink(item.link, displayRank),
      // /guide/readme
      userFullPath: item.link && getLinkPath(item.link, displayRank),
      originLink: item.link,
      children: item.children?.map(process),
    } as NavItemWithLink;
  };
  return sidebar.map(process);
}

function getNav(sidebar: NavItem[], origin: NavItem[]) {
  const nav: NavItem[] = [];
  const traverseSidebar = (items: NavItem[]) => {
    items.forEach((item) => {
      if (item.isNav) {
        if (item.type === 'file' || (item.type === 'dir' && item.children?.length)) {
          nav.push(item);
        }
      } else if (item.children) {
        traverseSidebar(item.children);
      }
    });
  };
  traverseSidebar(sidebar);
  return nav.concat(origin);
}

function getNavRoutes(nav: NavItem[]): RouteItem[] {
  return nav
    .filter(({ type, link, children }) => type === 'dir' && link !== children?.[0].link)
    .map(({ link, children }) => ({ pattern: link, redirect: children?.[0].link }));
}

function getRouter(links: NavItemWithLink[], title: string, lang: string, displayRank: boolean | undefined) {
  const routes: RouteItem<NavItemWithLink>[] = [];
  links.forEach((item) => {
    const { title: pageTitle, link, userFullPath, originLink } = item;
    const routeTitle = `${capitalize(pageTitle)}${pageTitle ? ' - ' : ''}${title}`;
    const routeContent = html`
      <gem-book-main role="article" lang=${lang} link=${originLink} ?display-rank=${displayRank}></gem-book-main>
    `;

    routes.push({
      title: routeTitle,
      pattern: link,
      content: routeContent,
      data: item,
    });

    if (userFullPath !== link) {
      // /xxx/readme => /xxx/
      routes.push({
        pattern: userFullPath,
        redirect: link,
      });
    }

    if (!displayRank) {
      // /001-x/001-xxx => /x/xxx
      const path = getLinkPath(originLink, true);
      if (path !== link) {
        routes.push({
          pattern: path,
          redirect: link,
        });
      }
    }
  });

  if (!routes.some(({ pattern }) => pattern === '/')) {
    const firstRoutePath = routes.find(({ pattern }) => !!pattern)?.pattern;
    if (firstRoutePath) {
      routes.push({
        pattern: '/',
        redirect: firstRoutePath,
      });
    }
  }

  routes.push({
    pattern: '*',
    content: html`<gem-book-404 role="region" aria-label="not found"></gem-book-404>`,
  });

  return routes;
}
// 如果当前路径在 isNav 的目录中，则只返回 isNav 目录内容
// 如果当前路径不在 isNav 目录中，则返回除所有 isNav 目录的内容
// 不考虑嵌套 isNav 目录
function getCurrentSidebar(sidebar: NavItemWithLink[]) {
  const { path } = history.getParams();

  let currentNavNode: NavItemWithLink | undefined;
  let resultNavNode: NavItemWithLink | undefined;
  const resultWithoutNav: NavItemWithLink[] = [];

  const traverseSidebar = (items: NavItemWithLink[], result: NavItemWithLink[]) => {
    items.forEach((item) => {
      let tempNode: NavItemWithLink | undefined;
      if (!resultNavNode && currentNavNode && item.link === path && item.type === 'file') {
        resultNavNode = currentNavNode;
      }
      if (item.isNav && item.type === 'dir') {
        currentNavNode = item;
        tempNode = item;
      } else {
        result.push(item);
      }
      if (item.children) {
        item.children = traverseSidebar(item.children, []);
      }
      if (tempNode) {
        currentNavNode = undefined;
      }
    });
    return items;
  };
  traverseSidebar(sidebar, resultWithoutNav);
  return resultNavNode ? resultNavNode.children || [] : resultWithoutNav;
}

function getHomePage(links: RouteItem[]) {
  const link = links.find((e) => e.pattern === '/');
  if (!link) return '';
  return link.redirect || link.pattern;
}

export function updateBookConfig(config: BookConfig | undefined, gemBookElement?: GemBookElement) {
  const { sidebar, lang, langList, languagechangeHandle } = getI18nSidebar(config);
  const sidebarResult = processSidebar(sidebar, config?.displayRank);
  const links = flatNav(sidebarResult);
  const nav = getNav(sidebarResult, config?.nav || []);
  const routes = [...getNavRoutes(nav), ...getRouter(links, config?.title || '', lang, config?.displayRank)];
  const currentSidebar = getCurrentSidebar(sidebarResult);
  const homePage = getHomePage(routes);
  const currentLinks = flatNav(currentSidebar).filter(
    (e) => !e.sidebarIgnore && (!config?.homeMode || e.link !== homePage),
  );
  updateStore(bookStore, {
    config,
    links,
    nav,
    routes,
    lang,
    langList,
    languagechangeHandle,
    homePage,
    currentSidebar,
    currentLinks,
  });
  if (gemBookElement) {
    updateStore(bookStore, {
      getCurrentLink: () => {
        return gemBookElement?.routeRef.element?.currentRoute?.data as NavItemWithLink;
      },
    });
  }
}

connect(history.store, () => {
  updateBookConfig(bookStore.config);
});
