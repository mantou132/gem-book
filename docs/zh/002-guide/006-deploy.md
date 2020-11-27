# 部署成网站

只需要把前端资源（`index.html`，`gem-book.json`...）文档目录部署到服务器即可，由于 `<gem-book>` 使用了 [History API](https://developer.mozilla.org/en-US/docs/Web/API/History)，所以默认不支持 Github Pages。

### Netlify

Netlify 中配置发布脚本和发布目录，然后在项目中 `netlify.toml` 配置重定向规则：

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
