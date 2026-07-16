---
title: README
date: 2026-06-02 14:47:48
sticky: 1
categories:
    - 计算机视觉
    - 数字图像处理
tags:
    - 计算机视觉
    - 数字图像处理
---

# 数字图像处理笔记目录
本目录按课程学习顺序整理 13 份 PPT 对应的 Markdown 笔记。每份笔记保留原课件知识顺序，并补充公式解释、图示说明、算法步骤和代码参数说明。

| 章节 | 笔记 | 主要内容 | 复习重点 |
|---|---|---|---|
| 第1章 | [第01章_绪论.md](./第01章_绪论.md) | 图像处理概念、系统组成、应用领域、课程内容框架 | 图像处理与图像分析/理解的区别；图像矩阵表示；典型应用与处理目标 |
| 第2章 | [第02章_数字图像基础.md](./第02章_数字图像基础.md) | 视觉感知、采样量化、像素关系、距离度量、图像基本操作 | 采样/量化；4/8/m 邻接；距离公式；噪声模型；空间操作与图像变换 |
| 第3章 | [第03章_灰度变换与空域滤波.md](./第03章_灰度变换与空域滤波.md) | 灰度变换、直方图均衡/规定化、平滑滤波、锐化滤波 | 灰度映射公式；均衡 CDF；均值/高斯/中值滤波差异；Sobel 与 Laplacian 模板 |
| 第4章 | [第04章_频率域滤波.md](./第04章_频率域滤波.md) | DFT、频域滤波流程、低通/高通、同态滤波、陷波滤波 | 频谱含义；理想/Butterworth/高斯滤波差异；同态滤波模型；周期噪声陷波 |
| 第5章 | [第05章_形态学图像处理.md](./第05章_形态学图像处理.md) | 结构元、腐蚀膨胀、开闭运算、形态学算法、灰度形态学 | 腐蚀/膨胀定义；开闭运算效果差异；边界/填洞/连通分量公式；顶帽和黑帽 |
| 第6章 | [第06章_彩色图像处理.md](./第06章_彩色图像处理.md) | 彩色基础、颜色模型、伪彩色、彩色增强、彩色分割、噪声与压缩 | RGB/CMY/HSI 转换；HSI 分量含义；亮度与色度分离处理；彩色分割思路 |
| 第7章 | [第07章_图像分割.md](./第07章_图像分割.md) | 边缘检测、Canny、阈值分割、区域分割、分水岭 | 分割条件；Sobel/Laplacian/Canny；阈值选择；区域生长；标记分水岭 |
| 第8章 | [第08章_CNN.md](./第08章_CNN.md) | 卷积层、池化、ReLU、BN、VGG、ResNet | 卷积参数和输出尺寸；池化作用；ReLU/BN 公式；残差连接 |
| 第9章 | [第09章_Transformer.md](./第09章_Transformer.md) | Seq2seq、Encoder/Decoder、自注意力、Q/K/V、多头注意力 | Q/K/V 公式；softmax 权重；scaled attention；multi-head；mask 的作用 |
| 第10章 | [第10章_ViT.md](./第10章_ViT.md) | ViT patch embedding、Transformer Encoder、迁移学习代码、Swin Transformer | token 数公式；class token；位置编码；ViT 代码参数；window/shifted window |
| 第11章 | [第11章_特征点检测与匹配.md](./第11章_特征点检测与匹配.md) | Harris、SIFT、SURF、ORB、特征匹配、SuperGlue、LoFTR | Harris 响应；SIFT 尺度空间；OpenCV 参数；匹配距离；RANSAC；学习式匹配 |
| 第12章 | [第12章_目标检测.md](./第12章_目标检测.md) | 目标检测指标、数据集、R-CNN 系列、YOLO、Anchor、Mask R-CNN、DETR | IoU/PR/AP/mAP；two-stage vs one-stage；anchor 数量；RPN；DETR 集合预测 |
| 第13章 | [第13章_语义分割.md](./第13章_语义分割.md) | 语义分割定义、数据集、mIoU、FCN、U-Net、SegNet、DeepLab | 像素级分类；mIoU 公式；编码器-解码器；跳跃连接；空洞卷积和 ASPP |
