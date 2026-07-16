---
title: mklink
date: 2025-08-01 15:11:02
sticky: 1
categories:
    - 技巧
tags:
    - 技巧
disableNunjucks: true
---

---

### 1 基本功能和用途

在Windows系统里，文件和文件夹通常是独立存储和访问的。但有时候，你可能希望某个文件或文件夹在不同位置能有“分身”，方便在不同路径下访问相同的内容，或者在不同应用场景下复用配置、数据等。`mklink` 命令就可以帮助你实现这个目的，它创建的链接能让你在不复制文件或文件夹的情况下，从多个位置访问同一资源，节省磁盘空间，也方便管理。

### 2 命令语法和参数

`mklink` 命令的基本语法如下：

```bash
mklink [/D] [/H] [/J] Link Target
```

- **参数说明**：

- `/D`：创建目录符号链接。如果要为文件夹创建符号链接，就需要使用这个参数。
- `/H`：创建硬链接而不是符号链接。硬链接本质上是同一个文件的多个名称，它们指向磁盘上相同的数据块。
- `/J`：创建目录联接。目录联接类似于目录符号链接，但它只能用于本地磁盘分区。
- `Link`：指定要创建的符号链接或硬链接的名称，需要包含完整的路径。
- `Target`：指定链接所指向的目标文件或目录，同样需要完整路径。

### 3 使用示例

### 3.1 创建==文件==符号链接

```bash
mklink C:\Users\Username\LinkToFile.txt C:\Users\Username\OriginalFile.txt
```

这个命令在 `C:\Users\Username` 目录下创建了一个名为 `LinkToFile.txt` 的==符号链接==，它指向 `OriginalFile.txt`。之后访问 `LinkToFile.txt` 就相当于访问 `OriginalFile.txt`。

### 3.2 创建==目录==符号链接(文件夹)

```bash
mklink /D C:\Users\Username\LinkToFolder C:\Users\Username\OriginalFolder
```

这里使用了 `/D` 参数，在 `C:\Users\Username` 目录下创建了一个名为 `LinkToFolder` 的==目录符号链接==，它指向 `OriginalFolder`。

### 3.3 创建硬链接

```bash
mklink /H C:\Users\Username\HardLinkToFile.txt C:\Users\Username\OriginalFile.txt
```

此命令创建了一个硬链接 `HardLinkToFile.txt`，它和 `OriginalFile.txt` 指向磁盘上相同的数据，==对其中一个文件的修改会同时反映到另一个文件上。==

### 3.4 创建目录联接

```bash
mklink /J C:\Users\Username\JunctionToFolder C:\Users\Username\OriginalFolder
```

通过 `/J` 参数创建了一个目录联接 `JunctionToFolder`，它指向 `OriginalFolder`。

### 4 注意事项

- **权限要求**：在某些情况下，创建符号链接可能需要管理员权限。如果遇到权限不足的提示，需要以管理员身份运行命令提示符。  
    
- **链接类型差异**：符号链接和硬链接、目录联接有不同的特性和使用场景。

- 符号链接更灵活，可以跨磁盘分区，但可能会因为目标文件或目录的移动而失效；
- 硬链接只能用于文件，且只能在同一磁盘分区内创建；
- 目录联接只能用于目录，同样一般局限于本地磁盘分区。


### obsidian共享文件夹方法

1. 关闭所有 Obsidian 仓库：确保在操作过程中没有 Obsidian 正在运行，避免出现冲突。  

2. 找到配置和插件目录：

- 配置文件通常位于`仓库路径\Obsidian`目录下。
- 插件目录在`仓库路径\Obsidian\plugins`。

3. 创建[符号链接](https://zhida.zhihu.com/search?content_id=254082108&content_type=Article&match_order=1&q=%E7%AC%A6%E5%8F%B7%E9%93%BE%E6%8E%A5&zhida_source=entity)：

- 打开命令提示符（以管理员身份运行）。
- 假设你有两个仓库Vault1和Vault2，要让Vault2使用Vault1的配置和插件。可以使用以下命令创建符号链接：

```bash
mklink /D "仓库路径\Vault2\.obsidian" "仓库路径\Vault1\.obsidian"
```

如果你只想同步插件，修改上面的路径：

```bash
mklink /D "仓库路径\Vault2\.obsidian\plugins" "仓库路径\Vault1\.obsidian\plugins"
```

仓库路径可以通过 obsidian 仓库上右键点击“在系统资源管理器中显示”查看。

**_注意：运行代码前，应删除被同步仓库下对应名称的文件夹，不然会报错，提示文件已存在。比如，运行上面的代码前，应删除Vault2仓库的 `.obsidian` 或 `.obsidian\plugins` 文件夹。_**

4. 如果有Vault3、Vault4，重复上面的代码，将Vault2替换为Vault3、Vault4即可。