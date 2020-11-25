import { render, html } from '@mantou/gem';
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
    <gem-book .config=${JSON.parse(String(process.env.BOOK_CONFIG))}></gem-book>
  `,
  document.body,
);
