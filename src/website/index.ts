import { render, html } from '@mantou/gem';
import '../element';

// load plugins
import('../plugins/raw');

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
