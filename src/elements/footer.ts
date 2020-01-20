import { html, GemElement, customElement } from '@mantou/gem';

@customElement('gem-book-footer')
export class Footer extends GemElement {
  render() {
    return html`
      © 2020 Developed by ${'<gem-book>'}. Released under MIT license.
    `;
  }
}
