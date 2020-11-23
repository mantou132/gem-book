---
isNav: true
navTitle: Guide
---

# Introduction

`<gem-book>` is a custom element, you only need to insert the element in the web page and specify the configuration file. Comes with command line `gem-book`, you can use the command line to generate front-end resources with one click, or just generate the configuration file and then manually load the configuration using `<gem-book>`.

_`<gem-book>` is a document generation tool created for [Gem](https://github.com/mantou132/gem), and it also uses Gem, and Gem is a symbiotic relationship._

### Installation

```bash
# If you want to use <gem-book> by yourself
# please install it as a project dependency
npm install gem-book

# If you only use the command line
# you can install it as a global dependency
npm -g install gem-book

```

### Use `<gem-book>`

```bash
# Generate configuration file
gem-book docs

# Use watch mode, automatic configuration file generation
gem-book docs
```

Then use `<gem-book>` in your project:

```js
import { html, render } from '@mantou/gem';
import 'gem-book';

import config from './book.json';
render(html`<gem-book .config=${config}></gem-book>`, document.body);
```

You can use the `<gem-book>` element in any framework.

### Build a website with one click

```bash
# Write and preview
gem-book docs --serve

# Specify title
gem-book docs --serve -t MyApp

# Add logo.png in the docs directory and specify the logo
gem-book docs --serve -t MyApp -i /logo.png

# Render readme.md/index.md as the project homepage
gem-book docs --serve -t MyApp -i /logo.png --home-mode

# Build front-end resources
gem-book docs --serve -t MyApp -i /logo.png --home-mode --output-fe

```

### Rendering rules

The command line tool directly maps the directory structure to the sidebar structure. The level 1 and level 2 titles in the document will be used as the titles of the links in the sidebar. If there is no first-level title, the file name will be used.

### Goal

- Render the directory organized by Markdown files into pages
- Generate configuration files needed by `<gem-book>`
- Support custom rendering

### No-Goal

- Provide website
- Provide server

### Browser compatibility

| Chrome Latest | Firefox Latest | Safari Latest |
| ------------- | -------------- | ------------- |
| ✅            | ✅             | ✅            |
