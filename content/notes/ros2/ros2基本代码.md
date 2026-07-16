---
title: ros2基本代码
date: 2025-07-17 19:56:27
sticky: 3
categories:
    - ros2
tags:
    - ros2
disableNunjucks: true
---

---

### ros2安装

```
wget http://fishros.com/install -O fishros && bash fishros
```

### 安装:

jetson,树莓派:arm64

apt install:(一定要加./)

```
sudo apt install ./Downloads/名字.deb
```

apt-get install:用来从“软件源”安装“软件包名称”的，不是用来装本地 `.deb` 文件的。

### 卸载:

**通过Synaptic Package Manager删除**

Synaptic Package Manager 是基于APT的图形化包管理工具，

它不仅能列出ubuntu系统中所有已经安装的程序，还可以用于安装、卸载、升级软件。

系统默认没有此工具，因此需要先通过命令行来安装它。

```
sudo apt update
sudo apt install synaptic
```

