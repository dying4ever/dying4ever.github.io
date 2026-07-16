---
title: git+hugo
date: 2025-11-20 23:38:21
sticky: 1
categories:
    - git
tags:
    - git
disableNunjucks: true
---

---

# 初始化
```
cd public
git init
git add .
git commit -m "update site"
git remote add origin https://github.com/zhangjingxuan123/dying4ever.github.io.git
git branch -M main
git push -f origin main
```
# 之后更新
```
hugo server
hugo -D --logLevel debug
cd public
git add .
git commit -m "update"
git push -f origin main
```
# hexo
```

```