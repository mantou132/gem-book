import { render, html } from '@mantou/gem';
import { DEFAULT_FILE, DEV_THEME_FILE } from '../common/constant';
import type { GemBookElement } from '../element';
import '../element';

(JSON.parse(String(process.env.PLUGINS)) as string[]).forEach((plugin) => {
  if (/^(https?:)?\/\//.test(plugin)) {
    const script = document.createElement('script');
    script.src = plugin;
    document.body.append();
    script.remove();
  } else {
    import(`../plugins/${plugin}`);
  }
});

const config = JSON.parse(String(process.env.BOOK_CONFIG));
const theme = JSON.parse(String(process.env.THEME));

const devRender = () => {
  if (theme) {
    const currentTheme = fetch(`/${DEV_THEME_FILE}`).then((res) => res.json());
    queueMicrotask(async () => {
      const book = document.querySelector<GemBookElement>('gem-book');
      if (book) book.theme = await currentTheme;
    });
  }
  return html`<gem-book src=${`/${DEFAULT_FILE}`}></gem-book>`;
};

const buildRender = () => {
  return html`<gem-book .config=${config} .theme=${theme}></gem-book>`;
};

render(
  html`
    <style>
      body {
        margin: 0;
      }
    </style>
    ${process.env.DEV_MODE ? devRender() : buildRender()}
  `,
  document.body,
);
