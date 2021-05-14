import type { GemBookElement } from '../element';

customElements.whenDefined('gem-book').then(() => {
  const { GemBookPluginElement } = customElements.get('gem-book') as typeof GemBookElement;
  const { config } = GemBookPluginElement;

  customElements.define(
    'gbp-raw',
    class extends GemBookPluginElement {
      static observedAttributes = ['src', 'codelang', 'range', 'highlight'];
      src: string;
      codelang: string;
      range: string;
      highlight: string;

      mounted() {
        this.renderContent();
      }

      updated() {
        this.renderContent();
      }

      async renderContent() {
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
        const div = document.createElement('div');
        div.textContent = text;
        const content = div.innerHTML;

        const extension = this.src.split('.').pop() || '';
        this.innerHTML = `<gem-book-pre codelang="${this.codelang || extension}" highlight="${this.highlight}" range="${
          this.range
        }">${content}</gem-book-pre>`;
      }
    },
  );
});
