import { render, html } from '@mantou/gem';
import { DEFAULT_FILE, DEV_THEME_FILE } from '../common/constant';
import type { GemBookElement } from '../element';
import '../element';

process.env.PLUGINS?.split(',').forEach((plugin) => {
  plugin && import(`../plugins/${plugin}`);
});

const devRender = () => {
  const theme = fetch(`/${DEV_THEME_FILE}`).then((res) => res.json());
  queueMicrotask(async () => {
    const book = document.querySelector<GemBookElement>('gem-book');
    if (book) book.theme = await theme;
  });
  return html`<gem-book src=${`/${DEFAULT_FILE}`}></gem-book>`;
};

const buildRender = () => {
  const config = JSON.parse(String(process.env.BOOK_CONFIG));
  const theme = JSON.parse(String(process.env.THEME));
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
