import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';
import { getAlternateUrl, getRemotePath } from '../lib/utils';
import { bookStore } from '../store';

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
        ${lang && langList && !location.pathname.startsWith(`/${lang}`)
          ? html`<link rel="canonical" href=${getAlternateUrl(langList[0].code)} />`
          : ''}
        ${// 404 ?
        langList?.map(({ code }) => html`<link rel="alternate" hreflang=${code} href=${getAlternateUrl(code)} />`)}
      </gem-reflect>
    `;
  }
}
