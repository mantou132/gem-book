import { render, html } from '@mantou/gem';

export const container = document.createElement('div');

render(
  html`
    <svg id="arrow" width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.4 8.56L4.67 5M1.4 1.23L4.66 4.7" stroke="currentColor" stroke-linecap="square"></path>
    </svg>
    <svg id="link" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 100 100" width="15" height="15">
      <path
        fill="currentColor"
        d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
      ></path>
      <polygon
        fill="currentColor"
        points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
      ></polygon>
    </svg>
    <svg
      id="compose"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="currentcolor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      class="icon"
    >
      <path
        data-v-49573232=""
        d="M27 15 L27 30 2 30 2 5 17 5 M30 6 L26 2 9 19 7 25 13 23 Z M22 6 L26 10 Z M9 19 L13 23 Z"
      ></path>
    </svg>
  `,
  container,
);
