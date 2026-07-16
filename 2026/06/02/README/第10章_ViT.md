---
title: 第10章_ViT
date: 2026-06-02 14:47:48
sticky: 11
categories:
    - 计算机视觉
    - 数字图像处理
tags:
    - 计算机视觉
    - 数字图像处理
---

# 第 10 章 视觉 Transformer ViT

## 本章概括
本章介绍 Transformer 在视觉任务中的应用。ViT 将图像划分为 patch，把每个 patch 映射为 token，再输入 Transformer Encoder。后续 Swin Transformer 通过窗口注意力和移动窗口构建层次化视觉特征。重点是理解图像如何被序列化以及窗口注意力如何降低计算量。

## ViT 基本思想
ViT 把图像划分为固定大小的 patch。每个 patch 展平成向量后通过线性层映射为 token，并加入位置编码。若图像大小为 $H\times W$，patch 大小为 $P\times P$，则 token 数为：

$$
N=\frac{HW}{P^2}
$$

patch 越小，token 越多，细节更丰富，但注意力计算量更大。

## Patch Embedding
每个 patch $x_p$ 映射为嵌入向量：

$$
z_0=[x_{class};x_p^1E;x_p^2E;\cdots;x_p^NE]+E_{pos}
$$

$x_{class}$ 是分类 token，$E$ 是 patch 投影矩阵，$E_{pos}$ 是位置编码。分类任务通常使用最终的 class token 表示整幅图像。

## Transformer Encoder
ViT 使用标准 Transformer Encoder，包括多头自注意力、MLP、残差连接和 LayerNorm。自注意力让任意 patch 之间可以直接交互，因此能建模长距离依赖。

## ViT 代码整理：加载预训练模型
这段代码用于加载预训练 ViT，并在测试集上做分类评估。

```python
import torch
from torchvision import datasets, transforms, models

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.vit_b_16(pretrained=True).to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

test_dataset = datasets.ImageFolder("/path/to/val", transform=transform)
test_loader = torch.utils.data.DataLoader(
    test_dataset, batch_size=32, shuffle=False, num_workers=4
)
```

`Resize((224,224))` 把输入调整到 ViT 预训练尺寸；`Normalize()` 使用 ImageNet 均值和标准差；`batch_size` 越大吞吐可能越高，但显存占用也越大。

## ViT 代码整理：微调分类头
这段代码用于把预训练 ViT 迁移到新的分类任务。

```python
import torch.nn as nn
from torchvision import models

num_classes = 10
model = models.vit_b_16(pretrained=True)
model.heads.head = nn.Linear(model.heads.head.in_features, num_classes)
model = model.to(device)
```

替换 `model.heads.head` 后，模型输出类别数变为下游任务类别数。若训练数据较少，可冻结 backbone 只训练分类头；若数据充足，可全模型微调。

## Swin Transformer
Swin Transformer 使用窗口自注意力，把注意力限制在局部窗口中，从而降低计算量。普通全局注意力复杂度约为 $O(N^2)$，窗口注意力只在窗口内计算，复杂度明显降低。

移动窗口 shifted window 让相邻窗口之间交换信息，弥补固定窗口无法跨窗口建模的问题。Swin 还通过 patch merging 构建层次化特征，类似 CNN 中分辨率逐步降低、通道数逐步增加的结构。

## 图示说明
ViT 图示重点看三步：图像切 patch、patch 变 token、token 输入 Transformer。Swin 图示重点看窗口划分和移动窗口：前者降低计算量，后者实现跨窗口信息交互。
