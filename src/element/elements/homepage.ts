import { html, css, GemElement, customElement, property, createStore, connectStore } from '@mantou/gem';
import '@mantou/gem/elements/link';
import '@mantou/gem/elements/use';
import '@mantou/gem/elements/unsafe';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { FrontMatter } from '../../common/frontmatter';
import { theme } from '../helper/theme';
import { getLinkPath } from '../lib/utils';
import { container } from './icons';
import { Main } from './main';

export const homepageData = createStore<FrontMatter>({});

@customElement('gem-book-homepage')
@connectStore(homepageData)
export class Homepage extends GemElement {
  @property displayRank?: boolean;

  renderHero() {
    if (!homepageData.hero) return null;
    const { title, desc, actions = [] } = homepageData.hero;
    return html`
      <style>
        .hero {
          text-align: center;
          padding: 3.5rem 1rem;
          background: ${theme.borderColor};
        }
        .title {
          margin: 0;
          padding: 0;
          font-size: 3rem;
          font-weight: 600;
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
          color: ${theme.linkColor};
          text-decoration: none;
          transition: all 0.3s;
        }
        gem-link:first-of-type {
          padding: 0.5rem 2rem;
          text-decoration: none;
          color: #fff;
          background: ${theme.linkColor};
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
      <div class="hero">
        <div class="body">
          <h1 class="title">${title}</h1>
          <p class="desc">${desc}</p>
          <div class="actions">
            ${actions.map(
              ({ link, text }, index) =>
                html`<gem-link href=${getLinkPath(link)}>
                  ${text}${index ? html`<gem-use .root=${container} selector="#arrow"></gem-use>` : ''}
                </gem-link>`,
            )}
          </div>
        </div>
      </div>
    `;
  }

  renderFeature() {
    if (!homepageData.features) return null;
    const parser = new Main();
    const featurecss = css`
      gem-link {
        color: ${theme.linkColor};
      }
    `;
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
          font-size: 1.5;
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
          ${homepageData.features.map(
            (feature) => html`
              <div class="feature ${feature.icon ? 'has-icon' : ''}">
                ${feature.icon ? html`<img class="icon" src=${feature.icon} />` : ''}
                <h3 class="feat-title">${feature.title}</h3>
                <p class="feat-desc">
                  <gem-unsafe content=${parser.parse(feature.desc)} contentcss=${featurecss}></gem-unsafe>
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
        }
        .body {
          margin: auto;
          width: 100%;
          max-width: ${theme.mainWidth};
        }
      </style>
      ${this.renderHero()}${this.renderFeature()}
    `;
  }
}
