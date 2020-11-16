# Plugins

Plugins are custom elements, and you can extend Markdown with any custom elements. If you read the data of `<gem-book>`, you need to create a `GemBookPluginElement`, which extends from [`GemElement`](https://gem-docs.netlify.app/API/) through the following Way to get `GemBookPluginElement` and read `<gem-book>` configuration.

```js
customElements.whenDefined('gem-book').then((Book) => {
  const GemBookPluginElement = Book.GemBookPluginElement;

  customElements.define(
    'gem-book-plugin-example',
    class extends GemBookPluginElement {
      constructor() {
        super();
        console.log(this.config);
      }
    },
  );
});
```

The following is the built-in plugin `<gbp-raw>`, its function is to highlight the files of the current project:

<gbp-raw src="/src/plugins/raw.ts"></gbp-raw>

Import the plugin:

```html
<script type="module" src="https://unpkg.com/gem-book/plugins/raw.js"></script>
```

Use in Markdown:

```md
<gbp-raw src="/src/plugins/raw.ts"></gbp-raw>
```
