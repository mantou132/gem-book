# Deploy

You only need to deploy the front-end resources (`index.html`, `gem-book.json`...) document directory to the server, because `<gem-book>` uses [History API](https://developer.mozilla.org/en-US/docs/Web/API/History), so Github Pages is not supported by default.

### Netlify

Configure the publishing script and publishing directory in Netlify, and then configure the redirection rules in the project `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
