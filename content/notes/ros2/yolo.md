---
title: yolo
date: 2025-07-17 19:56:27
sticky: 4
categories:
    - ros2
tags:
    - ros2
disableNunjucks: true
---

---

## 1.坑1：

执行以下命令，在 **ROS 2 构建环境中** 安装 `ultralytics`：

```
source install/setup.bash
pip install ultralytics
```

这会确保你在构建后的隔离环境下也能访问 `ultralytics`。

## 2.坑2：

报错

```
ImportError: /usr/lib/aarch64-linux-gnu/libgomp.so.1: cannot allocate memory in static TLS block
```

这个错误来自于 Python 动态库（如 `ultralytics`/`YOLO`）在加载 OpenMP 并使用 Tensor 运算时，和 ROS 2 中的 rclpy 初始化过程发生冲突。它是 Jetson 和 ROS 2 中运行 YOLO 模型经常遇到的问题。

------

### ✅ **解决方案：在 Python 脚本开头延迟导入 YOLO 模块**

你现在是这样写的（错误）：

```
from ultralytics import YOLO
```

请将这句移动到 `predict_with_centerline()` 函数内部，比如这样👇：

### ⚠️ 原因解释：

Jetson 上的 `ultralytics` 使用了 PyTorch（底层调用 OpenMP 多线程库），而 ROS 2（尤其是 `rclpy`）使用了某些早期加载的 C 扩展，这会导致 **static TLS block 内存冲突**。推迟导入 YOLO 库就可以绕开这个问题。



## 3.加速方式:

## ✅ 什么是 TensorRT？

**TensorRT** 是由 NVIDIA 提供的 **高性能深度学习推理加速库**，用于在 NVIDIA GPU 上 **运行已训练好的模型（推理）**，特点是：

| 特性                        | 说明                                                         |
| --------------------------- | ------------------------------------------------------------ |
| **高性能**                  | 通过图优化、层融合、量化等技术，推理速度比 PyTorch 通常快 2-10 倍。 |
| **低延迟**                  | 更适合边缘设备（如 Jetson 系列）做实时推理（比如目标检测、语音识别）。 |
| **部署工具**                | 支持将 PyTorch、ONNX、TensorFlow 等训练好的模型导出成 `.engine` 二进制文件用于运行。 |
| **仅用于推理（inference）** | 不能训练模型，只能运行已经训练好的模型。                     |



------

## ✅ 什么是 PyTorch？

**PyTorch** 是一个由 Meta 开发的开源深度学习框架，主要用于：

| 特性                  | 说明                                                         |
| --------------------- | ------------------------------------------------------------ |
| **模型训练**          | 提供灵活的动态图机制，易于调试和开发，适合研究人员和开发者。 |
| **推理（inference）** | 支持模型训练之后直接在同一框架中进行推理（但速度不如 TensorRT）。 |
| **可扩展性**          | 可以用于从简单的神经网络到复杂的多模型系统。                 |
| **兼容性好**          | 与 Python 和生态系统结合紧密。                               |



------

## ✅ PyTorch 与 TensorRT 的区别总结

| 项目         | PyTorch                    | TensorRT                |
| ------------ | -------------------------- | ----------------------- |
| 用途         | 训练 + 推理                | 推理（部署）            |
| 性能         | 较慢，尤其在 Jetson 设备上 | 非常快，适合边缘设备    |
| 编程友好性   | 非常灵活，适合调试         | 更复杂，需要模型导出    |
| 是否支持训练 | ✅ 是                       | ❌ 否                    |
| 支持平台     | 所有常见平台               | 仅 NVIDIA GPU 平台      |
| 典型文件     | `.pt`, `.pth`              | `.engine`（从模型导出） |



------

## ✅ 一个典型流程是：

1. 用 **PyTorch 训练模型**，保存为 `.pt` 文件。
2. 用 **Ultralytics 或 ONNX 导出工具** 把模型转换为 TensorRT `.engine` 文件。
3. 在 Jetson 上用 **TensorRT 运行 `.engine` 文件**，速度更快、功耗更低。