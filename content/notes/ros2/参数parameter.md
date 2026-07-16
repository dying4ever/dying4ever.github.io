---
title: 参数parameter
date: 2025-07-17 19:56:27
sticky: 7
categories:
    - ros2
tags:
    - ros2
disableNunjucks: true
---

---

## 参数赋值来源一览

在 ROS 中，节点的参数有**多个来源**，赋值顺序如下（后者会覆盖前者）：

1. **代码中的默认值**（你 `declare_parameter(..., default_value)` 设置的）
2. **Launch 文件中通过 `param` 指定的值**
3. **YAML 参数文件中加载的值**
4. **命令行参数，如 `ros2 run pkg node --ros-args -p xxx:=value`**



#### 例如：

##### 主程序：

```
//声明和设置默认值，如果在启动时用户没有另外设置，程序就会使用这个值
this->declare_parameter("robot_port", "/dev/ttyACM0");
//从参数服务器中读取名为 "robot_port" 的参数值，并将其转换为字符串，赋值给成员变量 serial_port_name_。
//如果启动时通过 launch 文件或参数文件设置了 "robot_port"，那你拿到的是覆盖后的值。否则就是默认值 "/dev/ttyACM0"。
serial_port_name_ = this->get_parameter("robot_port").as_string();
```

##### launch：

```
DeclareLaunchArgument → 可用命令行或默认值传参
             ↓
   LaunchConfiguration → 绑定参数值
             ↓
             Node → 启动节点并传参
             ↓
     ROS 2 节点中 this->get_parameter(...) 获取到值
```



```
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # 声明参数
    odom_frame_arg = DeclareLaunchArgument(
        'odom_frame',//参数名
        default_value='odom',//默认值
        description='Odometry frame'
    )
    
    base_frame_arg = DeclareLaunchArgument(
        'base_frame',
        default_value='base_footprint',
        description='Base frame'
    )
    
    imu_frame_arg = DeclareLaunchArgument(
        'imu_frame',
        default_value='imu_link',
        description='IMU frame'
    )
    
    odom_topic_arg = DeclareLaunchArgument(
        'odom_topic',
        default_value='odom',
        description='Odometry topic'
    )
    
    imu_topic_arg = DeclareLaunchArgument(
        'imu_topic',
        default_value='imu',
        description='IMU topic'
    )
    
    battery_topic_arg = DeclareLaunchArgument(
        'battery_topic',
        default_value='bat_vol',
        description='Battery voltage topic'
    )
    
    cmd_vel_topic_arg = DeclareLaunchArgument(
        'cmd_vel_topic',
        default_value='cmd_vel',
        description='Command velocity topic'
    )
    
    beep_topic_arg = DeclareLaunchArgument(
        'beep_topic',
        default_value='beep',
        description='Beep topic'
    )
    
    robot_port_arg = DeclareLaunchArgument(
        'robot_port',
        default_value='/dev/ttyACM0',
        description='Robot serial port'
    )
    
    robot_port_baud_arg = DeclareLaunchArgument(
        'robot_port_baud',
        default_value='230400',
        description='Robot serial port baud rate'
    )
    
    pub_odom_tf_arg = DeclareLaunchArgument(
        'pub_odom_tf',
        default_value='true',
        description='Whether to publish odometry TF'
    )
    
    robot_type_send_arg = DeclareLaunchArgument(
        'robot_type_send',
        default_value='r20_twd',
        description='Robot type'
    )

    # 创建节点
    tarkbot_robot_node = Node(
        package='tarkbot_robot',
        executable='tarkbot_robot_node',
        name='tarkbot_robot_node',
        parameters=[{//ban
            'odom_frame': LaunchConfiguration('odom_frame'),
            'base_frame': LaunchConfiguration('base_frame'),
            'imu_frame': LaunchConfiguration('imu_frame'),
            'odom_topic': LaunchConfiguration('odom_topic'),
            'imu_topic': LaunchConfiguration('imu_topic'),
            'battery_topic': LaunchConfiguration('battery_topic'),
            'cmd_vel_topic': LaunchConfiguration('cmd_vel_topic'),
            'beep_topic': LaunchConfiguration('beep_topic'),
            'robot_port': LaunchConfiguration('robot_port'),
            'robot_port_baud': LaunchConfiguration('robot_port_baud'),
            'pub_odom_tf': LaunchConfiguration('pub_odom_tf'),
            'robot_type_send': LaunchConfiguration('robot_type_send'),
        }],
        output='screen'//节点日志输出到终端（方便调试）
    )

    return LaunchDescription([
        odom_frame_arg,
        base_frame_arg,
        imu_frame_arg,
        odom_topic_arg,
        imu_topic_arg,
        battery_topic_arg,
        cmd_vel_topic_arg,
        beep_topic_arg,
        robot_port_arg,
        robot_port_baud_arg,
        pub_odom_tf_arg,
        robot_type_send_arg,
        tarkbot_robot_node
    ]) 
```

