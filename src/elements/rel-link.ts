import { html, GemElement, customElement, history, connectStore, property } from '@mantou/gem';

import '@mantou/gem/elements/link';

@customElement('gem-book-rel-link')
@connectStore(history.store)
export class RelLink extends GemElement {
  @property links: (NavItem & { link: string })[];

  render() {
    const { path } = history.getParams();
    const index = this.links.findIndex(({ link }) => link === path);
    const prev = this.links[index - 1];
    const next = this.links[index + 1];
    return html`
      ${prev || next
        ? html`
            <style>
              :host {
                padding: 2rem 0;
                display: flex;
                justify-content: space-between;
                grid-area: auto / content;
                border-block-start: 1px solid gray;
              }
              gem-link {
                color: green;
                text-decoration: none;
              }
              gem-link:hover {
                text-decoration: underline;
              }
            </style>
          `
        : null}
      ${prev
        ? html`
            <gem-link path=${prev.link}>${prev.title}</gem-link>
          `
        : null}
      ${next
        ? html`
            <gem-link path=${next.link}>${next.title}</gem-link>
          `
        : null}
    `;
  }
}
