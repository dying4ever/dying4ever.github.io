---
title: slam
date: 2026-06-02 13:45:47
sticky: 2
categories:
    - 导航
    - slam
tags:
    - 导航
    - slam
---

# SLAM 算法常见分类

SLAM（Simultaneous Localization and Mapping，同步定位与建图）是指机器人在未知环境中，一边估计自身位置，一边构建环境地图。常见 SLAM 算法主要可以按传感器组合分为以下几类。
## 1. 激光 SLAM
激光 SLAM 主要使用 2D 或 3D 激光雷达进行定位与建图，常用于移动机器人、无人车和室内导航。

|算法|特点|
|---|---|
|GMapping|经典 2D 激光 SLAM，基于粒子滤波|
|Hector SLAM|不依赖里程计，适合高频激光雷达|
|Cartographer|Google 开源，支持 2D/3D，工程应用较多|
|Karto SLAM|基于图优化的 2D 激光 SLAM|
|LOAM|经典 3D 激光 SLAM|
|LeGO-LOAM|面向地面机器人的轻量化 3D 激光 SLAM|
|特点：精度较高、尺度准确、对光照不敏感；但激光雷达成本较高，语义信息较少。||

## 2. 视觉 SLAM

视觉 SLAM 主要使用相机进行定位与建图，包括单目、双目和 RGB-D 相机，常用于机器人、AR/VR 和无人机。

|算法|类型|特点|
|---|---|---|
|ORB-SLAM|单目|经典特征点法视觉 SLAM|
|ORB-SLAM2|单目/双目/RGB-D|支持多种相机输入|
|ORB-SLAM3|视觉/视觉惯性|支持 IMU，多地图能力更强|
|LSD-SLAM|单目|直接法，适合大尺度环境|
|DSO|单目|直接法，不依赖特征点|
|RTAB-Map|RGB-D/双目/激光|回环检测能力强，适合 RGB-D 建图|
|特点：相机成本低、信息丰富，可获取纹理和颜色；但对光照、运动模糊和弱纹理环境较敏感，单目还存在尺度不确定问题。|||

## 3. 视觉惯性 SLAM / VIO

视觉惯性 SLAM 使用相机和 IMU 融合。相机提供图像信息，IMU 提供加速度和角速度信息，可以提高快速运动场景下的稳定性。

|算法|特点|
|---|---|
|MSCKF|经典滤波式 VIO|
|OKVIS|优化式视觉惯性算法|
|VINS-Mono|经典单目 + IMU 算法|
|VINS-Fusion|支持单目、双目、IMU、GPS 融合|
|OpenVINS|开源 VIO 框架|
|特点：比纯视觉 SLAM 更稳定，适合无人机、AR/VR 和移动机器人；但需要相机与 IMU 标定，对时间同步要求较高。||

## 4. 激光惯性 SLAM / LIO

激光惯性 SLAM 使用激光雷达和 IMU 融合。激光雷达提供空间结构，IMU 提供高频运动信息，常用于高精度三维建图。

|算法|特点|
|---|---|
|LOAM|经典激光里程计与建图算法|
|LeGO-LOAM|针对地面机器人优化|
|LIO-SAM|激光 + IMU + GPS，基于因子图优化|
|FAST-LIO|实时性强，适合机载或车载平台|
|FAST-LIO2|速度快、精度高，工程应用较多|
|特点：精度高、实时性强、适合室外和三维建图；但传感器成本较高，标定和参数调试较复杂。||

## 5. 多传感器融合 SLAM

多传感器融合 SLAM 会同时使用激光雷达、相机、IMU、轮速计、GPS 等传感器，以提高系统鲁棒性。

| 算法                                                      | 传感器组合                | 特点           |
| ------------------------------------------------------- | -------------------- | ------------ |
| LIO-SAM                                                 | LiDAR + IMU + GPS    | 适合室外三维建图     |
| VINS-Fusion                                             | Camera + IMU + GPS   | 适合视觉惯性定位     |
| LVI-SAM                                                 | LiDAR + Visual + IMU | 融合激光、视觉和惯性信息 |
| R3LIVE                                                  | LiDAR + Camera + IMU | 可生成彩色三维地图    |
| Kimera                                                  | Camera + IMU         | 支持语义建图和三维重建  |
| 特点：鲁棒性强，能适应复杂环境，是机器人和自动驾驶的重要方向；但系统结构复杂，对标定、同步和计算资源要求较高。 |                      |              |

## 6. 工程场景选择

| 场景           | 常用方案                             |
| ------------ | -------------------------------- |
| 室内差速轮机器人     | 2D 激光 SLAM                       |
| ROS 2 小车建图导航 | SLAM Toolbox、Cartographer        |
| RGB-D 室内建图   | RTAB-Map、ORB-SLAM2 RGB-D         |
| 无人机定位        | VINS-Mono、VINS-Fusion            |
| 室外三维建图       | LOAM、LeGO-LOAM、LIO-SAM、FAST-LIO2 |
| 自动驾驶/高精度机器人  | LIO、多传感器融合 SLAM                  |

## 7. 总结

常见 SLAM 主要包括：激光 SLAM、视觉 SLAM、视觉惯性 SLAM、激光惯性 SLAM 和多传感器融合SLAM。对于 ROS 移动机器人，最常用的是激光 SLAM；对于无人机和 AR/VR，常用视觉惯性 SLAM；对于自动驾驶和高精度三维建图，常用激光惯性 SLAM 或多传感器融合 SLAM。