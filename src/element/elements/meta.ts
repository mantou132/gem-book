import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';
import { getAlternateUrl, getRemotePath } from '../lib/utils';
import { bookStore } from '../store';

import '@mantou/gem/elements/reflect';

@customElement('gem-book-meta')
@connectStore(bookStore)
export class Meta extends GemElement {
  render() {
    const { links, langList, lang } = bookStore;
    return html`
      <gem-reflect>
        ${mediaQuery.isDataReduce
          ? null
          : links
              ?.filter((e) => e.type === 'file')
              .map(({ originLink }) => html`<link rel="prefetch" href=${getRemotePath(originLink, lang)}></link>`)}

        <!-- search engine -->
        ${lang && langList && !location.pathname.startsWith(`/${lang}`)
          ? html`<link rel="canonical" href=${getAlternateUrl(langList[0].code)} />`
          : ''}
        ${langList?.map(({ code }) => html`<link rel="alternate" hreflang=${code} href=${getAlternateUrl(code)} />`)}
      </gem-reflect>
    `;
  }
}
