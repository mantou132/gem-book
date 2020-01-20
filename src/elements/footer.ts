import { html, GemElement, customElement } from '@mantou/gem';

@customElement('gem-book-footer')
export class Footer extends GemElement {
  render() {
    return html`
      <style>
        :host {
          grid-area: auto / content;
          padding: 2rem 0;
          margin-block-start: 6rem;
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
      © 2020 Developed by
      ${html`
        <gem-link href="https://github.com/mantou132/gem-book">${'<gem-book>'}</gem-link>
      `}.
      Released under MIT license.
    `;
  }
}
