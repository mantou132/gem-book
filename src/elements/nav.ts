import { html, GemElement, customElement, attribute, property } from '@mantou/gem';

import '@mantou/gem/elements/link';
import { capitalize } from '../lib/utils';

/**
 * @attr tl
 * @attr github
 */
@customElement('gem-book-nav')
export class Nav extends GemElement {
  @attribute tl: string;
  @attribute github: string;
  @property nav: NavItem[];

  renderItem = ({ title, link }: NavItem) => {
    if (link) {
      return html`
        <gem-active-link href=${link} pattern=${`${link}*`}>${capitalize(title)}</gem-active-link>
      `;
    }
  };

  render() {
    const githubLink = this.github && this.renderItem({ title: 'github', link: this.github });

    return html`
      <style>
        :host {
          height: var(--header-height);
          line-height: var(--header-height);
          display: flex;
          grid-area: 1 / aside / 1 / content;
          color: var(--header-text-color);
        }
        gem-link,
        gem-active-link {
          position: relative;
          font-size: 1rem;
          text-decoration: none;
          color: inherit;
        }
        .title {
          flex-grow: 1;
          font-size: 1.2rem;
        }
        gem-active-link + gem-active-link {
          margin-inline-start: 1rem;
        }
        gem-active-link.active {
          color: var(--link-color);
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
      </style>
      <div class="title"><gem-link path="/">${this.tl}</gem-link></div>
      ${this.nav ? this.nav.map(this.renderItem) : null} ${githubLink}
    `;
  }
}
