# 自定义主题

`<gem-book>` 元素提供了主题的 API，可以非常方便的来自定义主题。

## 默认主题

<gbp-raw src="/src/common/theme.ts"></gbp-raw>

## 自定义主题

可以直接使用命令行参数提供 `json` 格式的主题文件路径或者内置主题名称：

```bash
gem-book docs --theme my-theme.json
gem-book docs --theme dark
```

也可以在 `<gem-book>` 上设置主题。

```js
new GemBookElement(config, theme);
```

或者

```js
html`<gem-book .config=${config} .theme=${theme}></gem-book>`;
```
