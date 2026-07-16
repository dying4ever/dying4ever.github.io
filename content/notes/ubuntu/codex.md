---
title: codex
date: 2026-03-10 14:49:13
sticky: 2
categories:
    - ubuntu
tags:
    - ubuntu
disableNunjucks: true
---

---

配node js环境
https://blog.csdn.net/qq_41308489/article/details/152047165
```
sudo apt update
sudo apt upgrade
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs
node --version
npm --version
```
安装 Codex CLI：
```
npm install -g @openai/codex
```

### 报错
Token exchange failed: token endpoint returned status 403 Forbidden
这个错误通常出现在 Codex 登录流程的最后一步：浏览器完成授权后，尝试回调到本地端口，但 Codex CLI 没能接收到这个回调。
```
    set NO_PROXY=127.0.0.1,localhost
    set HTTP_PROXY=http://127.0.0.1:PORT
    set HTTPS_PROXY=http://127.0.0.1:PORT
```