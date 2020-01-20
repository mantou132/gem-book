import { html, GemElement, customElement, property, TemplateResult } from '@mantou/gem';

@customElement('gem-book-sidebar')
export class SideBar extends GemElement {
  @property sidebar: NavItem[];

  renderItem = ({ link, title, children }: NavItem, isTop = false): TemplateResult => {
    if (link) {
      return html`
        <gem-active-link class="item" path=${link}>${isTop ? '*' : ''}${title}</gem-active-link>
      `;
    }
    if (children) {
      return html`
        <div class="item">${isTop ? 'x' : ''}${title}</div>
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
          grid-area: 2 / aside / content / auto;
        }
        gem-active-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        gem-active-link.active {
          font-weight: bolder;
        }
        .links {
          border-inline-start: 1px solid currentColor;
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
}
