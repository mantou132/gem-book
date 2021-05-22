import {
  html,
  GemElement,
  customElement,
  attribute,
  boolattribute,
  css,
  createStore,
  connectStore,
  updateStore,
} from '@mantou/gem';
import marked from 'marked';

import '@mantou/gem/elements/unsafe';
import '@mantou/gem/elements/link';
import '@mantou/gem/elements/reflect';

import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { getRemotePath, isSameOrigin, getUserLink, escapeHTML } from '../lib/utils';
import { theme } from '../helper/theme';
import { selfI18n } from '../helper/i18n';

import { anchor, link } from './icons';

import './pre';

const parser = new DOMParser();

type State = {
  fetching: boolean;
  content: Element[] | null;
};

export const mainState = createStore<State>({
  fetching: false,
  content: null,
});

/**
 * @attr link
 * @attr lang
 * @attr display-rank
 */
@customElement('gem-book-main')
@connectStore(mainState)
export class Main extends GemElement {
  @attribute link: string;
  @attribute lang: string;
  @boolattribute displayRank: boolean;

  mdRenderer = this.getMdRenderer();

  cache = new Map<string, string>();

  linkStyle = css`
    .link {
      display: inline-flex;
      align-items: center;
      gap: 0.2em;
      color: inherit;
      text-decoration: none;
      line-height: 1.2;
      background: rgba(${theme.primaryColorRGB}, 0.2);
      border-bottom: 1px solid rgba(${theme.textColorRGB}, 0.4);
    }
    .link:hover {
      background: rgba(${theme.primaryColorRGB}, 0.4);
      border-color: currentColor;
    }
  `;

  getMdRenderer() {
    const renderer = new marked.Renderer();
    // https://github.com/markedjs/marked/blob/ed18cd58218ed4ab98d3457bec2872ba1f71230e/lib/marked.esm.js#L986
    renderer.heading = function (fullText, level, r, slugger) {
      // # heading {#custom-id}
      const [, text, customId] = fullText.match(/^(.*?)\s*(?:{#(.*)})?$/s) as RegExpMatchArray;
      const tag = `h${level}`;
      const id = customId || `${this.options.headerPrefix}${slugger.slug(r)}`;
      return `<${tag} class="markdown-header" id="${id}"><a class="header-anchor" aria-hidden="true" href="#${id}">${anchor}</a>${text}</${tag}>`;
    };

    renderer.code = (code, infostring) => {
      const [lang, highlight = ''] = infostring?.split(/\s+/) || [];
      return `<gem-book-pre codelang="${lang}" highlight="${highlight}">${escapeHTML(code)}</gem-book-pre>`;
    };

    renderer.image = (href, title, text) => {
      if (href === null) return text;
      const url = new URL(href, `${location.origin}${getRemotePath(this.link, this.lang)}`);
      return `<img src="${url.href}" alt="${text}" title="${title || ''}"/>`;
    };

    const { displayRank } = this;
    renderer.link = function (href, title, text) {
      if (href?.startsWith('.')) {
        const { search, hash } = new URL(href, location.origin);
        return `
          <gem-link
            class="link"
            path="${getUserLink(href.replace(/#.*/, ''), displayRank)}"
            hash="${hash}"
            query="${search}"
            title="${title || ''}"
          >${text}</gem-link>
        `;
      }
      const internal = isSameOrigin(href || '');
      return `
        <a
          class="link"
          ${internal ? '' : `ref="noreferrer" target="_blank"`}
          href="${href || ''}"
          title="${title || ''}"
        >${text}${internal ? '' : link}</a>
      `;
    };
    return renderer;
  }

  fetchData = async () => {
    updateStore(mainState, {
      fetching: true,
      content: null,
    });
    const mdPath = getRemotePath(this.link, this.lang);
    let md = this.cache.get(mdPath);
    if (!md) {
      md = await (await fetch(mdPath)).text();
      this.cache.set(mdPath, md);
    }
    const [, , _sToken, _frontmatter, _eToken, mdBody] =
      md.match(/^(([\r\n\s]*---\s*(?:\r\n|\n))(.*?)((?:\r\n|\n)---\s*(?:\r\n|\n)?))?(.*)$/s) || [];

    const elements = this.parseMarkdown(mdBody);
    updateStore(mainState, {
      fetching: false,
      content: elements,
    });
    queueMicrotask(this.hashChangeHandle);
  };

  hashChangeHandle = () => {
    const { hash } = location;
    const ele = hash && this.shadowRoot?.querySelector(decodeURIComponent(hash));
    if (!hash) {
      scrollTo(0, 0);
    } else if (ele) {
      // webkit bug: https://bugs.webkit.org/show_bug.cgi?id=208110
      ele.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  render() {
    const { fetching, content } = mainState;
    return html`
      ${content || html`<div>${selfI18n.get('loading')}</div>`}
      <style>
        ${this.linkStyle}
      </style>
      <style>
        :not(:defined)::before {
          display: block;
          content: 'The element is not defined';
          padding: 1em;
          border-radius: 0.25rem;
          text-align: center;
          background: ${theme.borderColor};
        }
        :host {
          -webkit-print-color-adjust: economy;
          color-adjust: economy;
          display: block;
          width: 100%;
          box-sizing: border-box;
          z-index: 1;
          opacity: ${fetching ? 0.3 : 1};
          line-height: 1.7;
        }
        :host :first-child {
          margin-top: 0;
        }
        a > img + svg {
          display: none;
        }
        a > img {
          margin-bottom: -1px;
        }
        a {
          color: inherit;
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: bold;
          line-height: 1.2;
          scroll-margin: calc(${theme.headerHeight} + 2rem);
        }
        h1 {
          font-size: 3rem;
          margin: 0 0 1.4rem;
        }
        h2 {
          font-size: 2rem;
          margin: 7rem 0 2rem;
          padding-bottom: 5px;
        }
        h3 {
          font-size: 1.7rem;
          margin: 2.5rem 0 1.5rem;
        }
        h4 {
          font-size: 1.4rem;
          margin: 2rem 0 1rem;
        }
        h5 {
          font-size: 1.1rem;
          margin: 2rem 0 1rem;
        }
        p {
          margin: 1rem 0;
        }
        li > p {
          margin: 0;
        }
        table {
          margin: 2rem 0;
          width: 100%;
          border-spacing: 0;
          border-collapse: separate;
        }
        table td,
        table th {
          padding: 12px 10px;
          border-bottom: 1px solid ${theme.borderColor};
          text-align: left;
        }
        thead th {
          color: ${theme.textColor};
          background: rgba(${theme.textColorRGB}, 0.05);
          border-bottom: 1px solid ${theme.borderColor};
          border-top: 1px solid ${theme.borderColor};
          font-weight: normal;
          font-size: 12px;
          padding: 10px;
        }
        :host > ol,
        :host > ul {
          padding-left: 1.25rem;
          margin: 1rem 0;
        }
        .contains-task-list {
          list-style: none;
          padding-left: 0;
        }
        img {
          max-width: 100%;
        }
        blockquote {
          background: rgba(${theme.textColorRGB}, 0.05);
          border-left: 0.5rem solid rgba(${theme.textColorRGB}, 0.2);
          margin: 1.2em 0;
          padding: 0.8em 1em;
        }
        blockquote p {
          margin: 0.5em 0 0;
        }
        blockquote > :first-child {
          margin-top: 0;
          font-weight: bold;
        }
        blockquote > :nth-child(n + 2),
        blockquote > :last-child {
          font-weight: normal;
        }
        hr {
          height: 1px;
          padding: 0;
          margin: 3rem 0;
          background-color: ${theme.borderColor};
          border: 0;
        }
        .header-anchor {
          float: left;
          line-height: 1;
          margin-left: -1.25rem;
          padding-right: 0.25rem;
          opacity: 0;
          border-bottom: none;
        }
        .header-anchor:hover {
          opacity: 1;
          border-bottom: none;
        }
        .header-anchor svg {
          vertical-align: middle;
          fill: currentColor;
        }
        .markdown-header:focus,
        .markdown-header:hover {
          outline: none;
        }
        .markdown-header:focus .header-anchor,
        .markdown-header:hover .header-anchor {
          opacity: 1;
        }
        code {
          font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
          font-size: 90%;
          background: ${theme.inlineCodeBackground};
          padding: 0 3px;
        }
        a code {
          background: transparent;
          padding: 0;
        }
        gem-book-pre {
          z-index: 2;
          border-radius: 0.25rem;
          margin: 1rem 0px;
          background: ${theme.blockCodeBackground};
        }
        @media ${mediaQuery.PHONE} {
          .header-anchor {
            display: none;
          }
          h1 {
            font-size: 2.5rem;
          }
          @media screen {
            gem-book-pre {
              margin: 1rem -1rem;
              border-radius: 0;
            }
          }
        }
      </style>
    `;
  }

  mounted() {
    this.effect(
      () => {
        this.mdRenderer = this.getMdRenderer();
      },
      () => [this.displayRank],
    );
    this.effect(
      () => {
        // link change
        scrollTo(0, 0);
        this.fetchData();
      },
      () => [this.link, this.lang],
    );
    window.addEventListener('hashchange', this.hashChangeHandle);
    return () => {
      window.removeEventListener('hashchange', this.hashChangeHandle);
    };
  }

  parseMarkdown(mdBody: string) {
    return [...parser.parseFromString(marked.parse(mdBody, { renderer: this.mdRenderer }), 'text/html').body.children];
  }

  unsafeRenderHTML(s: string, style = '') {
    const htmlstr = marked.parse(s, { renderer: this.mdRenderer });
    const cssstr = css`
      ${this.linkStyle}
      ${style}
    `;
    return html`<gem-unsafe content=${htmlstr} contentcss=${cssstr}></gem-unsafe>`;
  }
}

export const mdRender = new Main();
