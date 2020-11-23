import {
  html,
  GemElement,
  customElement,
  attribute,
  property,
  emitter,
  Emitter,
  refobject,
  RefObject,
} from '@mantou/gem';

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
  @attribute lang: string;

  @property nav: NavItem[] | undefined;
  @property langlist: { code: string; name: string }[];

  @emitter languagechange: Emitter<string>;

  @refobject i18nRef: RefObject<HTMLSelectElement>;

  renderI18nSet = () => {
    if (this.lang) {
      const name = this.langlist.find(({ code }) => code === this.lang)?.name;
      return html`
        <div class="item">
          ${mediaQuery.isPhone ? '' : name || this.lang}
          <gem-use @click=${() => this.i18nRef.element?.click()} .root=${container} selector="#i18n"></gem-use>
          <select
            class="i18n-select"
            ref=${this.i18nRef.ref}
            @change=${(e: any) => this.languagechange(e.target.value, { bubbles: true, composed: true })}
          >
            ${this.langlist.map(
              ({ name, code }) => html`<option value=${code} ?selected=${code === this.lang}>${name}</option>`,
            )}
          </select>
        </div>
      `;
    }
  };

  renderItem = ({ navTitle, title, link }: NavItem) => {
    if (link) {
      const external = !isSameOrigin(link);
      return html`
        <gem-active-link class="${external ? 'external' : ''} item" href=${link} pattern=${`${link}*`}>
          ${capitalize(navTitle || title)}
          ${external ? html`<gem-use .root=${container} selector="#link"></gem-use>` : null}
        </gem-active-link>
      `;
    }
  };

  render() {
    const githubLink = this.github ? this.renderItem({ title: 'github', link: this.github }) : null;
    const internals = this.nav?.filter((e) => isSameOrigin(e.link || '')) || [];
    const externals = this.nav?.filter((e) => !isSameOrigin(e.link || '')) || [];

    return html`
      <style>
        :host {
          --height: ${theme.headerHeight};
          display: flex;
          line-height: var(--height);
          color: ${theme.textColor};
        }
        gem-link,
        gem-active-link {
          text-decoration: none;
          color: inherit;
        }
        .item {
          display: flex;
          align-items: center;
          position: relative;
          cursor: pointer;
        }
        .item gem-use {
          margin-left: 0.3rem;
        }
        .i18n-select {
          width: 100%;
          cursor: pointer;
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          opacity: 0;
        }
        .title {
          flex-grow: 1;
          display: flex;
        }
        .homelink {
          margin-right: 3rem;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .homelink ~ .item {
          font-weight: 300;
          padding: 0 1rem;
        }
        .title img {
          height: calc(0.8 * var(--height));
          min-width: calc(0.8 * var(--height));
          object-fit: contain;
          transform: translateX(-10%);
        }
        .item + .item {
          margin-left: 1rem;
        }
        gem-active-link:hover,
        gem-active-link.active {
          color: ${theme.linkColor};
        }
        gem-active-link.active::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 3px;
          background: currentColor;
          width: 100%;
        }
        gem-use {
          width: 15px;
          height: 15px;
        }
        @media ${mediaQuery.PHONE} {
          :host {
            --height: calc(0.875 * ${theme.headerHeight});
          }
          .homelink {
            margin-right: 0;
          }
          .homelink ~ .item {
            padding: 0 0.3rem;
          }
          .external {
            display: none;
          }
        }
      </style>
      <div class="title">
        <gem-link class="item homelink" path="/">
          ${this.icon ? html`<img alt=${this.tl} src=${this.icon} />` : null}
          ${mediaQuery.isPhone && this.icon && Number(this.nav?.length) >= 2 ? '' : this.tl}
        </gem-link>
        ${internals.map(this.renderItem)}
      </div>
      ${externals.map(this.renderItem)} ${githubLink} ${this.renderI18nSet()}
    `;
  }
}
