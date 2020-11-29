# Extension

`<gem-book>` allows multiple ways to expand.

## Parts

Parts allows you to customize `<gem-book>` but the internal style, currently only supported Part is `homepage-hero`.

```css
gem-book::part(homepage-hero) {
  background: #eee;
}
```

## Slots

[Slot](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/slot) allows you to customize `<gem-book>` but the content, currently supported slots are `sidebar-before`, `main-before`, `nav-inside`.

```html
<gem-book><div slot="sidebar-before">Hello</div></gem-book>
```

## Plugins

Plugins are custom elements that can be used in Markdown to customize the rendering content. Here is how to use the built-in plugin `<gbp-raw>`.

import plugin:

```bash
gem-book docs --plugins raw
```

or

```html
<script type="module" src="https://unpkg.com/gem-book/plugins/raw.js"></script>
```

Then use it in Markdown:

```md
<gbp-raw src="/src/plugins/raw.ts"></gbp-raw>
```

Any element can be used as a plugin, but if you want to read the data of `<gem-book>` like `<gbp-raw>`, you need to create a `GemBookPluginElement`, which extends from [`GemElement`](https://gem-docs.netlify.app/API/), obtain `GemBookPluginElement` and read `<gem-book>` configuration in the following way.

```js
customElements.whenDefined('gem-book').then(({ GemBookPluginElement }) => {
  customElements.define(
    'gbp-example',
    class extends GemBookPluginElement {
      constructor() {
        super();
        // GemBook.config
        console.log(this.config);
      }
    },
  );
});
```
