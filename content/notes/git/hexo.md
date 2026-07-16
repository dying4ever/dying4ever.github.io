---
title: hexo
date: 2026-02-05 19:49:57
sticky: 6
categories:
    - git
tags:
    - git
disableNunjucks: true
---

---

基本操作
```
#清理缓存
hexo cl 
#构建产物
hexo g 
#在线预览
hexo s 
#推送到GitHub
hexo d 
```
测试
```
hexo cl & hexo g & hexo s 

```
powershell
```
hexo clean; hexo g; hexo s
pnpm clean; pnpm build; pnpm run server -- -p 4000
```
上传
```
hexo cl & hexo g & hexo d
```