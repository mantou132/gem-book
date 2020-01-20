import { render, html } from '@mantou/gem';
import '../../';

const config: BookConfig = {
  title: '<gem-book>',
  github: 'https://github.com/mantou132/gem-book',
  nav: [
    {
      title: 'Home',
      link: '/',
    },
  ],
  sidebar: [
    {
      title: 'Home',
      link: '/',
    },
    {
      title: 'Guide',
      children: [
        {
          title: 'Getting Started',
          link: '/introduction',
        },
        {
          title: 'Installation',
          link: '/installation',
        },
      ],
    },
  ],
};

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
