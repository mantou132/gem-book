import { html, GemElement, customElement, property } from '@mantou/gem';

import '@mantou/gem/elements/title';
import '@mantou/gem/elements/route';

import './elements/nav';
import './elements/sidebar';
import './elements/main';
import './elements/footer';
import './elements/edit-link';
import './elements/rel-link';
import { flatNav } from './lib/utils';

@customElement('gem-book')
export class Book extends GemElement {
  @property config: BookConfig;

  constructor(config: BookConfig) {
    super();
    this.config = config;
  }

  render() {
    if (!this.config) console.log(this);
    const { sidebar, nav, github = '', sourceDir = '', title } = this.config;

    const links = flatNav(sidebar);

    const routes = links.map(({ title: pageTitle, link }) => ({
      title: `${pageTitle} - ${title}`,
      pattern: new URL(link as string, location.origin).pathname,
      content: html`
        <gem-book-main link=${link}></gem-book-main>
      `,
    }));

    return html`
      <style>
        :host {
          --accent-color: #009688;
          --page-background: #fff;
          --header-background: #fff;
          --header-text-color: var(--text-color);
          --text-color: #000;
          --link-color: var(--accent-color);
          --sidebar-width: 280px;
          --sidebar-background: var(--page-background);
          --sidebar-link-color: #444;
          --sidebar-link-active-color: #000;
          --sidebar-link-arrow-color: #999;
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
          text-rendering: optimizeLegibility;
          font: 16px/1.7 -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans,
            Droid Sans, Helvetica Neue, sans-serif;
          display: grid;
          grid-template-areas: 'left aside content right';
          grid-template-columns: auto 250px 800px auto;
          grid-column-gap: 1.5rem;
          color: var(--text-color);
        }
        .nav-shadow {
          grid-area: 1 / left / 1 / right;
          background: white;
          border-block-end: 1px solid var(--border-color);
        }
        .nav-shadow,
        gem-book-nav {
          position: sticky;
          top: 0;
          z-index: 3;
        }
      </style>
      ${nav || github
        ? html`
            <div class="nav-shadow"></div>
            <gem-book-nav tl=${title} .nav=${nav} github=${github}></gem-book-nav>
          `
        : null}
      <gem-book-sidebar .sidebar=${sidebar}></gem-book-sidebar>
      <gem-route .routes=${routes}></gem-route>
      ${github
        ? html`
            <gem-book-edit-link github=${github} srouce-dir=${sourceDir}></gem-book-edit-link>
          `
        : null}
      <gem-book-rel-link .links=${links}></gem-book-rel-link>
      <gem-book-footer></gem-book-footer>
    `;
  }
}
