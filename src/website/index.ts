import { render, html } from '@mantou/gem';
import '../element';

// load plugins
import('../element/plugins/file');

render(
  html`
    <style>
      body {
        margin: 0;
      }
    </style>
    <gem-book src="/book.json"></gem-book>
  `,
  document.body,
);
