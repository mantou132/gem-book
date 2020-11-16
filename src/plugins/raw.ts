import type { Book } from '../element';

declare let Prism: typeof import('prismjs');

customElements.whenDefined('gem-book').then(() => {
  const GemBookPluginElement = (customElements.get('gem-book') as typeof Book).GemBookPluginElement;

  customElements.define(
    'gbp-raw',
    class extends GemBookPluginElement {
      static observedAttributes = ['src', 'lang'];
      src: string;
      lang: string;

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
        const [, extension] = new URL(this.src, location.origin).pathname.match(/.*\.(.*)$/) || [];
        const lang = Prism.languages[this.lang] ? this.lang : Prism.languages[extension] ? extension : '';
        if (lang) {
          return `
          <pre><code class="language-${lang}">${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>
        `;
        } else {
          return str;
        }
      }
    },
  );
});
