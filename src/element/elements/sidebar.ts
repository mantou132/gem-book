import {
  html,
  GemElement,
  customElement,
  property,
  TemplateResult,
  history,
  connectStore,
  attribute,
  Emitter,
  emitter,
} from '@mantou/gem';
import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { NavItem } from '../../common/config';
import { container } from './icons';
import { capitalize } from '../lib/utils';
import { theme } from '../helper/theme';

@customElement('gem-book-sidebar')
@connectStore(history.store)
export class SideBar extends GemElement {
  @attribute lang: string;
  @attribute homePage: string;

  @property langlist: { code: string; name: string }[];
  @property sidebar: NavItem[];
  @emitter languagechange: Emitter<string>;

  toggleLinks = (e: MouseEvent) => {
    const ele = e.target as HTMLDivElement;
    ele.classList.toggle('close');
  };

  renderItem = ({ link, title, children, sidebarIgnore }: NavItem, isTop = false): TemplateResult | null => {
    if (sidebarIgnore || (this.homePage && this.homePage === link)) return null;
    if (link) {
      return html`
        <gem-active-link
          class="item ${isTop ? 'single' : ''}"
          pattern=${children ? new URL(link, location.origin).pathname : link}
          href=${link}
        >
          ${capitalize(title)}
        </gem-active-link>
        ${children ? html`<div class="links item hash">${children.map((item) => this.renderItem(item))}</div>` : null}
      `;
    }
    if (children) {
      return html`
        <div class="item" @click=${this.toggleLinks}>
          <gem-use class="arrow" selector="#arrow" .root=${container}></gem-use>
          ${capitalize(title)}
        </div>
        <div class="links item">${children.map((item) => this.renderItem(item))}</div>
      `;
    }
    return null;
  };

  render() {
    return html`
      <style>
        :host {
          display: block;
          overflow: auto;
          overscroll-behavior: contain;
          height: calc(100vh - ${theme.headerHeight});
          box-sizing: border-box;
          position: sticky;
          top: 0;
          padding: 3rem 1rem 0;
          margin: 0 -1rem;
          scrollbar-width: thin;
          font-size: 14px;
        }
        @media ${mediaQuery.PHONE} {
          :host {
            position: static;
            height: auto;
            margin: 0;
            padding: 0;
            overflow: visible;
            border-bottom: 1px solid ${theme.borderColor};
          }
        }
        :host::after {
          content: '';
          display: block;
          height: 2rem;
        }
        .langselect {
          user-select: none;
          display: flex;
          align-items: center;
          border: 1px solid ${theme.borderColor};
          border-radius: 5px;
          margin-bottom: 1em;
        }
        .langselect:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          border-color: #ddd;
        }
        .dropdown {
          border-bottom: 1px solid ${theme.borderColor};
          box-sizing: border-box;
          padding: 0.8em;
          pointer-events: none;
          margin-left: -2em;
          width: 2em;
          transform: rotate(90deg);
        }
        select {
          background: none;
          -webkit-appearance: none;
          appearance: none;
          border: none;
          height: 2.7em;
          outline: none;
          font-size: inherit;
          width: 100%;
          padding: 0 3em 0 1em;
        }
        gem-active-link {
          display: block;
          color: inherit;
          text-decoration: none;
          line-height: 1.2;
        }
        gem-active-link.active {
          color: ${theme.textColor};
        }
        gem-active-link.active:not([pattern*='#']) {
          font-weight: bolder;
        }
        gem-active-link.active + .hash {
          display: block;
        }
        .arrow {
          width: 6px;
          height: 10px;
          margin-right: calc(1em - 6px);
        }
        .close + .links {
          display: none;
        }
        .links {
          position: relative;
        }
        .links::before {
          position: absolute;
          content: '';
          height: 100%;
          border-left: 1px solid ${theme.borderColor};
          transform: translateX(0.15em);
        }
        .hash {
          display: none;
        }
        .item {
          cursor: pointer;
        }
        .item:not(.links) {
          display: flex;
          align-items: center;
        }
        .single {
          display: flex;
          align-items: center;
        }
        .single::before {
          content: '';
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: ${theme.sidebarLinkArrowColor};
          margin-right: calc(1em - 4px);
        }
        .item gem-use {
          transform: rotate(90deg);
        }
        .item.close gem-use {
          transform: rotate(0deg);
        }
        .item .item {
          margin-left: 1rem;
        }
        .item + .item {
          margin-top: 0.5rem;
        }
      </style>
      ${this.lang &&
      html`
        <div class="langselect">
          <select @change=${(e: any) => this.languagechange(e.target.value)}>
            ${this.langlist.map(
              ({ name, code }) => html`<option value=${code} ?selected=${code === this.lang}>${name}</option>`,
            )}
          </select>
          <gem-use class="dropdown" .root=${container} selector="#arrow"></gem-use>
        </div>
      `}
      ${this.sidebar.map((item) => this.renderItem(item, true))}
    `;
  }

  updated() {
    const activeEle = this.shadowRoot?.querySelector('.active');
    const removeCloseClass = (e: Element | null | undefined) => {
      if (e) {
        e.classList.remove('close');
        removeCloseClass(e.parentElement?.previousElementSibling);
      }
    };
    removeCloseClass(activeEle);
  }
}
