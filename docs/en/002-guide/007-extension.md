# Extension

`<gem-book>` renders markdown and also extends the markdown syntax. In addition, some methods are provided for users to customize `<gem-book>`.

## Markdown enhancement

### Highlight Code line

_Different from programming language code highlight_

````md 4-5
```md 3-4
# title

line 3
line 4
```
````

### Fixed heading anchor hash {#fixed-hash}

By default, hash is generated based on the title text field, but sometimes you need to fix the hash, such as internationalization.

```md
### Fixed heading anchor hash {#fixed-hash}
```

## Parts

[Part](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part) allows you to customize the internal style of `<gem-book>`, for example:

```css
gem-book::part(homepage-hero) {
  background: #eee;
}
```

## Slots

[Slot](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/slot) allows you to customize `<gem-book>` but the content, currently supported slots are `sidebar-before`, `main-before`, `main-after`, `nav-inside`.

```html
<gem-book><div slot="sidebar-before">Hello</div></gem-book>
```

## Plugins

Plugins are custom elements that can be used in Markdown to customize the rendering content. Here is how to use the built-in plugin `<gbp-raw>`.

import plugin:

```bash
gem-book docs --plugin raw
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
        console.log(GemBookPluginElement.config);
      }
    },
  );
});
```
