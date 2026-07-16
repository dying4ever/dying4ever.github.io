---
title: 换清华源（apt安装包紊乱）
date: 2025-10-20 17:46:49
sticky: 10
categories:
    - ubuntu
tags:
    - ubuntu
disableNunjucks: true
---

---

```
sudo nano /etc/apt/sources.list
```
然后把里面的内容全部删除，替换为下面 一整段
```
# 清华大学 TUNA Ubuntu Ports 镜像源 (适用于 Jetson, Ubuntu 20.04)
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-security main restricted universe multiverse
```
保存后退出（`Ctrl+O` → 回车 → `Ctrl+X`）。
然后执行以下命令刷新缓存并修复包依赖：
```
sudo apt clean
sudo apt update --fix-missing
sudo apt --fix-broken install -y
sudo apt update
```
