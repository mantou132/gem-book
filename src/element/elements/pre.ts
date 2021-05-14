import { html, GemElement, customElement, attribute, refobject, RefObject } from '@mantou/gem';

import { theme } from '../helper/theme';

// https://github.com/PrismJS/prism/blob/master/plugins/autoloader/prism-autoloader.js
const langDependencies: Record<string, string | string[]> = {
  javascript: 'clike',
  actionscript: 'javascript',
  apex: ['clike', 'sql'],
  arduino: 'cpp',
  aspnet: ['markup', 'csharp'],
  birb: 'clike',
  bison: 'c',
  c: 'clike',
  csharp: 'clike',
  cpp: 'c',
  coffeescript: 'javascript',
  crystal: 'ruby',
  'css-extras': 'css',
  d: 'clike',
  dart: 'clike',
  django: 'markup-templating',
  ejs: ['javascript', 'markup-templating'],
  etlua: ['lua', 'markup-templating'],
  erb: ['ruby', 'markup-templating'],
  fsharp: 'clike',
  'firestore-security-rules': 'clike',
  flow: 'javascript',
  ftl: 'markup-templating',
  gml: 'clike',
  glsl: 'c',
  go: 'clike',
  groovy: 'clike',
  haml: 'ruby',
  handlebars: 'markup-templating',
  haxe: 'clike',
  hlsl: 'c',
  java: 'clike',
  javadoc: ['markup', 'java', 'javadoclike'],
  jolie: 'clike',
  jsdoc: ['javascript', 'javadoclike', 'typescript'],
  'js-extras': 'javascript',
  json5: 'json',
  jsonp: 'json',
  'js-templates': 'javascript',
  kotlin: 'clike',
  latte: ['clike', 'markup-templating', 'php'],
  less: 'css',
  lilypond: 'scheme',
  markdown: 'markup',
  'markup-templating': 'markup',
  mongodb: 'javascript',
  n4js: 'javascript',
  nginx: 'clike',
  objectivec: 'c',
  opencl: 'c',
  parser: 'markup',
  php: 'markup-templating',
  phpdoc: ['php', 'javadoclike'],
  'php-extras': 'php',
  plsql: 'sql',
  processing: 'clike',
  protobuf: 'clike',
  pug: ['markup', 'javascript'],
  purebasic: 'clike',
  purescript: 'haskell',
  qml: 'javascript',
  qore: 'clike',
  racket: 'scheme',
  jsx: ['markup', 'javascript'],
  tsx: ['jsx', 'typescript'],
  reason: 'clike',
  ruby: 'clike',
  sass: 'css',
  scss: 'css',
  scala: 'java',
  'shell-session': 'bash',
  smarty: 'markup-templating',
  solidity: 'clike',
  soy: 'markup-templating',
  sparql: 'turtle',
  sqf: 'clike',
  swift: 'clike',
  't4-cs': ['t4-templating', 'csharp'],
  't4-vb': ['t4-templating', 'vbnet'],
  tap: 'yaml',
  tt2: ['clike', 'markup-templating'],
  textile: 'markup',
  twig: 'markup',
  typescript: 'javascript',
  vala: 'clike',
  vbnet: 'basic',
  velocity: 'markup',
  wiki: 'markup',
  xeora: 'markup',
  'xml-doc': 'markup',
  xquery: 'markup',
};
const langAliases: Record<string, string> = {
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  mathml: 'markup',
  ssml: 'markup',
  atom: 'markup',
  rss: 'markup',
  js: 'javascript',
  g4: 'antlr4',
  adoc: 'asciidoc',
  shell: 'bash',
  shortcode: 'bbcode',
  rbnf: 'bnf',
  oscript: 'bsl',
  cs: 'csharp',
  dotnet: 'csharp',
  coffee: 'coffeescript',
  conc: 'concurnas',
  jinja2: 'django',
  'dns-zone': 'dns-zone-file',
  dockerfile: 'docker',
  eta: 'ejs',
  xlsx: 'excel-formula',
  xls: 'excel-formula',
  gamemakerlanguage: 'gml',
  hs: 'haskell',
  gitignore: 'ignore',
  hgignore: 'ignore',
  npmignore: 'ignore',
  webmanifest: 'json',
  kt: 'kotlin',
  kts: 'kotlin',
  tex: 'latex',
  context: 'latex',
  ly: 'lilypond',
  emacs: 'lisp',
  elisp: 'lisp',
  'emacs-lisp': 'lisp',
  md: 'markdown',
  moon: 'moonscript',
  n4jsd: 'n4js',
  nani: 'naniscript',
  objc: 'objectivec',
  objectpascal: 'pascal',
  px: 'pcaxis',
  pcode: 'peoplecode',
  pq: 'powerquery',
  mscript: 'powerquery',
  pbfasm: 'purebasic',
  purs: 'purescript',
  py: 'python',
  rkt: 'racket',
  rpy: 'renpy',
  robot: 'robotframework',
  rb: 'ruby',
  'sh-session': 'shell-session',
  shellsession: 'shell-session',
  smlnj: 'sml',
  sol: 'solidity',
  sln: 'solution-file',
  rq: 'sparql',
  t4: 't4-cs',
  trig: 'turtle',
  ts: 'typescript',
  tsconfig: 'typoscript',
  uscript: 'unrealscript',
  uc: 'unrealscript',
  vb: 'visual-basic',
  vba: 'visual-basic',
  xeoracube: 'xeora',
  yml: 'yaml',
};

@customElement('gem-book-pre')
export class Pre extends GemElement {
  @attribute codelang: string;
  @attribute range: string;
  @attribute highlight: string;

  @refobject codeRef: RefObject<HTMLElement>;

  getRanges(range: string) {
    const ranges = range.split(/,\s*/);
    return ranges.map((range) => {
      const [start, end = start] = range.split('-');
      return [parseInt(start) || 1, parseInt(end) || 0];
    });
  }

  getParts(s: string) {
    const lines = s.split(/\n|\r\n/);
    const parts = this.range
      ? this.getRanges(this.range).map(([start, end]) => {
          let result = '';
          for (let i = start - 1; i < (end || lines.length); i++) {
            result += lines[i] + '\n';
          }
          return result;
        })
      : [s];
    return parts.join('\n...\n\n');
  }

  render() {
    const lang = this.codelang;
    const lineHeight = 1.5;
    const padding = 1;
    return html`
      ${this.highlight
        ? this.getRanges(this.highlight).map(
            ([start, end]) =>
              html`<span
                class="highlight"
                style="top: ${(start - 1) * lineHeight + padding}em; height: ${(end - start + 1) * lineHeight}em"
              ></span>`,
          )
        : ''}
      <i class="code-lang-name">${lang}</i>
      <code ref=${this.codeRef.ref}>${this.getParts(this.textContent || '')}</code>
      <style>
        :host {
          position: relative;
          display: block;
          color: #f8f8f2;
          font-size: 0.875em;
        }
        .highlight {
          display: block;
          position: absolute;
          pointer-events: none;
          background: #fff2;
          width: 100%;
        }
        .code-lang-name {
          position: absolute;
          top: 0.3em;
          right: 0.7em;
          font-size: 0.714em;
          color: #cacaca;
          user-select: none;
        }
        .code-lang-name::selection {
          background: transparent;
        }
        ::selection {
          background: #3c526d;
        }
        code {
          display: block;
          padding: ${padding}em;
          font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
          line-height: ${lineHeight};
          text-align: left;
          white-space: pre;
          tab-size: 2;
          hyphens: none;
          overflow: auto;
          overflow-clip-box: content-box;
          box-shadow: none;
          border: none;
          background: transparent;
          scrollbar-width: thin;
        }
        code::-webkit-scrollbar {
          height: 0.5em;
        }
        code::-webkit-scrollbar-thumb {
          background: #fff3;
          border-radius: inherit;
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
        @media print {
          code {
            border-left: 0.5rem solid rgba(${theme.textColorRGB}, 0.2);
            white-space: pre-wrap;
            word-break: break-word;
          }
          .highlight {
            display: none;
          }
        }
      </style>
    `;
  }

  mounted() {
    this.effect(
      async () => {
        if (!this.codeRef.element) return;
        const esmHost = 'https://cdn.skypack.dev/prismjs';
        await import(/* webpackIgnore: true */ `${esmHost}?min`);
        const { Prism } = window;

        // TODO: wait Intersection

        if (this.codelang && !Prism.languages[this.codelang]) {
          const lang = langAliases[this.codelang] || this.codelang;
          const langDeps = ([] as string[]).concat(langDependencies[lang] || []);
          try {
            await Promise.all(
              langDeps.map((langDep) => {
                if (!Prism.languages[langDep]) {
                  return import(/* webpackIgnore: true */ `${esmHost}/components/prism-${langDep}.min.js`);
                }
              }),
            );
            await import(/* webpackIgnore: true */ `${esmHost}/components/prism-${lang}.min.js`);
          } catch {
            //
          }
        }

        const content = Prism.languages[this.codelang]
          ? Prism.highlight(this.textContent || '', Prism.languages[this.codelang], this.codelang)
          : this.innerHTML;
        this.codeRef.element.innerHTML = this.getParts(content);
      },
      () => [],
    );
  }
}
