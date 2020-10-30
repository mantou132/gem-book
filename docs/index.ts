import { render, html } from '@mantou/gem';
import config from './book.json';
import '../src';

render(
  html`
    <style>
      body {
        margin: 0;
      }
    </style>
    <gem-book .config=${config}></gem-book>
  `,
  document.body,
);