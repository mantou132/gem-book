import { html, GemElement, customElement, property, TemplateResult, history, connectStore } from '@mantou/gem';
import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';

import { container } from './icons';
import { capitalize } from '../lib/utils';

@customElement('gem-book-sidebar')
@connectStore(history.store)
export class SideBar extends GemElement {
  @property sidebar: NavItem[];

  toggleLinks = (e: MouseEvent) => {
    const ele = e.target as HTMLDivElement;
    ele.classList.toggle('close');
  };

  renderItem = ({ link, title, children }: NavItem, isTop = false): TemplateResult => {
    if (link) {
      return html`
        <gem-active-link
          class="item ${isTop ? 'single' : ''}"
          pattern=${children ? new URL(link, location.origin).pathname : link}
          href=${link}
        >
          ${capitalize(title)}
        </gem-active-link>
        ${children
          ? html`
              <div class="links item hash">
                ${children.map(item => this.renderItem(item))}
              </div>
            `
          : null}
      `;
    }
    if (children) {
      return html`
        <div class="item" @click=${this.toggleLinks}>
          <gem-use selector="#arrow" .root=${container}></gem-use>
          ${capitalize(title)}
        </div>
        <div class="links item">
          ${children.map(item => this.renderItem(item))}
        </div>
      `;
    }
    return html``;
  };

  render() {
    return html`
      <style>
        :host {
          grid-area: 1 / aside / 111 / aside;
          overflow: auto;
          overscroll-behavior: contain;
          height: calc(100vh - var(--header-height));
          box-sizing: border-box;
          position: sticky;
          top: var(--header-height);
          padding-block-start: 3rem;
          margin-block-start: var(--header-height);
          padding-inline: 1rem;
          margin-inline: -1rem;
        }
        :host::after {
          content: '';
          display: block;
          height: 2rem;
        }
        gem-active-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        gem-active-link.active {
          color: var(--link-color);
        }
        gem-active-link.active:not([pattern*='#']) {
          font-weight: bolder;
        }
        gem-active-link.active + .hash {
          display: block;
        }
        .close + .links {
          display: none;
        }
        .links {
          border-inline-start: 1px solid var(--border-color);
        }
        .hash {
          display: none;
        }
        .item {
          cursor: pointer;
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
          background-color: var(--sidebar-link-arrow-color);
          margin-right: 8px;
        }
        .item gem-use {
          transform: rotate(90deg);
        }
        .item.close gem-use {
          transform: rotate(0deg);
        }
        .item .item {
          margin-inline-start: 1rem;
        }
        .item + .item {
          margin-block-start: 0.5rem;
        }
      </style>
      ${this.sidebar.map(item => this.renderItem(item, true))}
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
