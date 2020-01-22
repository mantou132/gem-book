## `<gem-book>`

[Docute](https://github.com/egoist/docute) gem implementation

## usage

```bash
# install dependencies
npm i gem-book
# build configuration
npx gem-book -o src docs
```

Configuration file example: [book.json](https://github.com/mantou132/gem-book/blob/master/src/examples/hello/book.json).

```js
import 'gem-book';
import config from './book.json';
html`
  <gem-book .config=${config}></gem-book>
`;
```

or

```js
import { Book } from 'gem-book';
import config from './book.json';
document.body.append(new Book(config));
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

- order
- mobile
