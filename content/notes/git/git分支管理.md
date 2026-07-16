---
title: git分支管理
date: 2026-02-09 20:31:56
sticky: 4
categories:
    - git
tags:
    - git
disableNunjucks: true
---

---

## 1.创建并且切换到新分支
```
git checkout -b reproduce
```
等价于
```
git branch reproduce #创建新分支
git checkout reproduce #切换新分支
```
等价于
```
git switch reproduce # 切换分支
git switch -c reproduce # 创建并切换分支
git switch - # 切回上一个分支

```
## 2.查看分支
查看所有本地分支：
```
git branch
```
查看远程分支：
```
git branch -r
```
查看所有本地和远程分支：
```
git branch -a
```
## 3.合并分支
删除本地分支
```
git branch -d <branchname>
git branch -D <branchname>
```
删除远程分支：
```
git push origin --delete <branchname>
```
