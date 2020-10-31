import { html, GemElement, customElement, attribute, history, connectStore } from '@mantou/gem';

import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';

import { container } from './icons';
import { getMdPath } from '../lib/utils';
import { selfI18n } from '../helper/i18n';
import { theme } from '../helper/theme';

interface State {
  lastUpdated: string;
}

/**
 * @attr github
 * @attr srouce-dir
 * @attr source-branch
 */
@customElement('gem-book-edit-link')
@connectStore(history.store)
@connectStore(selfI18n.store)
export class EditLink extends GemElement<State> {
  @attribute github: string;
  @attribute srouceDir: string;
  @attribute sourceBranch: string;
  @attribute lang: string;

  state = {
    lastUpdated: '',
  };

  get lastUpdated() {
    const { lastUpdated } = this.state;
    return (
      lastUpdated &&
      new Intl.DateTimeFormat(this.lang || 'default', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }).format(new Date(lastUpdated))
    );
  }

  getMdFullPath = () => {
    const { path } = history.getParams();
    const mdPath = getMdPath(path);
    const sroucePath = this.srouceDir ? `/${this.srouceDir}` : '';
    const langPath = this.lang ? `/${this.lang}` : '';
    return `${sroucePath}${langPath}${mdPath}`;
  };

  render() {
    const { lastUpdated } = this;
    return html`
      <style>
        :host {
          display: flex;
          padding: 2rem 0;
          grid-area: auto / content;
        }
        gem-link {
          color: ${theme.linkColor};
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
        .last-updated {
          flex-grow: 1;
          text-align: right;
          color: ${theme.linkColor};
        }
        .last-updated span {
          opacity: 0.5;
          color: ${theme.textColor};
        }
      </style>
      <gem-link class="edit" href=${`${this.github}/blob/${this.sourceBranch}${this.getMdFullPath()}`}>
        <gem-use selector="#compose" .root=${container}></gem-use>
        <span>${selfI18n.get('editOnGithub')}</span>
      </gem-link>
      ${lastUpdated &&
      html`<div class="last-updated">
        ${selfI18n.get('lastUpdated')}:
        <span>${lastUpdated}</span>
      </div>`}
    `;
  }

  mounted() {
    this.effect(
      async () => {
        if (!this.github) return;
        const repo = new URL(this.github).pathname;
        const path = this.getMdFullPath();
        const query = new URLSearchParams({
          path,
          page: '1',
          per_page: '1',
          sha: this.sourceBranch,
        });
        try {
          const [commit] = await (await fetch(`https://api.github.com/repos${repo}/commits?${query}`)).json();
          this.setState({ lastUpdated: commit ? commit.commit.committer.date : '' });
        } catch {
          this.setState({ lastUpdated: '' });
        }
      },
      () => [history.getParams().path],
    );
  }
}
