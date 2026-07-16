---
title: git_flow
date: 2026-02-09 21:34:23
sticky: 2
categories:
    - git
tags:
    - git
disableNunjucks: true
---

---

Git Flow 是一种**基于分支的开发流程**，通过固定分支角色来管理开发、发布和修复。
## main（或 master）
- 永远保持稳定和可发布的状态。
- 每次发布一个新的版本时，都会从 `develop` 分支合并到 `master` 分支。
```
git switch main
git tag v1.0.0
```
### develop
- 用于集成所有的开发分支。
- 代表了最新的开发进度。
- 功能分支、发布分支和修复分支都从这里分支出去，最终合并回这里。
## 功能分支（feature）
- 用于开发新功能。
- 从 `develop` 分支创建，开发完成后合并回 `develop` 分支。
- 命名规范：`feature/feature-name`。
## 发布分支（release）
- 用于准备新版本的发布。
- 从 `develop` 分支创建，进行最后的测试和修复，然后合并回 `develop` 和 `master` 分支，并打上版本标签。
- 命名规范：`release/release-name`。

## 热修复分支（hotfix）
- 用于修复紧急问题。
- 从 `master` 分支创建，修复完成后合并回 `master` 和 `develop` 分支，并打上版本标签。
- 命名规范：`hotfix/hotfix-name`。

