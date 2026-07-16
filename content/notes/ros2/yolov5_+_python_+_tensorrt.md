---
title: yolov5_+_python_+_tensorrt
date: 2025-10-18 15:51:59
sticky: 5
categories:
    - ros2
tags:
    - ros2
disableNunjucks: true
---

---

https://blog.csdn.net/pleasescanf/article/details/133189245
有jetpack没有cuda（一般都配套）
# 准备工作
## 一、先确认版本
```
head -n 1 /etc/nv_tegra_release
```
输出类似：
```
# R35 (release), REVISION: 5.0, GCID: 35531747, BOARD: t186ref, EABI: aarch64, DATE: Thu May  9 07:57:12 UTC 2024
```
R35.3 → JetPack 5.1.2
## 二、手动添加源
```
sudo bash -c 'echo "deb https://repo.download.nvidia.com/jetson/common r35.5 main" > /etc/apt/sources.list.d/nvidia-l4t.list'
sudo bash -c 'echo "deb https://repo.download.nvidia.com/jetson/t234 r35.5 main" >> /etc/apt/sources.list.d/nvidia-l4t.list'
```
注意修改版本信息如r35.3
```
sudo apt update
```
只要 JetPack 版本匹配，安装 `nvidia-jetpack` 不会破坏系统，也不会导致混乱
```
sudo apt install nvidia-jetpack
```
## 三、验证
```
nvcc -V
dpkg -l | grep tensorrt
dpkg -l | grep cudnn
```
## 四、pytorch和torchvision

这个简单，随便搜资料都有
## 五、opencv cuda版本
https://blog.csdn.net/weixin_45306341/article/details/127926178
j不要用满，不然会崩
```
make -j4
```
#### 最后添加环境变量：
先找路径
```
sudo find /usr/local/lib -name "cv2*.so"
```
打开 Python3，然后输入：
```
import sys
print(sys.path)
```
检查路径在不在，不在就source
```
echo 'export PYTHONPATH=$PYTHONPATH:/usr/local/lib/python3.8/site-packages' >> ~/.bashrc
source ~/.bashrc

```

# tensorrt
## 准备：
训练.pt文件
如果不兼容，运行转换脚本
```
import torch
from pathlib import PosixPath

# 注册 WindowsPath 以兼容反序列化
import pathlib
temp = pathlib.WindowsPath
pathlib.WindowsPath = PosixPath

# 加载模型（此时能正常加载）
model = torch.load('best.pt', map_location='cpu')

# 保存为兼容Linux的版本
torch.save(model, 'best_linux.pt')

print("✅ 模型已重新保存为 best_linux.pt，可在 Linux/Jetson 上正常使用。")
```
## 1. pt ->onnx ->engine
https://zhuanlan.zhihu.com/p/1948876311662670336
较高的yolo版本支持直接导出
1.建立文件
```
from ultralytics import YOLO

def main():
    # 1️⃣ 加载YOLOv5模型权重（你也可以改成自己的.pt文件路径）
    model = YOLO("best_linux.pt")

    # 2️⃣ 导出为TensorRT引擎
    model.export(
        format="engine",   # 导出格式：TensorRT
        device="cuda",     # 使用GPU
        half=True,         # 使用FP16半精度加速
        dynamic=False,     # 固定输入尺寸（默认640x640），一般更稳定
        imgsz=640          # 可改为你训练时的输入尺寸
    )

    print("\n✅ 导出完成！文件已保存为 yolov5s.engine")

if __name__ == "__main__":
    main()
```
2.测试文件
```
from ultralytics import YOLO
import cv2
import time

def main():
    # 加载 TensorRT 引擎
    model = YOLO("yolov5nu.engine")

    # 打开摄像头（0 表示第一个摄像头）
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ 无法打开摄像头")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    print("✅ 摄像头已打开，开始检测，按 Q 退出。")

    prev_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️ 无法读取帧")
            break

        # TensorRT 推理（禁用窗口显示以避免闪烁）
        results = model(frame, imgsz=640, verbose=False)

        # 获取检测结果
        boxes = results[0].boxes.xyxy.cpu().numpy()  # [x1, y1, x2, y2]
        confs = results[0].boxes.conf.cpu().numpy()  # 置信度
        clss = results[0].boxes.cls.cpu().numpy()    # 类别

        # 逐个绘制框
        for (box, conf, cls_id) in zip(boxes, confs, clss):
            x1, y1, x2, y2 = map(int, box)
            label = f"{model.names[int(cls_id)]} {conf:.2f}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # 计算 FPS
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time) if prev_time != 0 else 0
        prev_time = curr_time

        cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

        # 显示结果
        cv2.imshow("YOLOv5 TensorRT Detection", frame)

        # 按 Q 退出
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

```
3.可能要加swap交换空间
```
sudo swapoff -a
sudo fallocate -l 6G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

```
再执行
```
sudo nano /etc/fstab
```
最后一行添加
```
/swapfile swap swap defaults 0 0

```
## 2.pt ->wts ->engine
https://www.cnblogs.com/Fish0403/p/18218385#_label4
github:
https://github.com/wang-xinyu/tensorrtx