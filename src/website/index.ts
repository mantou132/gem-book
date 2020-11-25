import { render, html } from '@mantou/gem';
import { DEFAULT_FILE } from '../common/constant';
import '../element';

process.env.PLUGINS?.split(',').forEach((plugin) => {
  plugin && import(`../plugins/${plugin}`);
});

render(
  html`
    <style>
      body {
        margin: 0;
      }
    </style>
    ${process.env.DEV_MODE
      ? html`<gem-book src=${`/${DEFAULT_FILE}`}></gem-book>`
      : html`<gem-book .config=${JSON.parse(String(process.env.BOOK_CONFIG))}></gem-book>`}
  `,
  document.body,
);
