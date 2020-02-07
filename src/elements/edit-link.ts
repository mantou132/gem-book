import { html, GemElement, customElement, attribute, history, connectStore } from '@mantou/gem';

import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';

import { container } from './icons';
import { getMdPath } from '../lib/utils';

/**
 * @attr github
 * @attr srouce-dir
 * @attr source-branch
 */
@customElement('gem-book-edit-link')
@connectStore(history.store)
export class EditLink extends GemElement {
  @attribute github: string;
  @attribute srouceDir: string;
  @attribute sourceBranch: string;

  render() {
    const { path } = history.getParams();
    const mdPath = getMdPath(path);
    const sroucePath = this.srouceDir ? `/${this.srouceDir}` : '';

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
      <gem-link href=${`${this.github}/blob/${this.sourceBranch}${sroucePath}${mdPath}`}>
        <gem-use selector="#compose" .root=${container}></gem-use>
        <span>Edit this page on GitHub</span>
      </gem-link>
    `;
  }
}
