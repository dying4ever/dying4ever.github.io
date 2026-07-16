---
title: FAST-LIVO
date: 2026-06-02 14:34:31
sticky: 1
categories:
    - 导航
    - slam
tags:
    - 导航
    - slam
---

# FAST-LIVO
可参考教程：[FAST-LIVO2](https://gitee.com/gwmunan/ros2/wikis/pages?sort_id=13524686&doc_id=4855084#fast-livo2%E7%9A%84%E9%83%A8%E7%BD%B2%E4%B8%8E%E9%85%8D%E7%BD%AE)
“ **一个极其高效的，抵抗各种极端退化环境，可达像素级精度，首个可以用到UAV自动导航的激光雷达-视觉-惯性里程计，并可以实时重建高精度彩色点云地图** ”

**辨析**
>FAST-LIVO 在 FAST-LIO/LIO 的基础上加入了**相机视觉约束**，利用图像的光度信息和纹理信息辅助定位，属于 LiDAR-Inertial-Visual Odometry。后续 FAST-LIVO2 进一步把 LiDAR、IMU、图像测量统一到 ESIKF 中，并使用直接法处理 LiDAR 和视觉测量
# FAST-LIVO 笔记：原理、复现与拓展流程

## 1. FAST-LIVO 概念与核心思想

FAST-LIVO 全称为 Fast and Tightly-coupled Sparse-Direct LiDAR-Inertial-Visual Odometry，是一种激光、惯性、视觉紧耦合里程计系统。

它在 FAST-LIO 的基础上加入相机信息，形成 LiDAR + IMU + Camera 的多传感器融合定位方法。
FAST-LIO2 主要依靠激光点云几何结构和 IMU 估计位姿，而 FAST-LIVO 进一步利用图像纹理和光度信息，在几何退化场景下提升定位鲁棒性。简单理解：FAST-LIO2 = LiDAR + IMU，FAST-LIVO = LiDAR + IMU + Camera。

整体流程：IMU 预测位姿 -> LiDAR 点云与地图匹配 -> Camera 进行直接法光度跟踪 -> 融合更新状态 -> 输出位姿和地图。

## 2. 为什么加入视觉信息

纯激光惯性系统在普通环境中已经很强，但在长走廊、空旷区域、重复结构、平面墙面等场景中，点云几何约束可能不足，容易出现退化。视觉信息可以提供纹理、颜色、边缘等信息，用来补充激光的不足。例如白墙走廊中，激光看到的几何结构比较相似，但相机可能看到墙上的海报、门框、纹理变化，这些信息可以帮助系统更稳定地估计位姿。因此 FAST-LIVO 更适合复杂室内环境、移动机器人、无人机和多传感器建图任务。

## 3. 系统组成

|模块|输入|作用|
|---|---|---|
|IMU 预测|加速度、角速度|高频预测运动状态，提供初值|
|LiDAR 更新|点云|利用空间几何结构约束位姿|
|Camera 更新|图像|利用光度误差和纹理信息约束位姿|
|状态估计|IMU + LiDAR + Camera|融合更新最终位姿|
|地图维护|点云地图/视觉地图|保存环境结构信息，辅助后续匹配|

FAST-LIVO 使用稀疏直接法处理视觉信息。直接法不依赖 ORB、SIFT 等特征点，而是直接比较图像块的灰度或亮度变化。常见光度误差形式为：  
$$  
E=\sum_i \left(I_t(u_i)-I_r(u_i')\right)^2  
$$  
其中，$I_t$ 表示当前图像，$I_r$ 表示参考图像，$u_i$ 和 $u_i'$ 表示同一空间点在不同图像中的像素位置。优化目标是让同一位置在不同图像中的亮度尽可能一致，从而反推出相机和机器人的运动。

## 4. FAST-LIVO 与常见 SLAM 方法对比

|方法|传感器|类型|特点|
|---|---|---|---|
|ORB-SLAM3|Camera / Camera + IMU|视觉 SLAM|特征点法，依赖图像特征|
|VINS-Fusion|Camera + IMU|VIO|经典视觉惯性系统|
|FAST-LIO2|LiDAR + IMU|LIO|速度快，依赖点云几何|
|LVI-SAM|LiDAR + Camera + IMU|LVI 融合|激光和视觉相对模块化|
|FAST-LIVO|LiDAR + Camera + IMU|LIVO|紧耦合，融合几何与视觉纹理|

简单来说，FAST-LIO2 更偏向高效激光惯性建图，FAST-LIVO 更偏向复杂场景下的多传感器鲁棒定位。

## 5. 复现准备

复现 FAST-LIVO 前，需要先准备 LiDAR、IMU、Camera 三类传感器，并保证三件事：话题正常、时间同步正常、外参标定正确。推荐不要一开始直接跑 FAST-LIVO，而是按传感器和模块逐步验证。

硬件准备：LiDAR + IMU + Camera -> 工控机/笔记本/Jetson -> ROS 环境 -> FAST-LIVO 源码。

常见传感器组合：Livox Mid360 + 相机 + IMU，或 Velodyne/Ouster + 工业相机 + IMU。若使用 RealSense D435i，需要注意它自带 IMU 和相机，但 LiDAR 与相机之间仍然需要外参标定。

## 6. 复现流程

复现建议顺序：安装依赖 -> 编译源码 -> 启动传感器驱动 -> 检查 ROS 话题 -> 标定外参 -> 先跑 FAST-LIO2 -> 再接入相机跑 FAST-LIVO -> 录包与回放调试 -> 参数优化。

### 6.1 环境与源码

先确认 ROS 版本、PCL、Eigen、OpenCV、Livox SDK 或对应 LiDAR 驱动是否安装正常。然后创建工作空间并编译：

```bash
mkdir -p ~/fast_livo_ws/src
cd ~/fast_livo_ws/src
git clone <FAST-LIVO 仓库地址>
cd ..
colcon build
source install/setup.bash
```

`colcon build` 用于编译 ROS2 工作空间，`source install/setup.bash` 用于加载当前工作空间环境。如果找不到包或 launch 文件，优先检查是否执行了 `source`。

### 6.2 传感器话题检查

启动传感器驱动后，检查关键话题是否存在：

```bash
ros2 topic list
ros2 topic hz /imu/data
ros2 topic hz /camera/image_raw
ros2 topic hz /livox/lidar
```

`ros2 topic list` 用于查看当前 ROS 系统中的话题；`ros2 topic hz` 用于查看话题发布频率。IMU 频率通常较高，相机频率一般为 20～30 Hz，LiDAR 频率根据型号不同可能为 10 Hz 或更高。如果频率不稳定，后续定位容易漂移或失败。

### 6.3 时间同步

时间同步是 FAST-LIVO 复现的关键。IMU、LiDAR、Camera 的时间戳必须尽量一致，否则会出现轨迹漂移、地图重影、图像跟踪失败等问题。理想情况是硬件同步，例如触发同步、PPS 同步或统一硬件时钟；如果没有硬同步，至少要保证系统时间一致，并检查 ROS 消息时间戳是否正常。

检查思路：查看每个话题 header.stamp -> 对比传感器时间差 -> 判断是否存在明显延迟 -> 必要时使用 rosbag 回放分析。

### 6.4 外参标定

FAST-LIVO 至少需要 LiDAR-IMU 外参和 Camera-IMU 外参，也可以理解为要知道三个传感器之间的空间安装关系。常见外参包括：  
$$  
T_{LI}  
$$  
表示 LiDAR 到 IMU 的变换，$$  
T_{CI}  
$$  
表示 Camera 到 IMU 的变换。外参错误会直接导致地图扭曲、轨迹发散、视觉投影不准等问题。

外参调试顺序：先保证 IMU 方向正确 -> 再保证 LiDAR 点云不扭曲 -> 再检查相机图像与点云投影是否对齐。

### 6.5 先跑 FAST-LIO2

在接入视觉前，建议先单独跑 FAST-LIO2 或 FAST-LIVO 中的 LIO 部分。原因是 FAST-LIVO 建立在激光惯性里程计稳定的基础上，如果 LIO 本身就不稳定，加入视觉后问题会更难排查。

判断标准：点云地图不明显重影，轨迹连续，机器人静止时位姿不剧烈抖动，快速转动时地图不发散。

### 6.6 再跑 FAST-LIVO

当 LiDAR + IMU 已经稳定后，再接入相机图像。启动顺序通常是：传感器驱动 -> FAST-LIVO 配置文件 -> FAST-LIVO launch -> RViz 可视化。重点观察轨迹是否连续、点云地图是否扭曲、视觉跟踪是否稳定、CPU 占用是否过高。

如果视觉加入后效果变差，优先检查相机外参、时间同步、图像曝光、图像模糊和相机内参。

## 7. 配置文件重点参数

|参数类别|关注内容|说明|
|---|---|---|
|话题名称|LiDAR、IMU、Camera topic|必须和实际 ROS 话题一致|
|相机内参|$f_x,f_y,c_x,c_y$|决定图像投影是否准确|
|相机畸变|$k_1,k_2,p_1,p_2$ 等|畸变不准会影响视觉误差|
|外参矩阵|$T_{LI},T_{CI}$|决定传感器空间关系|
|IMU 噪声|gyro、acc noise|影响预测和滤波稳定性|
|图像参数|分辨率、曝光、帧率|影响视觉跟踪效果|
|点云参数|过滤范围、体素大小|影响速度和建图质量|

参数调试原则：先保证话题和外参正确，再调噪声参数和滤波参数；先低速运动测试，再增加运动幅度；先室内简单场景测试，再进入复杂环境。

## 8. 常见问题与排查

|问题|可能原因|排查方向|
|---|---|---|
|地图重影|时间不同步、外参错误|检查时间戳和 $T_{LI}$|
|轨迹漂移严重|IMU 参数错误、LiDAR 退化|检查 IMU 噪声和点云质量|
|加入视觉后变差|相机外参错误、曝光不合适|检查 $T_{CI}$、图像质量|
|图像跟踪失败|运动模糊、纹理太弱|提高快门速度，降低运动速度|
|点云扭曲|IMU-LiDAR 同步问题|检查 deskew 和时间戳|
|编译失败|依赖缺失、ROS 版本不匹配|检查 PCL、OpenCV、Eigen、SDK|
|CPU 占用高|图像分辨率高、点云过密|降分辨率、加体素滤波|

## 9. 拓展流程

### 9.1 FAST-LIVO2

FAST-LIVO2 是 FAST-LIVO 的后续改进版本，通常在速度、精度和系统统一性上更强。如果目标是做长期研究或工程部署，可以优先关注 FAST-LIVO2。学习路线：FAST-LIO2 -> FAST-LIVO -> FAST-LIVO2。

### 9.2 接入 Nav2

FAST-LIVO 可以作为定位模块，为机器人导航提供位姿估计。典型链路为：FAST-LIVO 输出 odom/pose -> 转换为 Nav2 可用 TF -> Nav2 使用地图和定位进行规划 -> 输出 `/cmd_vel` -> 底盘执行。重点是保证 TF 链完整，例如 `map -> odom -> base_link -> lidar/camera`。

### 9.3 生成彩色点云地图

由于 FAST-LIVO 同时有点云和图像，可以进一步把图像颜色投影到点云上，生成彩色点云地图。流程为：LiDAR 点云 -> 根据外参投影到图像平面 -> 读取像素颜色 -> 给点云赋 RGB -> 保存彩色点云地图。

### 9.4 加入语义信息

可以结合 YOLO、语义分割或目标检测模型，把图像中的目标类别加入地图。流程为：相机图像 -> 目标检测/语义分割 -> 与点云关联 -> 生成带类别标签的语义地图。这个方向适合机器人导航、具身智能、场景理解和安全避障。

### 9.5 加入 GPS/RTK

如果在室外使用，可以加入 GPS 或 RTK，形成局部高精度 + 全局无漂移的系统。流程为：FAST-LIVO 提供局部连续位姿 -> RTK 提供全局位置约束 -> 融合优化 -> 输出全局一致轨迹。

## 10. 学习与复现建议

推荐学习顺序：FAST-LIO2 原理 -> ESKF/ESIKF -> 点云配准与 ikd-Tree -> 视觉直接法 -> FAST-LIVO 系统结构 -> 传感器标定与同步 -> 真机部署。复现时不要一上来改源码，先跑通官方数据集，再跑自己的 rosbag，最后上真机实时运行。

最重要的复现原则：先让 IMU 正常，再让 LiDAR + IMU 稳定，再加入 Camera；先解决时间同步和外参，再考虑调算法参数。