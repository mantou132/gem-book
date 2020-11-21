import { html, GemElement, customElement, property, attribute, connectStore, history } from '@mantou/gem';

import '@mantou/gem/elements/title';
import '@mantou/gem/elements/route';
import '@mantou/gem/elements/reflect';
import { RouteItem } from '@mantou/gem/elements/route';
import { I18n } from '@mantou/gem/helper/i18n';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { NavItem, BookConfig } from '../common/config';
import './elements/nav';
import './elements/sidebar';
import './elements/main';
import './elements/homepage';
import './elements/footer';
import './elements/edit-link';
import './elements/rel-link';
import { flatNav, capitalize, getLinkPath, NavItemWithOriginLink, NavItemWithLink, getMdPath } from './lib/utils';
import { selfI18n } from './helper/i18n';
import { theme, changeTheme, Theme } from './helper/theme';

const sharedConfig: Partial<BookConfig> = {};
class GemBookPluginElement extends GemElement {
  config = sharedConfig;
}

type State = { config: BookConfig | undefined };

/**
 * @custom-element gem-book
 * @prop {BookConfig} config
 * @attr src
 */
@customElement('gem-book')
@connectStore(history.store)
export class Book extends GemElement<State> {
  static GemBookPluginElement = GemBookPluginElement;

  @attribute src: string;

  @property config: BookConfig | undefined;
  @property theme: Partial<Theme> | undefined;

  state: State = {
    config: undefined, // `src` generate
  };

  constructor(config: BookConfig, theme?: Partial<Theme>) {
    super();
    this.config = config;
    this.theme = theme;
  }

  private getConfig() {
    return this.config || this.state.config;
  }

  private getI18nSidebar() {
    const config = this.getConfig();
    let sidebar: NavItem[] = [];
    let lang = '';
    let langlist: { code: string; name: string }[] = [];
    let languagechangeHandle = (_evt: CustomEvent<string>) => {
      //
    };
    if (config) {
      if (config.sidebar instanceof Array) {
        sidebar = config.sidebar;
      } else {
        const sidebarConfig = config.sidebar;
        langlist = Object.keys(config.sidebar).map((code) => ({ code, name: sidebarConfig[code].name }));
        const fallbackLanguage = langlist[0].code;
        const i18n = new I18n<any>({ fallbackLanguage, resources: sidebarConfig, cache: true });
        lang = i18n.currentLanguage;
        sidebar = sidebarConfig[lang].data;
        languagechangeHandle = async (evt: CustomEvent<string>) => {
          await i18n.setLanguage(evt.detail);
          this.update();
        };
      }
    }

    if (lang) {
      selfI18n.setLanguage(lang in selfI18n.resources ? lang : selfI18n.fallbackLanguage);
    }
    return { sidebar, lang, langlist, languagechangeHandle };
  }

  private getNav(sidebar: NavItem[]) {
    const config = this.getConfig();
    const nav: NavItem[] = [];
    const traverseSidebar = (items: NavItem[]) => {
      items.forEach((item) => {
        if (item.isNav) {
          nav.push(item);
        } else if (item.children) {
          traverseSidebar(item.children);
        }
      });
    };
    traverseSidebar(sidebar);
    return nav.concat(config?.nav || []);
  }

  private getRouter(links: NavItemWithLink[], title: string, lang: string) {
    const config = this.getConfig();
    const routes: RouteItem[] = [];
    links.forEach(({ title: pageTitle, link, originLink }) => {
      const route = {
        title: `${capitalize(pageTitle)} - ${title}`,
        pattern: link,
        content: html`
          <gem-book-main lang=${lang} link=${originLink} ?display-rank=${config?.displayRank}></gem-book-main>
        `,
      };
      routes.push(route);
      if (link !== originLink) {
        routes.push({
          pattern: originLink,
          redirect: link,
        });
      }
      if (route.pattern.endsWith('/')) {
        routes.push({
          pattern: `${route.pattern}README`,
          redirect: route.pattern,
        });
      }
    });

    if (!routes.some(({ pattern }) => pattern === '/')) {
      const firstRoutePath = routes[0].pattern;
      routes.push({
        pattern: '/',
        redirect: firstRoutePath,
      });
    }

    routes.push({
      pattern: '*',
      redirect: '/',
    });

    return routes;
  }

  private processSidebar(sidebar: NavItem[]) {
    const config = this.getConfig();
    const process = (item: NavItem): NavItemWithOriginLink => {
      return {
        ...item,
        link: item.link && getLinkPath(item.link, config?.displayRank),
        originLink: item.link,
        children: item.children?.map(process),
      };
    };
    return sidebar.map(process);
  }

  private getHomePage(links: RouteItem[]) {
    const link = links.find((e) => e.pattern === '/');
    if (!link) return '';
    return link.redirect || link.pattern;
  }

  changeTheme = changeTheme;

  render() {
    const config = this.getConfig();
    if (!config) return null;

    const { icon = '', github = '', sourceBranch, sourceDir = '', title = '', homeMode, displayRank } = config;
    const { sidebar, lang, langlist, languagechangeHandle } = this.getI18nSidebar();
    const sidebarResult = this.processSidebar(sidebar);
    const nav = this.getNav(sidebarResult);
    const hasNavbar = icon || title || nav.length;
    const links = flatNav(sidebarResult);
    const routes = this.getRouter(links, title, lang);
    const refLinks = links.filter((e) => e.sidebarIgnore !== true);
    const homePage = this.getHomePage(routes);
    const renderHomePage = homeMode && homePage === history.getParams().path;

    return html`
      <gem-reflect>
        ${links
          .filter((e) => !e.originLink.startsWith('#'))
          .map(({ originLink }) => html`<link rel="prefetch" href=${getMdPath(originLink, lang)}></link>`)}
      </gem-reflect>
      <style>
        :host {
          display: grid;
          grid-template-areas: 'left aside content right';
          grid-template-columns: auto ${theme.sidebarWidth} minmax(auto, ${theme.mainWidth}) auto;
          /* how to remove next line? */
          grid-template-rows: repeat(4, auto) 1fr;
          grid-column-gap: 3rem;
          text-rendering: optimizeLegibility;
          font: 16px/1.7 ${theme.font};
          color: ${theme.textColor};
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          background: ${theme.backgroundColor};
        }
        .nav-shadow {
          grid-area: 1 / left / 2 / right;
          background: ${theme.backgroundColor};
          border-bottom: 1px solid ${theme.borderColor};
        }
        .nav-shadow,
        gem-book-nav {
          position: sticky;
          top: 0;
          z-index: 3;
        }
        .nav-shadow ~ gem-book-sidebar {
          margin-top: ${theme.headerHeight};
          top: ${theme.headerHeight};
        }
        gem-book-sidebar {
          /* how to span all row? */
          grid-area: 1 / aside / 6 / aside;
        }
        gem-book-nav {
          grid-area: 1 / aside / 2 / content;
        }
        gem-light-route,
        gem-book-edit-link,
        gem-book-rel-link,
        gem-book-footer {
          grid-area: auto / content;
        }
        gem-light-route {
          margin: 0 -3rem;
          padding: 0 3rem;
        }
        gem-book-main {
          max-width: calc(100vw - 9rem - ${theme.sidebarWidth});
        }
        @media ${renderHomePage ? 'all' : 'not all'} {
          gem-light-route {
            display: flex;
            justify-content: center;
          }
          gem-book-main {
            max-width: min(${theme.mainWidth}, 100vw);
          }
          gem-book-homepage {
            grid-area: auto / left / auto / right;
          }
          gem-light-route,
          gem-book-footer {
            grid-area: auto / aside / auto / content;
          }
          gem-book-sidebar,
          gem-book-edit-link,
          gem-book-rel-link {
            display: none;
          }
          gem-book-footer {
            text-align: center;
          }
        }
        @media ${mediaQuery.PHONE} {
          .nav-shadow ~ gem-book-sidebar {
            margin-top: 0;
          }
          :host {
            grid-column-gap: 1rem;
            grid-template-areas: 'left content right';
            grid-template-columns: 0 1fr auto;
          }
          gem-light-route {
            margin: 0 -1rem;
            padding: 0 1rem;
          }
          gem-book-main {
            max-width: calc(100vw - 2rem);
          }
          gem-book-sidebar,
          gem-book-edit-link,
          gem-book-rel-link,
          gem-book-footer,
          gem-light-route {
            grid-area: auto / content;
          }
          gem-book-nav {
            grid-area: 1 / content / 2 / content;
          }
          gem-book-footer {
            text-align: left;
          }
        }
      </style>
      ${hasNavbar
        ? html`
            <div class="nav-shadow"></div>
            <gem-book-nav tl=${title} .nav=${nav} icon=${icon} github=${github}></gem-book-nav>
          `
        : null}
      ${renderHomePage ? html`<gem-book-homepage .displayRank=${displayRank}></gem-book-homepage>` : ''}
      <gem-light-route .key=${lang} .routes=${routes}></gem-light-route>
      ${github && sourceBranch
        ? html`
            <gem-book-edit-link
              github=${github}
              source-branch=${sourceBranch}
              srouce-dir=${sourceDir}
              lang=${lang}
              .links=${links}
            ></gem-book-edit-link>
          `
        : null}
      <gem-book-sidebar
        @languagechange=${languagechangeHandle}
        lang=${lang}
        .homePage=${homeMode ? homePage : ''}
        .langlist=${langlist}
        .sidebar=${sidebarResult}
      ></gem-book-sidebar>
      <gem-book-rel-link .links=${refLinks}></gem-book-rel-link>
      <gem-book-footer></gem-book-footer>
    `;
  }

  mounted() {
    this.effect(
      async () => {
        if (this.src && !this.config) {
          const config = await (await fetch(this.src)).json();
          this.setState({ config });
        }
      },
      () => [this.src],
    );
    this.effect(
      ([config]) => {
        if (config) Object.assign(sharedConfig, config);
      },
      () => [this.getConfig()],
    );
    this.effect(
      () => {
        this.changeTheme(this.theme);
      },
      () => [this.theme],
    );
  }
}
