import { html, GemElement, customElement, attribute, history, connectStore, property } from '@mantou/gem';

import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { container } from './icons';
import { getMdPath, NavItemWithLink } from '../lib/utils';
import { selfI18n } from '../helper/i18n';
import { theme } from '../helper/theme';

interface State {
  lastUpdated: string;
  message: string;
  commitUrl: string;
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

  @property links: NavItemWithLink[];

  state = {
    lastUpdated: '',
    message: '',
    commitUrl: '',
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
    const link = this.links.find(({ link }) => link === path);
    if (!link) throw new Error('not found link');
    const mdPath = getMdPath(link.originLink);
    const sroucePath = this.srouceDir ? `/${this.srouceDir}` : '';
    const langPath = this.lang ? `/${this.lang}` : '';
    return `${sroucePath}${langPath}${mdPath}`;
  };

  render() {
    const { lastUpdated } = this;
    const { message, commitUrl } = this.state;
    return html`
      <style>
        :host {
          display: flex;
          padding: 2rem 0;
          justify-content: space-between;
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
        .last-updated span {
          opacity: 0.5;
          color: ${theme.textColor};
        }
        @media ${mediaQuery.PHONE} {
          :host {
            flex-direction: column;
          }
          gem-link,
          .last-updated {
            white-space: nowrap;
          }
        }
      </style>
      <gem-link class="edit" href=${`${this.github}/blob/${this.sourceBranch}${this.getMdFullPath()}`}>
        <gem-use selector="#compose" .root=${container}></gem-use>
        <span>${selfI18n.get('editOnGithub')}</span>
      </gem-link>
      ${lastUpdated &&
      html`
        <div class="last-updated">
          <gem-link class="edit" href=${commitUrl} title=${message}>${selfI18n.get('lastUpdated')}:</gem-link>
          <span>${lastUpdated}</span>
        </div>
      `}
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
          const api = `https://api.github.com/repos${repo}/commits?${query}`;
          const [commit] = await (await fetch(api)).json();
          const date = commit?.commit?.committer?.date;
          this.setState({
            lastUpdated: date || '',
            message: date ? commit.commit.message : '',
            commitUrl: date ? commit.html_url : '',
          });
        } catch {
          this.setState({ lastUpdated: '' });
        }
      },
      () => [history.getParams().path],
    );
  }
}
