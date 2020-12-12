# Theme

The `<gem-book>` element provides the theme API, which can be very convenient to customize the theme.

## Default theme

<gbp-raw src="/src/common/theme.ts"></gbp-raw>

## Custom theme

You can directly use the cli options to provide the theme file path in `json` format or build-in theme name:

```bash
gem-book docs --theme my-theme.json
gem-book docs --theme dark
```

You can also set the theme on `<gem-book>`.

```js
new GemBookElement(config, theme);
```

or

```js
html`<gem-book .config=${config} .theme=${theme}></gem-book>`;
```
