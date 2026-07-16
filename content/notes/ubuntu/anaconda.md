---
title: anaconda
date: 2025-07-17 19:56:27
sticky: 1
categories:
    - ubuntu
tags:
    - ubuntu
disableNunjucks: true
---

---

```
conda create -n py2.7 python=
```

```
conda activate py2.7
```

```
conda deactivate
```

删除已有环境及其包

```
conda remove --name env_name --all
```

查看已有环境

```bash
conda env list
conda info -e
conda info --envs
```

 查询看当前环境中安装了哪些包

```
conda list
pip list
```

python版本

```
python --version
```

切换路径：先切换盘符
```
F:
cd \genesis
```
克隆环境
```
conda create --name new_name --clone old_name
```