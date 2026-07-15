# 终南山下，活死人墓 · 沉浸式入口

这是原 Hexo 博客的独立实验入口。它负责山雨封面、云幕开场和沉浸式主页；文章、分类、归档与正文仍由 `F:\hugo\hexo\blog` 提供。

`blog` 与 `new` 均为只读来源，本项目不会修改它们。

## 本地实时预览

```powershell
npm install
npm run dev
```

打开：<http://127.0.0.1:4173/>

Vite 会监听文件变化，保存 HTML、CSS 或 JavaScript 后浏览器自动刷新。

## 检查与构建

```powershell
npm test
npm run build
```

浏览器烟雾测试使用工作区已有的 Playwright 与 Microsoft Edge：

```powershell
& 'C:\Users\asus-\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'C:\Users\asus-\.codex\skills\webapp-testing\scripts\with_server.py' `
  --server "npm run dev" --port 4173 --timeout 40 -- `
  'C:\Users\asus-\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'F:\hugo\hexo\immersive\tests\smoke.py'
```

测试覆盖桌面滚轮开幕、四个入口、内容总览、资源/控制台错误、手机布局和减少动态效果模式。

## 博客链接基址

开发时，`index.html` 的 `<html data-blog-base>` 指向：

```text
http://localhost:5000/
```

独立部署前将它改成：

```text
https://www.dying4ever.cyou/
```

所有导航与入口链接均由 `src/content.js` 和 `data-blog-path` 统一生成。

## 首期范围

- 山、云、雨和舞台边幕组成的全屏封面
- 点击、滚轮、触摸和键盘触发的开幕动画
- Notes、Film、Life、Some Projects 四个不规则入口
- 原博客 About 与建站日志内容摘要
- 桌面、平板、手机和减少动态效果适配
- “重看开场”入口

首期不复制 Markdown、不替换 ShokaX 首页，也不自动部署线上版本。
