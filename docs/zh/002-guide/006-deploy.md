# 部署

只需要把前端资源（`index.html`，`book.json`...）文档目录部署到服务器即可，由于 `<gem-book>` 使用了 [History API](https://developer.mozilla.org/en-US/docs/Web/API/History)，所以默认不支持 GithubPages。

### Netlify

Netlify 后台中配置发布目录和发布脚本，然后在项目中配置重定向规则：

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
