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
    const { sidebar, nav, github = '', title } = this.config;

    const links = flatNav(sidebar);

    const routes = links.map(({ title: pageTitle, link }) => ({
      title: `${pageTitle} - ${title}`,
      pattern: link,
      content: html`
        <gem-book-main link=${link}></gem-book-main>
      `,
    }));

    return html`
      <style>
        :host {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
            'Helvetica Neue', sans-serif;
          display: grid;
          grid-template-areas: 'left aside content right';
          grid-template-columns: auto 280px 900px auto;
        }
      </style>
      ${nav
        ? html`
            <gem-book-nav tl=${title} .nav=${nav} github=${github}></gem-book-nav>
          `
        : null}
      <gem-book-sidebar .sidebar=${sidebar}></gem-book-sidebar>
      <gem-route .routes=${routes}></gem-route>
      ${github
        ? html`
            <gem-book-edit-link github=${github}></gem-book-edit-link>
          `
        : null}
      <gem-book-rel-link .links=${links}></gem-book-rel-link>
      <gem-book-footer></gem-book-footer>
    `;
  }
}
