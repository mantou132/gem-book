import type { Book } from '../element';

customElements.whenDefined('gem-book').then(() => {
  const GemBookPluginElement = (customElements.get('gem-book') as typeof Book).GemBookPluginElement;
  const Prism = GemBookPluginElement.Prism;

  customElements.define(
    'gbp-raw',
    class extends GemBookPluginElement {
      static observedAttributes = ['src', 'lang', 'range'];
      src: string;
      lang: string;
      range: string; // 2-20, -20, 2-,

      get ranges() {
        const ranges = this.range.split(/,\s*/);
        return ranges.map((range) => {
          const [start, end] = range.split('-');
          return [parseInt(start) || 1, parseInt(end) || 0];
        });
      }

      mounted() {
        this.renderContent();
      }

      updated() {
        this.renderContent();
      }

      async renderContent() {
        const config = this.config;
        if (!this.src) return;
        this.innerHTML = 'Loading...';

        let url = this.src;

        if (this.src.startsWith('/') && !this.src.startsWith('//')) {
          if (!config.github || !config.sourceBranch) return;

          const rawOrigin = 'https://raw.githubusercontent.com';
          const repo = new URL(config.github).pathname;
          url = `${rawOrigin}${repo}/${config.sourceBranch}${this.src}`;
        }
        const text = await (await fetch(url)).text();
        this.innerHTML = this.highlight(text);
      }

      highlight(str: string) {
        const [, extension] = this.src.split('.');
        const lang = Prism.languages[this.lang] ? this.lang : Prism.languages[extension] ? extension : '';
        let content = str;
        if (lang) {
          content = Prism.highlight(str, Prism.languages[lang], lang);
        } else {
          const div = document.createElement('div');
          div.innerText = str;
          content = div.innerHTML;
        }
        const lines = content.split(/\n|\r\n/);
        const parts = this.range
          ? this.ranges.map(([start, end]) => {
              let result = '';
              for (let i = start - 1; i < (end || lines.length); i++) {
                result += lines[i] + '\n';
              }
              return result;
            })
          : [content];
        const langTag = `<i class="code-lang-name">${lang}</i>`;
        return `<pre><code class="language-${lang}">${langTag}${parts.join('\n...\n\n')}</code></pre>`;
      }
    },
  );
});
