# 扩展

`<gem-book>` 允许多种方式进行扩展。

## Parts

[Part](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part) 能让你自定义 `<gem-book>` 的内部样式，例如：

```css
gem-book::part(homepage-hero) {
  background: #eee;
}
```

## 插槽

[插槽](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/slot)能让你自定义 `<gem-book>` 但内容，目前支持的插槽有 `sidebar-before`, `main-before`, `nav-inside`。

```html
<gem-book><div slot="sidebar-before">Hello</div></gem-book>
```

## 插件

插件就是自定义元素，在 Markdown 中使用就能自定义渲染内容，下面是内置插件 `<gbp-raw>` 的使用方式。

引入插件：

```bash
gem-book docs --plugin raw
```

or

```html
<script type="module" src="https://unpkg.com/gem-book/plugins/raw.js"></script>
```

然后在 Markdown 中使用：

```md
<gbp-raw src="/src/plugins/raw.ts"></gbp-raw>
```

任意元素都可以作为插件，但如果你想像 `<gbp-raw>` 一样读取 `<gem-book>` 的数据，就需要创建 `GemBookPluginElement`, 他扩展自 [`GemElement`](https://gem-docs.netlify.app/API/)，通过下面这种方式获取 `GemBookPluginElement` 和读取 `<gem-book>` 配置。

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
