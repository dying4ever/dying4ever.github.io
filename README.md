# 终南山下，活死人墓

独立的沉浸式 Markdown 博客。首页负责山雨封面、云幕转场与长卷叙事；Notes、Film、Life、Projects、分类、归档、About、友链、建站日志和文章正文都由本项目静态生成，不依赖 Hexo。

## 本地实时预览

```powershell
npm install
npm run dev
```

打开 <http://127.0.0.1:4173/>。修改首页源码或 `content/` 下的 Markdown 后，预览会自动刷新。

导航中的“旧版”指向 `/legacy/`，用于保留迁移前的 Hexo/ShokaX 静态站。旧版与新站同域，不会打开另一个开发服务。

## Markdown 目录

```text
content/
├── notes/       旧博客一次迁移后的全部技术、论文与普通笔记
├── film/        电影与影评
├── life/        生活、旅行和随笔
├── projects/    项目记录
└── pages/       About、友链、项目说明和建站日志
```

对应路径分别是 `content/notes/`、`content/film/`、`content/life/`、`content/projects/` 与 `content/pages/`。

以后直接把 Markdown 与同名 `.assets` 文件夹放进对应父目录。旧文章保留原日期路由：

```text
/YYYY/MM/DD/文件名/
```

文章抬头沿用原格式：

```yaml
---
title: 文章标题
date: 2026-07-16 18:00:00
categories:
  - 分类
tags:
  - 标签
desc: 可选摘要
sticky: 0
---
```

`title` 和 `date` 必填；`categories`、`tags`、`desc`、`sticky` 可选。相对图片路径会在构建时随文章复制并保持可访问。

## 检查与构建

```powershell
npm test
npm run build
```

生产文件输出到 `dist/`，包含 131 篇已迁移 Notes、全部索引页、文章资源、`404.html` 和自定义域名 `www.dying4ever.cyou`。本地存在被 Git 忽略的 `.legacy-source/` 时，构建还会生成 `dist/legacy/`；旧版根路径会自动改写为 `/legacy/`。

浏览器验收：

```powershell
python tests/smoke.py
```

验收覆盖桌面开幕动画、山水长卷、序章、所有内容入口、131 篇 Notes、分类、归档、文章图片、手机菜单、横向溢出和控制台错误。

## 维护日志

每轮确认保留的网站改动都同步补充到 `content/pages/changelog.md`，按日期与版本倒序排列，让 `/changelog/` 始终先显示最新记录。日志写明主要变化、验证结果与修改位置；中间试验稿不单独记为正式版本。

## 部署

将 `dist/` 作为静态站点根目录发布。`public/CNAME` 会随构建进入产物，用于 `https://www.dying4ever.cyou/`。发布产物中的 `/legacy/` 是一次迁移后的旧版快照，不参与新站 Markdown 渲染。
