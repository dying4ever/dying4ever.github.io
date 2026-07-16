---
title: 第08章_CNN
date: 2026-06-02 14:47:48
sticky: 9
categories:
    - 计算机视觉
    - 数字图像处理
tags:
    - 计算机视觉
    - 数字图像处理
---

# 第 8 章 卷积神经网络 CNN

## 本章概括
本章介绍 CNN 在图像任务中的基本结构，包括卷积层、池化层、ReLU、批归一化、经典网络 VGG 和 ResNet。重点是理解卷积如何提取局部特征，以及深层网络如何通过残差连接提高训练稳定性。

## 卷积神经网络概述
CNN 适合处理图像，因为它利用局部连接、权值共享和平移等变性。图像输入通常为 $H\times W\times C$ 张量，卷积层提取局部特征，池化层降低分辨率，最后通过全连接层或全局池化完成分类。

## 卷积 Convolution
二维卷积输出可写为：

$$
y(i,j)=\sum_m\sum_n x(i+m,j+n)w(m,n)+b
$$

其中 $x$ 是输入，$w$ 是卷积核，$b$ 是偏置。卷积核学习边缘、纹理、局部形状等特征。

卷积层常见参数：
- `in_channels`：输入通道数，例如灰度图为 1，RGB 图为 3。
- `out_channels`：卷积核个数，也是输出特征图通道数。
- `kernel_size`：卷积核大小，如 $3\times3$ 或 $5\times5$。
- `stride`：步幅，越大输出尺寸越小。
- `padding`：边缘填充，用于控制输出尺寸并保留边界信息。

输出尺寸为：

$$
H_{out}=\left\lfloor\frac{H+2P-K}{S}\right\rfloor+1
$$

其中 $H$ 为输入尺寸，$P$ 为 padding，$K$ 为卷积核大小，$S$ 为 stride。

## 池化 Pooling
池化用于降低特征图尺寸并增强局部平移鲁棒性。最大池化保留局部最大响应，适合突出显著特征；平均池化保留局部平均信息，平滑性更强。

## ReLU 激活函数
ReLU 定义为：

$$
\operatorname{ReLU}(x)=\max(0,x)
$$

它引入非线性，并缓解 sigmoid/tanh 的梯度饱和问题。负值被置零，正值保持不变。

## 批归一化 Batch Normalization
BN 对 mini-batch 中的特征进行归一化：

$$
\hat{x}=\frac{x-\mu_B}{\sqrt{\sigma_B^2+\epsilon}}
$$

再通过可学习参数恢复表达能力：

$$
y=\gamma\hat{x}+\beta
$$

BN 可稳定训练、加快收敛，并在一定程度上起到正则化作用。

## 经典 CNN 结构
### VGG
VGG 使用大量 $3\times3$ 卷积堆叠构建深层网络。小卷积核叠加可以扩大感受野，同时减少参数量并增加非线性层数。

### ResNet
ResNet 引入残差连接：

$$
y=F(x)+x
$$

其中 $F(x)$ 是残差分支，$x$ 是捷径连接。残差连接让网络学习输入与输出之间的差值，缓解深层网络退化问题。

## 代码整理
这段代码用于加载预训练 ResNet50，并自动选择 GPU 或 CPU。

```python
import torch
from torchvision import models

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50(pretrained=True).to(device)
model.eval()
```

`torch.device()` 用于选择运行设备；`models.resnet50(pretrained=True)` 加载在大规模数据集上预训练的模型；`.to(device)` 把模型移动到 GPU 或 CPU。若改为训练模式，需要调用 `model.train()`，并配合损失函数和优化器更新参数。
