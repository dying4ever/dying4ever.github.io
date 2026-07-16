---
title: udev
date: 2025-07-17 19:56:27
sticky: 5
categories:
    - ubuntu
tags:
    - ubuntu
disableNunjucks: true
---

---

```
sudo chmod 666 /dev/ttyACM0    //ttyTSH1(串口)
```

`udev` 是 Linux 系统中的一个 **设备管理器**，全称是 **userspace /dev**。它的主要作用是：

> **在用户空间动态创建和管理 `/dev` 目录下的设备文件。**

### 通俗点讲，它是干嘛的？

当你把一个 USB 设备（比如鼠标、串口线、摄像头）插入电脑时，Linux 系统会通过内核检测到这个硬件设备，然后 `udev` 会：

1. 自动创建 `/dev/xxx` 设备节点（比如 `/dev/ttyUSB0`, `/dev/video0`）；
2. 赋予它权限、所属用户组；
3. 可以用规则自动命名或创建符号链接（比如创建 `/dev/tarkbot_base`）；
4. 触发某些脚本或动作（比如你可以设定插入 U 盘就自动挂载）。

## 🔌 串口类设备（tty）

| 默认名字       | 常见设备                                 | 固定命名建议                           |
| -------------- | ---------------------------------------- | -------------------------------------- |
| `/dev/ttyUSB0` | USB 转串口模块、STM32、开发板            | `/dev/arduino`, `/dev/tarkbot_base`    |
| `/dev/ttyACM0` | CDC USB 串口设备（如 STM32 Virtual COM） | `/dev/stm32_serial`, `/dev/ros_serial` |

📌 固定方法：根据 `idVendor` 和 `idProduct` 写规则 + `SYMLINK+=`

------

## 📷 摄像头/图像设备（video）

| 默认名字      | 常见设备                            | 固定命名建议                       |
| ------------- | ----------------------------------- | ---------------------------------- |
| `/dev/video0` | UVC 摄像头、RealSense、USB 工业相机 | `/dev/front_cam`, `/dev/realsense` |

📌 固定方法：

- 可以按 USB 口位置（通过 `DEVPATH`）
- 或者按摄像头的 `serial number`（如 RealSense）

------

## 🔋 输入类设备（input）

| 默认名字            | 常见设备                     | 固定命名建议                                 |
| ------------------- | ---------------------------- | -------------------------------------------- |
| `/dev/input/eventX` | 键盘、鼠标、触控屏、游戏手柄 | `/dev/input/keyboard`, `/dev/input/joystick` |

📌 固定方法：用 `NAME`, `PHYS`, `ID_INPUT_KEYBOARD` 等属性判断

------

## 💽 存储设备（block）

| 默认名字                | 常见设备              | 固定命名建议                   |
| ----------------------- | --------------------- | ------------------------------ |
| `/dev/sda`, `/dev/sdb1` | U 盘、移动硬盘、TF 卡 | `/dev/usb_disk`, `/dev/sdcard` |

📌 固定方法：可以按 `UUID` 或 `LABEL` 来固定挂载点，例如在 `/etc/fstab` 里挂载到 `/mnt/data`

## 🔧 怎么查看设备属性？

插好设备后用：

```
udevadm info -a -n /dev/ttyUSB0
```

或者摄像头：

```
udevadm info -a -n /dev/video0
```

就能看到可用于匹配的属性：`idVendor`, `idProduct`, `serial`, `devpath` 等。



//具体工程为例

```
cd /etc/udev/rules.d/
sudo vi tarkbot.rules
```

▶ 进入 `udev` 规则目录，创建或编辑一个名为 `tarkbot.rules` 的文件，用来写自定义设备规则。

------

```
KERNEL=="ttyACM*", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="55d4", MODE:="0666", SYMLINK+="tarkbot_base"
```

这是一条具体的 **udev 规则**，我们分段来看：

| 部分                       | 含义                                                         |
| -------------------------- | ------------------------------------------------------------ |
| `KERNEL=="ttyACM*"`        | 匹配设备名称形如 `/dev/ttyACM0`, `/dev/ttyACM1` 的串口设备。 |
| `ATTRS{idVendor}=="1a86"`  | 只匹配 USB 厂商 ID 是 `1a86` 的设备（常见于 CH340/CH341 串口芯片）。 |
| `ATTRS{idProduct}=="55d4"` | 只匹配产品 ID 是 `55d4` 的设备（对应某个特定型号的设备）。   |
| `MODE:="0666"`             | 设置设备文件的权限为 `rw-rw-rw-`，所有用户都能读写。         |
| `SYMLINK+="tarkbot_base"`  | 给设备创建一个符号链接 `/dev/tarkbot_base`，作为固定设备名。 |

------

## 🔧 你做这件事的目的

- 避免设备名 `/dev/ttyACM0` 在插拔后变成 `/dev/ttyACM1` 等，程序出错；
- 以后程序可以稳定使用 `/dev/tarkbot_base` 来访问底盘；
- 所有用户都能访问串口设备（不需要加入 `dialout` 组）。

------

## 🧪 如何让它生效

```
sudo udevadm control --reload
sudo udevadm trigger
```

1. 然后重新插拔设备；
2. 查看是否成功创建：

```
ls -l /dev/tarkbot_base
```

//

**你用 Jetson 接 GPS 模块**，模块只有 TX/RX 两个引脚：你用的是 `/dev/ttyTHS1`。

**你插一个 Arduino UNO 到 Jetson 或 PC 的 USB 口**：它会出现在 `/dev/ttyACM0`。

//

你用 **STM32 接 Jetson**，根据连接方式不同，Jetson 上会出现的设备路径也不一样，下面是详细对比👇

------

## 🔌 你怎么连 Jetson？

### ✅ **方式一：用 USB 线连接 STM32 到 Jetson**

如果你是通过 USB（比如 STM32 的 USB OTG 或 USB FS 接口）直接连接 Jetson，就会出现：

```
/dev/ttyACM0
```

或者是 `/dev/ttyACM1`、`/dev/ttyUSB0`，具体取决于：



| 设备类型                            | Jetson 上的表现 | 示例                               |
| ----------------------------------- | --------------- | ---------------------------------- |
| STM32 使用 USB CDC (虚拟串口)       | `/dev/ttyACM0`  | 使用 STM32CubeMX 配置 USB CDC 类   |
| 使用 USB 转串口芯片（CH340/CP2102） | `/dev/ttyUSB0`  | STM32 的 TX/RX 接到 USB 转串口模块 |

> ✅ 这是最常见、最方便的方式，系统自动识别，适合串口调试、数据传输、ROS 串口节点。

------

### ✅ **方式二：用 UART（TX/RX）连接 STM32 到 Jetson GPIO**

比如你从 STM32 的 TX/RX 直接连到 Jetson Nano 的 GPIO UART 引脚（通常是 `/dev/ttyTHS1` 或 `/dev/ttyS0`）：

- 这时 Jetson 上不会有新设备出现
- 你手动使用 `/dev/ttyTHS1`（或其他 UART 设备）与 STM32 通信
- 你需要设置好串口参数（波特率、停止位、校验位）

> ⚠️ 注意要确保电平兼容（Jetson 通常是 3.3V，STM32 一般也要设为 3.3V）。

------

## 🧪 如何确认 Jetson 上的串口路径？

你插上后可以运行：

```
dmesg | grep tty
```

会输出类似这样的内容：

```

[  105.123456] cdc_acm 1-1.3:1.0: ttyACM0: USB ACM device
```

或者：

```
ls /dev/ttyACM*
ls /dev/ttyUSB*
ls /dev/ttyTHS*
```
