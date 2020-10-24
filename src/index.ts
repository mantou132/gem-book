import { html, GemElement, customElement, property, attribute } from '@mantou/gem';

import '@mantou/gem/elements/title';
import '@mantou/gem/elements/route';
import { RouteItem } from '@mantou/gem/elements/route';
import { I18n } from '@mantou/gem/helper/i18n';

import './elements/nav';
import './elements/sidebar';
import './elements/main';
import './elements/footer';
import './elements/edit-link';
import './elements/rel-link';
import { flatNav, capitalize } from './lib/utils';
import { selfI18n } from './helper/i18n';
import { theme, changeTheme, Theme } from './helper/theme';

type State = { config: BookConfig | undefined };

/**
 * @custom-element gem-book
 * @prop {BookConfig} config
 * @attr src
 */
@customElement('gem-book')
export class Book extends GemElement<State> {
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
    const nav = config?.nav || [];
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
    return nav;
  }

  changeTheme = changeTheme;

  render() {
    const config = this.getConfig();
    if (!config) return null;
    const { icon = '', github = '', sourceBranch, sourceDir = '', title = '' } = config;
    const { sidebar, lang, langlist, languagechangeHandle } = this.getI18nSidebar();
    const nav = this.getNav(sidebar);
    const hasNavbar = icon || title || nav.length;
    const links = flatNav(sidebar);

    const routes: RouteItem[] = links.map(({ title: pageTitle, link }) => ({
      title: `${capitalize(pageTitle)} - ${title}`,
      pattern: new URL(link, location.origin).pathname,
      content: html`<gem-book-main lang=${lang} link=${link}></gem-book-main>`,
    }));

    if (!routes.some(({ pattern }) => pattern === '/')) {
      const firstRoutePath = routes[0].pattern;
      routes.unshift({
        pattern: '/',
        redirect: firstRoutePath,
      });
    }

    routes.push({
      pattern: '*',
      redirect: '/',
    });

    return html`
      <style>
        :host {
          display: grid;
          grid-template-areas: 'left aside content right';
          grid-template-columns: auto ${theme.sidebarWidth} ${theme.mainWidth} auto;
          grid-column-gap: 3rem;
          text-rendering: optimizeLegibility;
          font: 16px/1.7 ${theme.font};
          color: ${theme.textColor};
        }
        .nav-shadow {
          grid-area: 1 / left / 1 / right;
          background: white;
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
      </style>
      ${hasNavbar ? html`<div class="nav-shadow"></div>` : null}
      <gem-book-nav tl=${title} .nav=${nav} icon=${icon} github=${github}></gem-book-nav>
      <gem-book-sidebar
        @languagechange=${languagechangeHandle}
        lang=${lang}
        .langlist=${langlist}
        .sidebar=${sidebar}
      ></gem-book-sidebar>
      <gem-route .key=${lang} .routes=${routes}></gem-route>
      ${github && sourceBranch
        ? html`
            <gem-book-edit-link
              github=${github}
              source-branch=${sourceBranch}
              srouce-dir=${sourceDir}
              lang=${lang}
            ></gem-book-edit-link>
          `
        : null}
      <gem-book-rel-link .links=${links}></gem-book-rel-link>
      <gem-book-footer></gem-book-footer>
    `;
  }

  mounted() {
    this.effect(
      async () => {
        if (this.src && !this.config) {
          const res = await fetch(this.src);
          this.setState({ config: await res.json() });
        }
      },
      () => [this.src],
    );
    this.effect(
      () => {
        this.changeTheme(this.theme);
      },
      () => [this.theme],
    );
  }
}
