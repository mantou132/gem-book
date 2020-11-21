---
isNav: true
navTitle: Docs
---

# 简介

`<gem-book>` 是一个自定义元素，只需要在网页中插入该元素并指定配置文件即可，配置文件可以通过配套的命令行工具生成。

_`<gem-book>` 是为 [Gem](https://github.com/mantou132/gem) 创建的文档生成工具，其本身也是使用 Gem 编写，和 Gem 是共生关系。_

### 安装

```bash
npm install gem-book
```

### 生成配置文件

```bash
# 生成的配置文件默认为 `book.json`
npx gem-book docs
```

使用 `--watch` 能持续监听目录，自动生成配置文件。查看命令行[更多](./002-guide/003-cli)选项。

### 使用 `<gem-book>`

如果你使用类似 [Webpack](https://webpack.js.org/) 的工具来打包前端项目，那么你可以在项目中这样使用 `<gem-book>`：

```js
// 使用 `lit-html`
import 'gem-book';
import config from './book.json';
html`<gem-book .config=${config}></gem-book>`;
```

或者

```js
// 使用 DOM API
import { Book } from 'gem-book';
import config from './book.json';
document.body.append(new Book(config));
```

如果你不需要集成一些其他的功能，那么你完全可以创建一个简单的 `html` 以使用 `<gem-book>`：

```html
<srcipt src=https://unpkg.com/gem-book></script>
<script>
  const book = document.createElement('gem-book');
  book.src = '/book.json';
  document.body.append(book);
</script>
```

并启动本地静态资源服务器来进行预览，比如 `serve docs -s`。

### 渲染规则

命令行工具会将目录结构直接映射成侧边栏结构。文档中的一级标题和二级标题会作为侧边栏的链接的标题，没有一级标题时会使用文件名。

### 目标

- 将 Markdown 文件组织的目录渲染成页面
- 生成 `<gem-book>` 需要的配置文件
- 支持自定义渲染

### 不是目标

- 提供网站
- 提供服务器

### 浏览器兼容性

| Chrome 最新版 | Firefox 最新版 | Safari 最新版 |
| ------------- | -------------- | ------------- |
| ✅            | ✅             | ✅            |
