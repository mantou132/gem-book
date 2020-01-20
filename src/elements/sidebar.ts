import { html, GemElement, customElement, property, TemplateResult } from '@mantou/gem';

@customElement('gem-book-sidebar')
export class SideBar extends GemElement {
  @property sidebar: NavItem[];

  renderItem = ({ link, title, children }: NavItem, isTop = false): TemplateResult => {
    if (link) {
      return html`
        <gem-active-link path=${link}>${title}</gem-active-link>
      `;
    }
    if (children) {
      return html`
        <div>${isTop ? 'x' : ''}${title}</div>
        <div>
          ${children.map(item => this.renderItem(item))}
        </div>
      `;
    }
    return html``;
  };

  render() {
    return html`
      ${this.sidebar.map(item => this.renderItem(item, true))}
    `;
  }
}
