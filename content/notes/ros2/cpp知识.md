---
title: cpp知识
date: 2025-07-17 19:56:27
sticky: 2
categories:
    - ros2
tags:
    - ros2
disableNunjucks: true
---

---

## this

## 🧠 什么是 `this`？

在 C++ 中，`this` 是一个 **指向当前对象本身的指针**。

比如你在类 `TarkbotRobot` 的某个成员函数中写代码：

```
cpp


复制编辑
this->declare_parameter("robot_port", "/dev/ttyACM0");
```

这其实等价于：

```
(*this).declare_parameter("robot_port", "/dev/ttyACM0");
```

意思就是：

> "调用当前这个对象的 `declare_parameter` 函数"

------

## ✅一个简单的机器人类 Demo

```
#include <iostream>
#include <string>

class Robot {
public:
    // 构造函数
    Robot(std::string name, int speed)
        : name(name), speed(speed) {}

    // 打印速度（演示 this-> 的用途）
    void printSpeed(int speed) {
        std::cout << "局部变量 speed: " << speed << std::endl;
        std::cout << "成员变量 speed: " << this->speed << std::endl;
    }

    // 显式调用成员函数
    void move() {
        this->printName();  // 使用 this-> 显示调用成员函数
    }

private:
    std::string name;
    int speed;

    void printName() {
        std::cout << "机器人名字是：" << name << std::endl;
    }
};

int main() {
    Robot r("Tarkbot", 100);

    r.printSpeed(10);   // 传入局部变量 speed=10，成员变量 speed=100
    r.move();           // 调用成员函数
    return 0;
}
```

------

## 🔍 运行结果：

```
text复制编辑局部变量 speed: 10
成员变量 speed: 100
机器人名字是：Tarkbot
```