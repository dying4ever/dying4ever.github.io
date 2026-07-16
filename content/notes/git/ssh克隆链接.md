---
title: ssh克隆链接
date: 2026-03-05 16:13:28
sticky: 7
categories:
    - git
tags:
    - git
disableNunjucks: true
---

---

### 1 先检查有没有 ssh key
```bash
ls ~/.ssh
```
如果有
```
id_rsa
id_rsa.pub
```
说明已经有了。
如果没有就生成。
### 2 生成 SSH key
```bash
ssh-keygen -t ed25519 -C "你的github邮箱"
```
一直回车即可。
### 3 查看公钥
```bash
cat ~/.ssh/id_ed25519.pub
```
复制输出的一整行。
### 4 添加到 GitHub
打开：
```
GitHub
Settings
SSH and GPG keys
New SSH Key
```
把刚才的 key 粘进去。
### 5 测试连接
```bash
ssh -T git@github.com
```
如果成功会显示：
```
Hi dying4ever! You've successfully authenticated
```

### 6 用 SSH clone
不要用 https：
```bash
git clone git@github.com:Cloud-li1/TIS-robotic_arm.git
```

