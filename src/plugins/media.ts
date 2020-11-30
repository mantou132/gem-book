import type { GemBookElement } from '../element';

type MediaType = 'img' | 'video' | 'audio' | 'unknown';

customElements.whenDefined('gem-book').then(() => {
  const { GemBookPluginElement } = customElements.get('gem-book') as typeof GemBookElement;
  const { Gem, config, theme } = GemBookPluginElement;
  const { html } = Gem;

  customElements.define(
    'gbp-media',
    class extends GemBookPluginElement {
      static observedAttributes = ['src', 'type', 'width', 'height'];
      src: string;
      type: MediaType;
      width: string;
      height: string;

      getRemoteUrl() {
        if (!this.src) return '';

        let url = this.src;
        if (this.src.startsWith('/') && !this.src.startsWith('//')) {
          if (!config.github || !config.sourceBranch) return '';
          const rawOrigin = 'https://raw.githubusercontent.com';
          const repo = new URL(config.github).pathname;
          url = `${rawOrigin}${repo}/${config.sourceBranch}${this.src}`;
        }
        return url;
      }

      detectType(): MediaType {
        // https://developer.mozilla.org/en-US/docs/Web/Media/Formats
        const ext = this.src.split('.').pop() || '';
        if (/a?png|jpe?g|gif|webp|avif|svg/.test(ext)) {
          return 'img';
        }
        if (/mp4|webm|av1/.test(ext)) {
          return 'video';
        }
        if (/mp3|ogg/.test(ext)) {
          return 'img';
        }
        return 'unknown';
      }

      renderUnknownContent() {
        return html`
          <style>
            :host::before {
              display: block;
              content: 'Unknown format';
              padding: 1em;
              border-radius: 4px;
              text-align: center;
              background: ${theme.borderColor};
            }
          </style>
        `;
      }

      renderImage() {
        return html`<img width=${this.width} height=${this.height} src=${this.getRemoteUrl()} />`;
      }

      renderVideo() {
        return html`<video width=${this.width} height=${this.height} src=${this.getRemoteUrl()}></video>`;
      }

      renderAudio() {
        return html`<audio src=${this.getRemoteUrl()}></audio>`;
      }

      renderContent() {
        const type = this.type || this.detectType();
        switch (type) {
          case 'img':
            return this.renderImage();
          case 'video':
            return this.renderVideo();
          case 'audio':
            return this.renderAudio();
          default:
            return this.renderUnknownContent();
        }
      }

      render() {
        return html`
          <style>
            :host {
              display: contents;
            }
          </style>
          ${this.renderContent()}
        `;
      }
    },
  );
});
