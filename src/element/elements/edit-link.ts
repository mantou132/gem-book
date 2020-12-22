import { html, GemElement, customElement, history, connectStore } from '@mantou/gem';

import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { container } from './icons';
import { getUserLink, getRemotePath } from '../lib/utils';
import { selfI18n } from '../helper/i18n';
import { theme } from '../helper/theme';
import { bookStore } from '../store';

interface State {
  lastUpdated: string;
  message: string;
  commitUrl: string;
}

const cache: Record<string, unknown> = {};
const fetchData = async (api: string) => {
  if (cache[api]) return cache[api];
  const [commit] = await (await fetch(api)).json();
  cache[api] = commit;
  return commit;
};

/**
 * @attr github
 * @attr srouce-dir
 * @attr source-branch
 */
@customElement('gem-book-edit-link')
@connectStore(selfI18n.store)
export class EditLink extends GemElement<State> {
  state = {
    lastUpdated: '',
    message: '',
    commitUrl: '',
  };

  get lastUpdated() {
    const { lastUpdated } = this.state;
    return (
      lastUpdated &&
      new Intl.DateTimeFormat(bookStore.lang || 'default', {
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
    const { config, lang, links = [] } = bookStore;
    const { sourceDir = '' } = config || {};
    const { path } = history.getParams();
    const link = links.find(({ originLink }) => getUserLink(originLink) === path);
    if (!link) throw new Error('not found link');
    const sroucePath = sourceDir ? `/${sourceDir}` : '';
    return `${sroucePath}${getRemotePath(link.originLink, lang)}`;
  };

  render() {
    const { lastUpdated } = this;
    const { message, commitUrl } = this.state;
    const { config } = bookStore;
    const { github, sourceBranch = '' } = config || {};
    if (!github || !sourceBranch) return;
    return html`
      <style>
        :host {
          display: flex;
          flex-wrap: wrap;
          padding: 2rem 0;
          justify-content: space-between;
          line-height: 1.5;
        }
        gem-link {
          border-bottom: 1px solid rgba(${theme.textColorRGB}, 0.3);
          color: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        gem-link:hover {
          border-bottom: 1px solid;
        }
        gem-use {
          width: 18px;
          height: 18px;
          margin-right: 10px;
        }
        .last-updated span {
          opacity: 0.5;
        }
        @media ${mediaQuery.PHONE} {
          gem-link,
          .last-updated {
            white-space: nowrap;
          }
        }
      </style>
      <gem-link class="edit" href=${`${github}/blob/${sourceBranch}${this.getMdFullPath()}`}>
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
        const { config } = bookStore;
        const { github, sourceBranch = '' } = config || {};
        if (!github) return;
        const repo = new URL(github).pathname;
        const path = this.getMdFullPath();
        const query = new URLSearchParams({
          path,
          page: '1',
          per_page: '1',
          sha: sourceBranch,
        });
        try {
          const api = `https://api.github.com/repos${repo}/commits?${query}`;
          const commit = await fetchData(api);
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
