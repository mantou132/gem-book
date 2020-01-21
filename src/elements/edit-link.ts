import { html, GemElement, customElement, attribute, history, connectStore } from '@mantou/gem';

import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';

import { container } from './icons';
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
          display: inline-flex;
          align-items: center;
        }
        gem-link:hover {
          text-decoration: underline;
        }
        gem-use {
          width: 18px;
          height: 18px;
          margin-right: 10px;
        }
      </style>
      <gem-link href=${`${this.github}/blob/master${mdPath}`}>
        <gem-use selector="#compose" .root=${container}></gem-use>
        <span>Edit this page on GitHub</span>
      </gem-link>
    `;
  }
}
