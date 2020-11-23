---
title: Custom elements for rendering markdown documents
hero:
  title: <gem-book>
  desc: Custom elements for rendering markdown documents.
  actions:
    - text: Getting Started
      link: ./guide/
features:
  - title: Out of the box
    desc: Just allow the command line and then you can load custom elements in your website, so that all attention can be paid to document writing
  - title: high-performance
    desc: No redundant dependencies, the entire application will run smoothly with streamlined code
  - title: Pluggable and expandable
    desc: Can insert custom elements into existing websites; using custom elements can also customize display documents very conveniently
---

## Getting Started

```bash
# Install gem-book
npm i gem-book

# Create docs
mkdir docs && echo '# Hello <gem-book>!' > docs/readme.md

# Preview docs
npx gem-book docs --serve

# Build
npx gem-book docs --output-fe
```

## Feedback

Please visit [GitHub](https://github.com/mantou132/gem-book)
