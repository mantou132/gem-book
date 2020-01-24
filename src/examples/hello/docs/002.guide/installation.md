# Installation

```bash
npm install gem-book
```

## lit-html

```js
import 'gem-book';
import config from './book.json';
html`
  <gem-book .config=${config}></gem-book>
`;
```

## vanilla js

```js
import { Book } from 'gem-book';
import config from './book.json';
document.body.append(new Book(config));
```
