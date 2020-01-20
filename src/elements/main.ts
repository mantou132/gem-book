import { html, GemElement, customElement, history, attribute } from '@mantou/gem';
import marked from 'marked';
import Prism from 'prismjs';

import { getMdPath } from '../lib/utils';

const parser = new DOMParser();

marked.setOptions({
  highlight: function(code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      return code;
    }
  },
});

interface State {
  content: Element[] | null;
}

@customElement('gem-book-main')
export class Main extends GemElement<State> {
  @attribute link: string;

  state = {
    content: null,
  };

  fetchData = async () => {
    const { path } = history.getParams();
    const mdPath = getMdPath(path);
    const md = await (await fetch(mdPath)).text();
    const elements = [...parser.parseFromString(marked.parse(md), 'text/html').body.children];
    this.setState({
      content: elements,
    });
  };

  mounted() {
    this.fetchData();
  }

  render() {
    return html`
      <style>
        :host {
          grid-area: 2 / content / content / auto;
        }
        /* https://github.com/egoist/docute/blob/master/src/css/page-content.css */
        :host > :first-child {
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
          font-weight: 300;
          line-height: 1.2;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 1.4rem;
        }
        h2 {
          font-size: 2rem;
          border-bottom: 1px solid var(--border-color);
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
          width: 100%;
          border-spacing: 0;
          border-collapse: separate;
        }
        table td,
        table th {
          padding: 12px 10px;
          border-bottom: 1px solid var(--border-color);
          text-align: left;
        }
        thead th {
          color: var(--table-header-color);
          background: var(--table-header-background);
          border-bottom: 1px solid var(--border-color);
          border-top: 1px solid var(--border-color);
          font-weight: 400;
          font-size: 12px;
          padding: 10px;
        }
        thead th:first-child {
          border-left: 1px solid var(--border-color);
          border-radius: 4px 0 0 4px;
        }
        thead th:last-child {
          border-right: 1px solid var(--border-color);
          border-radius: 0 4px 4px 0;
        }
        pre {
          margin: 2rem 0;
          position: relative;
          border-radius: 4px;
          background: var(--code-block-background);
          box-shadow: inset 0 0 0 var(--code-block-shadow-width) var(--code-block-shadow-color);
        }
        pre::before {
          content: attr(data-lang);
          position: absolute;
          top: 5px;
          right: 10px;
          font-size: 12px;
          color: #cacaca;
        }
        pre code {
          color: var(--code-block-text-color);
        }
        .code-mask,
        pre {
          overflow: auto;
          position: relative;
          margin: 0;
          z-index: 2;
          font-family: var(--code-font);
          white-space: pre;
        }
        .code-mask code,
        pre code {
          box-shadow: none;
          margin: 0;
          padding: 0;
          border: none;
          font-size: 1em;
          background: transparent;
        }
        @media print {
          .code-mask,
          pre {
            white-space: pre-wrap;
            word-break: break-word;
          }
        }
        pre {
          padding: 20px;
        }
        .code-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1;
          padding-top: 20px;
          border: none;
          color: transparent;
        }
        .code-line {
          display: block;
          padding: 0 20px;
        }
        .code-line.highlighted {
          background: var(--highlighted-line-background);
          position: relative;
        }
        .code-line.highlighted:before {
          content: '';
          display: block;
          width: 3px;
          top: 0;
          left: 0;
          bottom: 0;
          background: var(--highlighted-line-border-color);
          position: absolute;
        }
        code {
          font-family: var(--code-font);
          font-size: 90%;
          background: var(--inline-code-background);
          border-radius: 4px;
          padding: 3px 5px;
          color: var(--inline-code-color);
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
          background: #f1f1f1;
          border-left: 8px solid #ccc;
          margin: 20px 0;
          padding: 14px 16px;
          color: #6a737d;
        }
        blockquote p {
          margin: 15px 0 0;
        }
        blockquote > :first-child {
          margin-top: 0;
        }
        hr {
          height: 1px;
          padding: 0;
          margin: 3rem 0;
          background-color: #e1e4e8;
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
        .header-anchor .anchor-icon {
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

        /* https://github.com/SaraVieira/prism-theme-night-owl */

        .token.comment,
        .token.prolog,
        .token.cdata {
          color: rgb(99, 119, 119);
          font-style: italic;
        }

        .token.punctuation {
          color: rgb(199, 146, 234);
        }

        .namespace {
          color: rgb(178, 204, 214);
        }

        .token.deleted {
          color: rgba(239, 83, 80, 0.56);
          font-style: italic;
        }

        .token.symbol,
        .token.property {
          color: rgb(128, 203, 196);
        }

        .token.tag,
        .token.operator,
        .token.keyword {
          color: rgb(127, 219, 202);
        }

        .token.boolean {
          color: rgb(255, 88, 116);
        }

        .token.number {
          color: rgb(247, 140, 108);
        }

        .token.constant,
        .token.function,
        .token.builtin,
        .token.char {
          color: rgb(130, 170, 255);
        }

        .token.selector,
        .token.doctype {
          color: rgb(199, 146, 234);
          font-style: italic;
        }

        .token.attr-name,
        .token.inserted {
          color: rgb(173, 219, 103);
          font-style: italic;
        }

        .token.string,
        .token.url,
        .token.entity,
        .language-css .token.string,
        .style .token.string {
          color: rgb(173, 219, 103);
        }

        .token.class-name,
        .token.atrule,
        .token.attr-value {
          color: rgb(255, 203, 139);
        }

        .token.regex,
        .token.important,
        .token.variable {
          color: rgb(214, 222, 235);
        }

        .token.important,
        .token.bold {
          font-weight: bold;
        }

        .token.italic {
          font-style: italic;
        }
      </style>
      ${this.state.content}
    `;
  }

  attributeChanged() {
    this.fetchData();
  }
}
