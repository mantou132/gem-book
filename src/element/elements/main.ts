import { html, GemElement, customElement, attribute, raw, boolattribute, updateStore, css } from '@mantou/gem';
import marked from 'marked';
import Prism from 'prismjs';
import fm from 'front-matter';

import '@mantou/gem/elements/unsafe';
import '@mantou/gem/elements/link';

import { mediaQuery } from '@mantou/gem/helper/mediaquery';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-typescript';

import { getMdPath, isSameOrigin, getUserLink } from '../lib/utils';
import { theme } from '../helper/theme';
import { homepageData } from './homepage';
import { anchor, link } from './icons';
import { FrontMatter } from '../../common/frontmatter';

const parser = new DOMParser();

marked.setOptions({
  highlight: function (code, lang) {
    if (lang && Prism.languages[lang]) {
      const content = Prism.highlight(code, Prism.languages[lang], lang);
      return `<i class="code-lang-name">${lang}</i>${content}`;
    } else {
      return code;
    }
  },
});

interface State {
  fetching: boolean;
  content: Element[] | null;
}

/**
 * @attr link
 * @attr lang
 * @attr display-rank
 */
@customElement('gem-book-main')
export class Main extends GemElement<State> {
  @attribute link: string;
  @attribute lang: string;
  @boolattribute displayRank: boolean;

  state = {
    fetching: false,
    content: null,
  };

  mdRenderer = this.getMdRenderer();

  cache = new Map<string, string>();

  getMdRenderer() {
    const renderer = new marked.Renderer();
    // https://github.com/markedjs/marked/blob/ed18cd58218ed4ab98d3457bec2872ba1f71230e/lib/marked.esm.js#L986
    renderer.heading = function (text, level, r, slugger) {
      const tag = `h${level}`;
      const id = `${this.options.headerPrefix}${slugger.slug(r)}`;
      return raw`
        <${tag} class="markdown-header" id="${id}">
          <a class="header-anchor" href="#${id}">${anchor}</a>
          ${text}</${tag}>
      `;
    };

    const { displayRank } = this;
    renderer.link = function (href, title, text) {
      if (href?.startsWith('.')) {
        return raw`
          <gem-link class="link" path=${getUserLink(href, displayRank)} title=${title || ''}>${text}</gem-link>
        `;
      }
      const internal = isSameOrigin(href || '');
      return raw`
        <a class="link" target=${internal ? '_self' : '_blank'} href=${href || ''} title=${title || ''}>
          ${text}
          ${internal ? '' : link}
        </a>
      `;
    };
    return renderer;
  }

  fetchData = async () => {
    this.setState({
      fetching: true,
      content: null,
    });
    const mdPath = getMdPath(this.link, this.lang);
    let md = this.cache.get(mdPath);
    if (!md) {
      md = await (await fetch(mdPath)).text();
      this.cache.set(mdPath, md);
    }
    const {
      body: mdBody,
      attributes: { hero, features },
    } = fm<FrontMatter>(md);
    updateStore(homepageData, { hero, features });
    const elements = [
      ...parser.parseFromString(marked.parse(mdBody, { renderer: this.mdRenderer }), 'text/html').body.children,
    ];
    this.setState({
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
    const { fetching, content } = this.state;
    return html`
      <slot></slot>
      ${content || html`<div style="height: 20em">Loading...</div>`}
      <style>
        :not(:defined)::before {
          display: block;
          content: 'The element is not defined';
          padding: 1em;
          border-radius: 4px;
          text-align: center;
          background: ${theme.borderColor};
        }
        :host {
          display: block;
          width: 100%;
          box-sizing: border-box;
          z-index: 1;
          opacity: ${fetching ? 0.3 : 1};
          min-height: 10rem;
          padding-top: 3rem;
          line-height: 1.7;
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
        .link {
          display: inline-flex;
          align-items: center;
          gap: 0.2em;
          color: inherit;
          background: rgba(${theme.primaryColorRGB}, 0.1);
          text-decoration: none;
          border-bottom: 1px solid rgba(${theme.textColorRGB}, 0.3);
          line-height: 1.2;
        }
        .link:hover {
          background: rgba(${theme.primaryColorRGB}, 0.3);
          border-color: currentColor;
        }
        slot ~ * {
          margin-top: 0;
        }
        :host > h2:first-child {
          margin-top: 7rem;
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
          margin-bottom: 1.4rem;
        }
        h2 {
          font-size: 2rem;
          margin-top: 7rem;
          padding-bottom: 5px;
        }
        h3 {
          font-size: 1.7rem;
          margin: 40px 0 30px;
        }
        h4 {
          font-size: 1.4rem;
        }
        h5 {
          font-size: 1.1rem;
        }
        p {
          margin: 15px 0;
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
          color: ${theme.tableHeaderColor};
          background: ${theme.tableHeaderBackground};
          border-bottom: 1px solid ${theme.borderColor};
          border-top: 1px solid ${theme.borderColor};
          font-weight: normal;
          font-size: 12px;
          padding: 10px;
        }
        :host > ol,
        :host > ul {
          padding-left: 20px;
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
          border-left: 8px solid rgba(${theme.textColorRGB}, 0.2);
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
          margin-left: -20px;
          padding-right: 4px;
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
        @media ${mediaQuery.PHONE} {
          :host {
            padding-top: 1rem;
          }
          .header-anchor {
            display: none;
          }
          h1 {
            font-size: 2.5rem;
          }
        }

        code {
          font-size: 90%;
          background: ${theme.inlineCodeBackground};
          border-radius: 4px;
          padding: 0 3px;
        }
        a code {
          background: transparent;
          padding: 0;
        }
        pre {
          z-index: 2;
          position: relative;
          border-radius: 4px;
          white-space: pre;
        }
        @media ${mediaQuery.PHONE} {
          pre {
            margin: 1rem -1rem;
            border-radius: 0;
          }
        }
        pre code {
          display: block;
          margin: 2rem 0;
          padding: 1rem;
          overflow: auto;
          box-shadow: none;
          border: none;
          border-radius: 0;
          font-size: 1em;
          background: transparent;
          scrollbar-width: thin;
        }
        pre code::-webkit-scrollbar {
          height: 1rem;
        }
        pre code::-webkit-scrollbar-thumb {
          background: #fff3;
        }
        @media print {
          pre {
            white-space: pre-wrap;
            word-break: break-word;
          }
        }

        /* code block */
        pre {
          color: #f8f8f2;
          background: #2e3440;
        }
        pre ::selection {
          background: #3c526d;
        }
        code {
          font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        }
        pre .code-lang-name {
          position: absolute;
          top: 3px;
          right: 7px;
          font-size: 10px;
          color: #cacaca;
          user-select: none;
        }
        pre .code-lang-name::selection {
          background: transparent;
        }

        /* plugin */
        pre code {
          text-align: left;
          white-space: pre;
          word-spacing: normal;
          word-break: normal;
          word-wrap: normal;
          line-height: 1.5;
          -moz-tab-size: 4;
          -o-tab-size: 4;
          tab-size: 4;
          -webkit-hyphens: none;
          -moz-hyphens: none;
          -ms-hyphens: none;
          hyphens: none;
        }

        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #636f88;
        }

        .token.punctuation {
          color: #81a1c1;
        }

        .namespace {
          opacity: 0.7;
        }

        .token.property,
        .token.tag,
        .token.constant,
        .token.symbol,
        .token.deleted {
          color: #81a1c1;
        }

        .token.number {
          color: #b48ead;
        }

        .token.boolean {
          color: #81a1c1;
        }

        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
          color: #a3be8c;
        }

        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string,
        .token.variable {
          color: #81a1c1;
        }

        .token.atrule,
        .token.attr-value,
        .token.function,
        .token.class-name {
          color: #88c0d0;
        }

        .token.keyword {
          color: #81a1c1;
        }

        .token.regex,
        .token.important {
          color: #ebcb8b;
        }

        .token.important,
        .token.bold {
          font-weight: bold;
        }

        .token.italic {
          font-style: italic;
        }

        .token.entity {
          cursor: help;
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

  unsafeRender(s: string, style = '') {
    const htmlstr = marked.parse(s, { renderer: this.mdRenderer });
    const cssstr = css`
      a,
      gem-link {
        border-bottom: 1px solid rgba(${theme.textColorRGB}, 0.3);
        color: inherit;
        text-decoration: none;
      }
      a:hover,
      gem-link:hover {
        border-bottom: 1px solid;
      }
      ${style}
    `;
    return html`<gem-unsafe content=${htmlstr} contentcss=${cssstr}></gem-unsafe>`;
  }
}

export const mdRender = new Main();
