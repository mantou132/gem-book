import { html, GemElement, customElement, connectStore, attribute } from '@mantou/gem';
import '@mantou/gem/elements/link';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { selfI18n } from '../helper/i18n';
import { theme } from '../helper/theme';
import { mdRender } from './main';

@customElement('gem-book-footer')
@connectStore(selfI18n.store)
export class Footer extends GemElement {
  @attribute footer: string;
  render() {
    return html`
      <style>
        :host {
          display: block;
          padding: 2rem 0;
          margin-top: 6rem;
          border-top: 1px solid ${theme.borderColor};
          font-style: italic;
          line-height: 1.5;
          color: rgba(${theme.textColorRGB}, 0.5);
        }
        @media ${mediaQuery.PHONE} {
          :host {
            margin: 0;
          }
        }
        gem-link {
          color: ${theme.textColor};
          border-bottom: 1px solid rgba(${theme.textColorRGB}, 0.3);
          text-decoration: none;
        }
        gem-link:hover {
          border-bottom: 1px solid;
        }
      </style>
      ${this.footer
        ? mdRender.unsafeRender(this.footer)
        : selfI18n.get('footer', (t) => html`<gem-link href="https://gem-book.js.org">&lt;${t}&gt;</gem-link>`)}
    `;
  }
}
