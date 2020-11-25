---
isNav: true
navTitle: 指南
---

# 简介

`<gem-book>` 是一个自定义元素，只需要在网页中插入该元素并指定配置文件即可。自带命令行 `gem-book`，
该命令行允许构建完成的前端资源或者仅生成配置文件供 `<gem-book>` 使用。

_`<gem-book>` 是为 [Gem](https://github.com/mantou132/gem) 创建的文档生成工具，其本身也是使用 Gem 编写，和 Gem 是共生关系。_

### 安装

```bash
# 如果只使用命令行，可以安装成全局依赖
npm -g install gem-book

# 如果要自己使用 <gem-book>，请安装成项目依赖
npm install gem-book
```

### 快速开始

```bash

# 创建文档
mkdir docs && echo '# Hello <gem-book>!' > docs/readme.md

# 编写和预览文档
gem-book docs

# 指定标题
gem-book docs -t MyApp

# 在 docs 目录添加 logo.png，指定 logo
gem-book docs -t MyApp -i /logo.png

# 将 readme.md/index.md 渲染成项目首页
gem-book docs -t MyApp -i /logo.png --home-mode

# 构建前端资源
gem-book docs -t MyApp -i /logo.png --home-mode --build

```

更多参数请查看[选项](./003-cli.md)。

### 使用 `<gem-book>`

```bash
# 仅生成 <gem-book> 需要 json 配置文件
gem-book docs -t MyApp -i /logo.png --home-mode --build --json
```

然后在你的项目中使用 `<gem-book>`：

```js
import { html, render } from '@mantou/gem';

// 导入 <gem-book>
import 'gem-book';

import config from './gem-book.json';

render(html`<gem-book .config=${config}></gem-book>`, document.body);
```

你可以在任何框架中使用 `<gem-book>` 元素。

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
