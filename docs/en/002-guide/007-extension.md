# Extension

`<gem-book>` renders markdown and also extends the markdown syntax. In addition, some methods are provided for users to customize `<gem-book>`.

## Markdown enhancement

### Highlight code line

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

`<gem-book>` uses custom elements as a plugin system, they can customize the rendering of Markdown content or enhance the ability of `<gem-book>`. The following is how to use the built-in plugin `<gbp-raw>`.

import plugin:

```bash
gem-book docs --plugin raw
```

or

```html
<script type="module" src="https://unpkg.com/gem-book/plugins/raw.js"></script>
```

Then use it in Markdown to render files in the warehouse:

```md
<gbp-raw src="/src/plugins/raw.ts"></gbp-raw>
```

Any element can be used as a plugin, but if you want to read the data of `<gem-book>` like `<gbp-raw>`, you need to use `GemBookPluginElement`, which extends from [`GemElement`](https://gem-docs.netlify.app/API/), obtain `GemBookPluginElement` and read `<gem-book>` configuration in the following way.

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

Some plugin need to be used with slots, such as the built-in plugin `<gbp-comment>`, which uses [Gitalk](https://github.com/gitalk/gitalk) to bring comments to the website:

```html
<gem-book>
  <gbp-comment slot="main-after" client-id="xxx" client-secret="xxx"></gbp-comment>
</gem-book>
```

If you use the built-in command line to build a website, `<gem-book>` is automatically inserted into the document, you need to use `--template` to specify the template file, and then use the DOM API to load the `<gbp-comment>` in the template:

```html
<script>
  addEventListener('load', () => {
    const commentElement = document.createElement('gbp-comment');
    commentElement.slot = 'main-after';
    commentElement.clientId = 'xxx';
    commentElement.clientSecret = 'xxx';
    document.querySelector('gem-book').append(commentElement);
  });
</script>
```
