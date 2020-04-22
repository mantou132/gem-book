import { html, GemElement, customElement, property, attribute } from '@mantou/gem';

import '@mantou/gem/elements/title';
import '@mantou/gem/elements/route';
import { RouteItem } from '@mantou/gem/elements/route';

import './elements/nav';
import './elements/sidebar';
import './elements/main';
import './elements/footer';
import './elements/edit-link';
import './elements/rel-link';
import { flatNav, capitalize } from './lib/utils';

type State = { config: BookConfig | undefined };

/**
 * @custom-element gem-book
 * @prop {BookConfig} config
 * @attr src
 */
@customElement('gem-book')
export class Book extends GemElement<State> {
  @property config: BookConfig | undefined;
  @attribute src: string;

  state: State = {
    config: undefined, // `src` generate
  };

  constructor(config: BookConfig) {
    super();
    this.config = config;
  }

  render() {
    const config = this.config || this.state.config;
    if (!config) return null;
    const { icon = '', sidebar, nav, github = '', sourceBranch = 'master', sourceDir = '', title = '' } = config;

    const hasNavbar = icon || title || nav;

    const links = flatNav(sidebar);

    const routes: RouteItem[] = links.map(({ title: pageTitle, link }) => ({
      title: `${capitalize(pageTitle)} - ${title}`,
      pattern: new URL(link as string, location.origin).pathname,
      content: html`
        <gem-book-main link=${link as string}></gem-book-main>
      `,
    }));

    if (!routes.some(({ pattern }) => pattern === '/')) {
      const firstRoutePath = routes[0].pattern;
      routes.unshift({
        pattern: '/',
        redirect: firstRoutePath,
      });
    }

    return html`
      <style>
        :host {
          --accent-color: #009688;
          --page-background: #fff;
          --header-background: #fff;
          --header-text-color: var(--text-color);
          --text-color: #000;
          --link-color: var(--accent-color);
          --sidebar-width: 230px;
          --sidebar-background: var(--page-background);
          --sidebar-link-color: #444;
          --sidebar-link-active-color: #000;
          --sidebar-link-arrow-color: #999;
          --main-width: 780px;
          --main-background: var(--page-background);
          --border-color: #eaeaea;
          --header-height: 55px;
          --code-font: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace;
          --tip-color: rgb(6, 125, 247);
          --success-color: #42b983;
          --warning-color: #ff9800;
          --danger-color: rgb(255, 0, 31);
          --nav-link-color: #2c3e50;
          --nav-link-border-color: var(--accent-color);
          --code-block-background: #011627;
          --code-block-text-color: white;
          --code-block-shadow-color: #333;
          --code-block-shadow-width: 0px;
          --highlighted-line-background: #022a4b;
          --highlighted-line-border-color: #ffa7c4;
          --inline-code-color: rgb(116, 66, 16);
          --inline-code-background: rgb(254, 252, 191);
          --loader-primary-color: #f3f3f3;
          --loader-secondary-color: #ecebeb;
          --table-header-background: #fafafa;
          --table-header-color: #666;
          --docute-select-height: 38px;
          --search-icon-color: #999;
          --search-focus-border-color: #ccc;
          --search-focus-icon-color: #333;
          --search-result-hover-background: #f9f9f9;
        }
        :host {
          display: grid;
          grid-template-areas: 'left aside content right';
          grid-template-columns: auto var(--sidebar-width) var(--main-width) auto;
          grid-column-gap: 3rem;
          text-rendering: optimizeLegibility;
          font: 16px/1.7 -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans,
            Droid Sans, Helvetica Neue, sans-serif;
          color: var(--text-color);
        }
        .nav-shadow {
          grid-area: 1 / left / 1 / right;
          background: white;
          border-bottom: 1px solid var(--border-color);
        }
        .nav-shadow,
        gem-book-nav {
          position: sticky;
          top: 0;
          z-index: 3;
        }
        .nav-shadow ~ gem-book-sidebar {
          margin-top: var(--header-height);
          top: var(--header-height);
        }
      </style>
      ${hasNavbar
        ? html`
            <div class="nav-shadow"></div>
          `
        : null}
      <gem-book-nav tl=${title} .nav=${nav} icon=${icon} github=${github}></gem-book-nav>
      <gem-book-sidebar .sidebar=${sidebar}></gem-book-sidebar>
      <gem-route .routes=${routes}></gem-route>
      ${github
        ? html`
            <gem-book-edit-link
              github=${github}
              source-branch=${sourceBranch}
              srouce-dir=${sourceDir}
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
  }
}
