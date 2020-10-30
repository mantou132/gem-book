# Deploy

You only need to deploy the front-end resources (`index.html`, `book.json`...) document directory to the server, because `<gem-book>` uses [History API](https://developer.mozilla.org/en-US/docs/Web/API/History), so GithubPages is not supported by default.

### Netlify

Configure the publishing directory and publishing script in the Netlify backend, and then configure the redirection rules in the project:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
