# 安装

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

## unpkg

```html
<srcipt src=https://unpkg.com/gem-book></script>
```

```js
const book = document.createElement('gem-book');
book.config = {...};
document.body.append(new Book(config));
```
