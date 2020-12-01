import { html, GemElement, customElement, property, createStore, connectStore } from '@mantou/gem';
import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { FrontMatter } from '../../common/frontmatter';
import { theme } from '../helper/theme';
import { getUserLink } from '../lib/utils';
import { container } from './icons';
import { mdRender } from './main';

export const homepageData = createStore<FrontMatter>({});

const placeholder = (s: string) => (s ? '' : 'placeholder');

@customElement('gem-book-homepage')
@connectStore(homepageData)
export class Homepage extends GemElement {
  @property displayRank?: boolean;

  renderHero() {
    const { title, desc, actions } = homepageData.hero || { title: '', desc: '', actions: [{ text: '', link: '' }] };
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
        .title.placeholder::before {
          width: 4em;
        }
        .desc {
          opacity: 0.6;
        }
        .desc.placeholder::before {
          width: 20em;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          margin: 2rem;
          gap: 1rem;
          justify-content: center;
          align-items: center;
        }
        .actions .placeholder::before {
          width: 5em;
          opacity: 0;
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
      </style>
      <div class="hero" part="hero">
        <div class="body">
          <h1 class="title ${placeholder(title)}">${title}</h1>
          ${desc === undefined ? '' : html`<p class="desc ${placeholder(desc)}">${desc}</p>`}
          <div class="actions">
            ${actions.map(
              ({ link, text }, index) =>
                html`<gem-link class=${placeholder(text)} href=${getUserLink(link)}>
                  ${text}${index ? html`<gem-use .root=${container} selector="#arrow"></gem-use>` : ''}
                </gem-link>`,
            )}
          </div>
        </div>
      </div>
    `;
  }

  renderFeature() {
    const { features = Array(3).fill({ title: '', desc: '' }) } = homepageData;
    if (features === null) return null;
    return html`
      <style>
        .features {
          padding: 3rem 1rem;
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
        .feat-title.placeholder::before {
          width: 5em;
        }
        .feat-desc.placeholder::before {
          width: 100%;
          height: 10em;
        }
        @media ${mediaQuery.PHONE} {
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
          ${features.map(
            (feature) => html`
              <div class="feature ${feature.icon ? 'has-icon' : ''}">
                ${feature.icon ? html`<img class="icon" src=${feature.icon} />` : ''}
                <h3 class="feat-title ${placeholder(feature.title)}">${feature.title}</h3>
                <p class="feat-desc ${placeholder(feature.desc)}">
                  ${mdRender.unsafeRender(
                    feature.desc,
                    `
                      a, gem-link {
                        background: rgba(${theme.primaryColorRGB}, 0.1);
                      }
                      a:hover, gem-link:hover {
                        background: rgba(${theme.primaryColorRGB}, 0.2);
                      }
                    `,
                  )}
                </p>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <style>
        :host {
          overflow: hidden;
          margin-bottom: -7rem;
        }
        .body {
          margin: auto;
          width: 100%;
          max-width: ${theme.mainWidth};
        }
        .placeholder {
          pointer-events: none;
        }
        .placeholder::before {
          max-width: 100%;
          content: 'x';
          display: inline-block;
          opacity: 0.05;
          background: currentColor;
        }
      </style>
      ${this.renderHero()}${this.renderFeature()}
    `;
  }
}
