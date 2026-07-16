---
title: navigation2
date: 2026-06-02 14:09:27
sticky: 1
categories:
    - 导航
    - navigation2
tags:
    - 导航
    - navigation2
---

# ROS 2 Navigation2 
Navigation2，简称 Nav2，是 ROS 2 中的自主导航框架，主要作用是让移动机器人基于地图、定位、传感器和目标点，自主规划路径、避开障碍物，并输出速度指令控制底盘运动。

## 1. Nav2 的基本作用

Nav2 解决的是“机器人如何从当前位置自主移动到目标点”的问题。它并不负责底盘电机的底层控制，而是根据地图和传感器信息计算运动指令，最终发布 `/cmd_vel` 给底盘驱动节点。

```text
地图 + 定位 + 传感器 + 目标点
        ↓
Navigation2
        ↓
/cmd_vel
        ↓
底盘驱动
        ↓
机器人运动
```

## 2. Nav2 和 SLAM 的关系

SLAM 主要负责建图和定位，Nav2 主要负责路径规划和运动控制。

| 模块   | 作用         | 常见输出                      |
| ---- | ---------- | ------------------------- |
| SLAM | 建图与定位      | `/map`、`map → odom`       |
| AMCL | 已知地图下定位    | `/amcl_pose`、`map → odom` |
| Nav2 | 路径规划、避障、控制 | `/cmd_vel`                |

## 3. Nav2 的两种常见模式

| 模式        | 说明                          | 常用场景         |
| --------- | --------------------------- | ------------ |
| SLAM 建图导航 | 边建图边导航，SLAM 发布地图和定位信息       | 新环境建图        |
| 已知地图导航    | 加载已有地图，用 AMCL 定位，再由 Nav2 导航 | 固定场地巡逻、服务机器人 |

建图阶段通常使用 SLAM Toolbox 或 Cartographer；已有地图导航阶段通常使用 map_server 加载地图，AMCL 负责定位，Nav2 负责规划和控制。

## 4. Nav2 核心模块

|模块|作用|
|---|---|
|Map Server|加载并发布静态地图 `/map`|
|AMCL|根据激光雷达和地图估计机器人位姿|
|Planner Server|全局路径规划，决定从当前位置到目标点的大致路线|
|Controller Server|局部路径跟踪，计算实时速度指令|
|Costmap|代价地图，表示哪里能走、哪里不能走|
|BT Navigator|行为树导航器，负责组织导航任务流程|
|Behavior Server|恢复行为，如原地旋转、后退、清除代价地图|
|Lifecycle Manager|管理 Nav2 各节点的生命周期状态|

## 5. Nav2 工作流程

```text
1. 加载地图
2. AMCL 或 SLAM 提供机器人定位
3. 用户在 RViz 或程序中发送目标点
4. Planner Server 规划全局路径
5. Controller Server 跟踪路径并实时避障
6. Nav2 发布 /cmd_vel
7. 底盘驱动接收速度指令并控制机器人运动
8. 到达目标点或执行恢复行为
```

## 6. 关键话题

|话题|类型|作用|
|---|---|---|
|`/map`|`nav_msgs/OccupancyGrid`|地图|
|`/scan`|`sensor_msgs/LaserScan`|激光雷达数据|
|`/odom`|`nav_msgs/Odometry`|里程计|
|`/tf`|TFMessage|动态坐标变换|
|`/tf_static`|TFMessage|静态坐标变换|
|`/cmd_vel`|`geometry_msgs/Twist`|速度控制指令|
|`/goal_pose`|`geometry_msgs/PoseStamped`|导航目标点|
|`/amcl_pose`|`geometry_msgs/PoseWithCovarianceStamped`|AMCL 定位结果|
## 7. 关键 TF 坐标关系

Nav2 对 TF 要求很严格，常见坐标关系如下：

```text
map → odom → base_link/base_footprint → laser
```

|坐标系|含义|
|---|---|
|`map`|全局地图坐标系，和地图绑定|
|`odom`|里程计坐标系，短时间连续但会漂移|
|`base_link`|机器人本体坐标系|
|`base_footprint`|机器人底盘投影坐标系|
|`laser`|激光雷达坐标系|

一般情况下，`odom → base_link` 由底盘里程计发布，`base_link → laser` 由 URDF 或静态 TF 发布，`map → odom` 由 AMCL 或 SLAM 发布。

## 8. Costmap 代价地图

Costmap 是 Nav2 判断障碍物和可通行区域的重要模块。它会把环境划分为可通行区域、障碍物区域、未知区域和膨胀区域。

|Costmap|作用|
|---|---|
|Global Costmap|用于全局路径规划|
|Local Costmap|用于局部避障和路径跟踪|

常见 layer 包括 Static Layer、Obstacle Layer、Voxel Layer 和 Inflation Layer。Static Layer 来自静态地图，Obstacle Layer 来自激光雷达等传感器，Inflation Layer 用来给障碍物周围增加安全距离。

## 9. Planner 和 Controller

|模块|作用|常见算法|
|---|---|---|
|Planner Server|规划从起点到终点的全局路径|NavFn、Smac Planner、Theta*|
|Controller Server|跟踪路径并输出速度指令|DWB、Regulated Pure Pursuit、MPPI|

简单理解：Planner 负责“走哪条路”，Controller 负责“怎么沿着这条路走”。

## 10. Behavior Tree 行为树

Nav2 使用行为树组织导航流程，不是简单地规划一次路径就一直执行。导航过程中如果失败，可以自动执行恢复行为。

```text
接收目标点 → 计算路径 → 跟踪路径 → 判断是否失败 → 恢复行为 → 重新规划 → 到达目标点
```

常见恢复行为包括：清除代价地图、原地旋转、后退、等待、重新规划等。

## 11. 真机运行 Nav2 的基本条件

|条件|要求|
|---|---|
|底盘驱动|能订阅 `/cmd_vel`，发布 `/odom`|
|激光雷达|能发布 `/scan`|
|TF|`map → odom → base_link → laser` 完整|
|地图|有 `map.yaml` 和 `map.pgm`|
|URDF|正确描述机器人本体和传感器位置|
|参数文件|配置 Nav2 各模块参数|

如果这些条件不满足，Nav2 很容易出现无法定位、无法规划、机器人不动或原地转圈等问题。

## 12. 常见启动流程

建图阶段：

```bash
# 启动底盘、雷达、TF
ros2 launch your_robot_bringup robot.launch.py

# 启动 SLAM
ros2 launch slam_toolbox online_async_launch.py

# 启动 Nav2
ros2 launch nav2_bringup navigation_launch.py

# 保存地图
ros2 run nav2_map_server map_saver_cli -f ~/map
```

已有地图导航阶段：

```bash
# 启动底盘、雷达、TF
ros2 launch your_robot_bringup robot.launch.py

# 启动 Nav2 并加载地图
ros2 launch nav2_bringup bringup_launch.py map:=/home/xxx/map.yaml use_sim_time:=False
```

## 13. 常见参数

|参数|作用|
|---|---|
|`robot_radius` / `footprint`|机器人尺寸|
|`inflation_radius`|障碍物膨胀半径|
|`max_vel_x`|最大前进速度|
|`max_vel_theta`|最大角速度|
|`transform_tolerance`|TF 时间容差|
|`obstacle_max_range`|障碍物检测最大距离|
|`raytrace_max_range`|清除障碍物的最大射线距离|

调试真机时，速度参数建议先设小一些，防止机器人运动过快导致撞墙或定位失败。

## 14. 常见问题排查

|问题|可能原因|
|---|---|
|RViz 中机器人不在地图上|AMCL 未定位、初始位姿未设置、TF 缺失|
|机器人规划路径但不动|`/cmd_vel` 没发布，或底盘没有订阅 `/cmd_vel`|
|机器人原地转圈|TF 方向错误、雷达方向错误、局部控制器参数不合适|
|机器人贴墙走|`inflation_radius` 太小或机器人尺寸设置错误|
|机器人认为前方全是障碍|激光雷达 TF 错误，costmap 参数异常|
|报 TF timeout|时间同步问题，TF 发布频率低，`use_sim_time` 设置错误|
