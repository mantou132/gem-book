# 文档元数据

允许在 Markdown 的开头添加 `yaml` 格式的元数据，允许你指定链接在侧边栏和导航栏中的显示方式。例如：

```md
---
title: 侧边栏标题
isNav: true
navTitle: 导航栏标题
sidebarIgnore: true
---

# Markdown 标题
```

此外，首页还支持 `hero` `features`，例如：

<gbp-raw src="/docs/en/README.md" range="-19"></gbp-raw>

完整定义：

<gbp-raw src="/src/common/frontmatter.ts"></gbp-raw>

你也可以使用 `config.yml` 为文件夹指定元数据。
