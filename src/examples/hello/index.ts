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
          children: [
            {
              title: 'Started',
              link: '/introduction',
            },
          ],
        },
        {
          title: 'Installation',
          link: '/installation',
          children: [
            {
              title: '#dep1',
              link: '/installation#dep1',
            },
            {
              title: '#dep2',
              link: '/installation#dep2',
            },
          ],
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
