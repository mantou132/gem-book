# 插件

插件就是自定义元素，你可以使用任何自定义元素扩展 Markdown。如果你读取 `<gem-book>` 的数据，就需要创建 `GemBookPluginElement`, 他扩展自 [`GemElement`](https://gem-docs.netlify.app/API/)，通过下面这种方式获取 `GemBookPluginElement` 和读取 `<gem-book>` 配置。

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

下面是内置的插件 `<gbp-raw>`，他的作用是高亮显示当前项目的文件：

<gbp-raw src="/src/element/plugins/file.ts"></gbp-raw>

在 Markdown 中使用：

```md
<gbp-raw src="/src/element/plugins/file.ts"></gbp-raw>
```
