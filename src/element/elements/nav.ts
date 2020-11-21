import { html, GemElement, customElement, attribute, property } from '@mantou/gem';

import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';
import { NavItem } from '../../common/config';
import { theme } from '../helper/theme';
import { capitalize, isSameOrigin } from '../lib/utils';
import { container } from './icons';

/**
 * @attr tl
 * @attr icon
 * @attr github
 */
@customElement('gem-book-nav')
export class Nav extends GemElement {
  @attribute tl: string;
  @attribute github: string;
  @attribute icon: string;
  @property nav: NavItem[] | undefined;

  renderItem = ({ navTitle, title, link }: NavItem) => {
    if (link) {
      return html`
        <gem-active-link href=${link} pattern=${`${link}*`}>
          ${capitalize(navTitle || title)}
          ${isSameOrigin(link) ? null : html`<gem-use .root=${container} selector="#link"></gem-use>`}
        </gem-active-link>
      `;
    }
  };

  render() {
    const githubLink = this.github ? this.renderItem({ title: 'github', link: this.github }) : null;

    return html`
      <style>
        :host {
          display: flex;
          line-height: ${theme.headerHeight};
          color: ${theme.textColor};
        }
        @media ${mediaQuery.PHONE} {
          gem-link,
          gem-active-link {
            font-size: 0.875em;
          }
        }
        gem-link,
        gem-active-link {
          position: relative;
          text-decoration: none;
          color: inherit;
        }
        .title {
          flex-grow: 1;
          display: flex;
        }
        .title gem-link {
          display: flex;
          font-size: 1.2rem;
          align-items: center;
        }
        .title img {
          --height: calc(0.8 * ${theme.headerHeight});
          height: var(--height);
          min-width: var(--height);
          object-fit: contain;
          transform: translateX(-10%);
        }
        gem-active-link + gem-active-link {
          margin-left: 1rem;
        }
        gem-active-link.active::after {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          background: currentColor;
          content: '';
          width: 100%;
        }
        gem-use {
          width: 15px;
          height: 15px;
        }
      </style>
      <div class="title">
        <gem-link path="/">${this.icon ? html`<img alt=${this.tl} src=${this.icon} />` : null}${this.tl}</gem-link>
      </div>
      ${this.nav ? this.nav.map(this.renderItem) : null} ${githubLink}
    `;
  }
}
