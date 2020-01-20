import { html, GemElement, customElement, attribute, property } from '@mantou/gem';

import '@mantou/gem/elements/link';

@customElement('gem-book-nav')
export class Nav extends GemElement {
  @attribute tl: string;
  @attribute github: string;
  @property nav: NavItem[];

  renderItem = ({ title, link }: NavItem) => {
    if (link) {
      return html`
        <gem-active-link path=${link}>${title}</gem-active-link>
      `;
    }
  };

  render() {
    return html`
      <div>${this.tl}</div>
      ${this.nav.map(this.renderItem)} ${this.github && this.renderItem({ title: 'github', link: this.github })}
    `;
  }
}
