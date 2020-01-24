## `<gem-book>`

[Docute](https://github.com/egoist/docute) gem implementation

## usage

```bash
# install dependencies
npm i gem-book
# build configuration, specify the document directory `docs`
# save the configuration file to the src directory, default filename `book.json`
npx gem-book -o src docs
```

configuration file example: [book.json](https://github.com/mantou132/gem-book/blob/master/src/examples/hello/book.json).

next use custom elements `<gem-book>`

```js
// use `lit-html`
import 'gem-book';
import config from './book.json';
html`
  <gem-book .config=${config}></gem-book>
`;
```

or

```js
// use DOM API
import { Book } from 'gem-book';
import config from './book.json';
document.body.append(new Book(config));
```

or

```html
<srcipt src=https://unpkg.com/gem-book></script>
```

```js
const book = document.createElement('gem-book');
book.config = {...};
document.body.append(new Book(config));
```

## sort

`<gem-book>` just add the priority number to the document folder name and file name, e.g:

```
src/examples/hello/docs/
├── 002-guide
│   ├── README.md
│   └── installation.md
├── 003-about.md
└── README.md
```

output:

```
├── <README.md h1>
├── Guide
│   ├── <README.md h1>
│   └── Installation
└── About
```

## develop

```bash
# install the cli locally
npm link
# development cli
npm run watch
# development `<gem-book>`
npm run example
```

## TODO

- mobile style
