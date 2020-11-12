import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import '@mantou/gem/elements/link';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { selfI18n } from '../helper/i18n';
import { theme } from '../helper/theme';

@customElement('gem-book-footer')
@connectStore(selfI18n.store)
export class Footer extends GemElement {
  render() {
    return html`
      <style>
        :host {
          display: block;
          grid-area: auto / content;
          padding: 2rem 0;
          margin-top: 6rem;
          border-top: 1px solid ${theme.borderColor};
          font-style: italic;
        }
        @media ${mediaQuery.PHONE} {
          :host {
            margin: 0;
          }
        }
        gem-link {
          color: ${theme.linkColor};
          text-decoration: none;
        }
        gem-link:hover {
          text-decoration: underline;
        }
      </style>
      ${selfI18n.get(
        'footer',
        (t) => html`<gem-link href="https://github.com/mantou132/gem-book">&lt;${t}&gt;</gem-link>`,
      )}
    `;
  }
}
