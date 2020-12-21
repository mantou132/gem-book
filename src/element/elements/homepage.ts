import { html, GemElement, customElement, part } from '@mantou/gem';
import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { theme } from '../helper/theme';
import { getUserLink, NavItemWithLink } from '../lib/utils';
import { bookStore } from '../store';
import { container } from './icons';
import { mdRender } from './main';

@customElement('gem-book-homepage')
export class Homepage extends GemElement {
  @part hero: string;

  renderHero({ hero }: NavItemWithLink) {
    if (!hero) return null;
    const { title, desc, actions } = hero;
    return html`
      <style>
        .hero {
          text-align: center;
          padding: 3.5rem 1rem;
          --tcolor: rgba(${theme.textColorRGB}, 0.03);
          --pcolor: rgba(${theme.primaryColorRGB}, 0.02);
          background: linear-gradient(var(--tcolor), var(--tcolor)), linear-gradient(var(--pcolor), var(--pcolor));
        }
        .title {
          margin: 0;
          padding: 0;
          font-size: 3rem;
          font-weight: bold;
        }
        .desc {
          opacity: 0.6;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          margin: 2rem;
          gap: 1rem;
          justify-content: center;
          align-items: center;
        }
        gem-link {
          color: ${theme.primaryColor};
          text-decoration: none;
          transition: all 0.3s;
        }
        gem-link:first-of-type {
          padding: 0.5rem 2rem;
          text-decoration: none;
          color: #fff;
          background: ${theme.primaryColor};
        }
        gem-link:hover {
          filter: brightness(1.1);
        }
        gem-use {
          margin-left: 0.3rem;
          transform: scale(1.3);
        }
        @media ${mediaQuery.PHONE} {
          .hero {
            padding: 2rem 1rem;
          }
          .title {
            font-size: 2rem;
          }
          gem-link:first-of-type {
            padding: 0.3rem 1rem;
          }
        }
        @media print {
          .hero {
            background: transparent;
          }
        }
      </style>
      <div class="hero" part=${this.hero}>
        <div class="body">
          ${!title ? '' : html`<h1 class="title">${title}</h1>`}
          ${!desc ? '' : html`<p class="desc">${mdRender.unsafeRender(desc)}</p>`}
          <div class="actions">
            ${actions?.map(
              ({ link, text }, index) =>
                html`<gem-link href=${getUserLink(link)}>
                  ${text}${index ? html`<gem-use .root=${container} selector="#arrow"></gem-use>` : ''}
                </gem-link>`,
            )}
          </div>
        </div>
      </div>
    `;
  }

  renderFeature({ features }: NavItemWithLink) {
    return html`
      <style>
        .features {
          padding: 3rem;
        }
        .features .body {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-column-gap: 1rem;
        }
        .icon {
          width: 30%;
          object-fit: contain;
        }
        .has-icon {
          text-align: center;
        }
        .feat-title {
          margin: 1rem 0;
          font-size: 1.5em;
          line-height: 1;
          font-weight: 300;
          opacity: 0.6;
        }
        .feat-desc {
          line-height: 1.5;
          margin: 1rem 0;
          letter-spacing: 0.05em;
          font-weight: 300;
        }
        @media ${mediaQuery.PHONE}, print {
          .features .body {
            display: block;
          }
          .feature {
            display: grid;
            grid-template-areas: 'icon content';
            grid-template-columns: auto 1fr;
            margin-bottom: 1rem;
          }
          .icon {
            grid-area: 1 / icon / 3 / icon;
            width: 5rem;
            margin-right: 1rem;
          }
          .feat-title {
            font-size: 1.5em;
          }
          .feat-title,
          .feat-desc {
            margin: 0;
            grid-area: auto / content;
          }
        }
      </style>
      <div class="features">
        <div class="body">
          ${features?.map(
            (feature) => html`
              <div class="feature ${feature.icon ? 'has-icon' : ''}">
                ${feature.icon ? html`<img class="icon" src=${feature.icon} />` : ''}
                <h3 class="feat-title">${feature.title}</h3>
                <p class="feat-desc">${mdRender.unsafeRender(feature.desc)}</p>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  render() {
    const homePage = bookStore.links?.find((e) => e.link === bookStore.homePage);
    if (!homePage) return null;
    return html`
      <style>
        :host {
          overflow: hidden;
        }
        .body {
          margin: auto;
          width: 100%;
          max-width: ${theme.mainWidth};
        }
        @media print {
          :host {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      </style>
      ${this.renderHero(homePage)}${this.renderFeature(homePage)}
    `;
  }
}
