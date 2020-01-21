import { html, GemElement, customElement, attribute, history, connectStore } from '@mantou/gem';

import '@mantou/gem/elements/link';
import { getMdPath } from '../lib/utils';

/**
 * @attr github
 */
@customElement('gem-book-edit-link')
@connectStore(history.store)
export class EditLink extends GemElement {
  @attribute github: string;

  render() {
    const { path } = history.getParams();
    const mdPath = getMdPath(path);

    return html`
      <style>
        :host {
          padding: 2rem 0;
          grid-area: auto / content;
        }
        gem-link {
          color: var(--link-color);
          text-decoration: none;
        }
        gem-link:hover {
          text-decoration: underline;
        }
      </style>
      <gem-link href=${`${this.github}/blob/master${mdPath}`}>Edit this page on GitHub</gem-link>
    `;
  }
}
