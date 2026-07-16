---
title: Libero
date: 2026-04-15 20:26:53
sticky: 1
categories:
    - 具身智能
    - VLA
tags:
    - 具身智能
disableNunjucks: true
---

---

# LIBERO测评
## 一、LIBERO介绍
==泛化测试平台==
**LIBERO 模拟基准评估（LIBERO Simulation Benchmark Evaluation）** 通常指的是使用 LIBERO 平台或框架进行的一系列模拟实验，以**评估模型或算法在特定任务上的性能**。LIBERO 本身可能是一个特定的研究项目、工具集或平台，专门用于视觉-语言对齐（Vision-Language Alignment, VLA）或其他多模态学习任务的评估和研究。

**核心目标**：评估“能不能**泛化**”的机器人策略（尤其是多任务 / 语言驱动 / foundation model）

## 二、LIBERO整体结构
LIBERO 是一个**分层 benchmark**
###  顶层：1.Task Suite（任务套件）
LIBERO 分成多个 **suite**（评测集合）：

| Suite          | 难度  | 泛化类型  | **具体操作**                     |
| -------------- | --- | ----- | ---------------------------- |
| libero_spatial | 低   | 空间变化  | 任务语义相近，但物体位置、相对布局、目标区域位置会变化。 |
| libero_object  | 中   | 物体变化  | 环境和、操作逻辑、目标条件接近，但对象改变        |
| libero_goal    | 中高  | 目标变化  | 环境、对象接近，但目标条件改变。             |
| libero_10      | 高   | 多任务混合 | Long-horizon多步骤任务            |
| libero_90      | 很高  | 大规模泛化 | multi-task suite大规模任务集合      |
OpenVLA eval 实现
###  2.中层：Task（具体任务）
每个 suite 里有多个 task，例如：

- “把红色方块放到蓝色碗里”
- “把杯子移到左边”
- “打开抽屉”

每个 task 包含：

- instruction（语言指令）  
- initial state（初始状态）  
- goal condition（成功条件）  
- scene layout（物体/位置）
### 3. 底层：Environment（仿真）
LIBERO 基于**robosuite + MuJoCo**

环境里包含：
- 机械臂（通常是 Panda / Sawyer）
- 桌面场景
- 可操作物体（block / bowl / drawer / mug）
### 4.Observation / Action 结构
#### Observation（输入）
```
obs = {  
  "image": RGB 图像（通常 256x256）  
  "proprio": 机器人状态（关节/末端）  
  "language": 指令文本  
}
```
#### Action（输出）
```
action = {  
"delta_xyz"  
"delta_rot"  
"gripper_open/close"  
}
```
### 5.评测机制（Evaluation Pipeline）
```
for task in suite:
    for episode in 50:
        reset()
        run policy
        check success
```
**输出**：success_rate = 成功次数 / 总次数

## 三、配置与启动
1.环境配置
```
git clone https://github.com/Lifelong-Robot-Learning/LIBERO.git
cd LIBERO
pip install -e .

cd openvla
pip install -r experiments/robot/libero/libero_requirements.txt
```

2.下载数据集
```
  huggingface-cli download --repo-type dataset --resume-download openvla/modified_libero_rlds --local-dir ./ --local-dir-use-symlinks False
```

3.启动代码：
在experiments/robot/libero/run_libero_eval.py中，修改对应的检查点，以及任务名称
```
  @dataclass
class GenerateConfig:
    # fmt: off

    #################################################################################################################
    # Model-specific parameters
    #################################################################################################################
    model_family: str = "openvla"                    # Model family
    pretrained_checkpoint: Union[str, Path] = "/mnt/nvme1n1p1/zzh/openvla/model/openvla-7b-finetuned-libero-spatial"     # Pretrained checkpoint path  模型位置
    load_in_8bit: bool = False                       # (For OpenVLA only) Load with 8-bit quantization
    load_in_4bit: bool = False                       # (For OpenVLA only) Load with 4-bit quantization

    center_crop: bool = True                         # Center crop? (if trained w/ random crop image aug)

    #################################################################################################################
    # LIBERO environment-specific parameters
    #################################################################################################################
    task_suite_name: str = "libero_spatial"          # Task suite. Options: libero_spatial, libero_object, libero_goal, libero_10, libero_90   改变任务
    num_steps_wait: int = 10                         # Number of steps to wait for objects to stabilize in sim
    num_trials_per_task: int = 5                     # Number of rollouts per task

    #################################################################################################################
    # Utils
    #################################################################################################################
    run_id_note: Optional[str] = None                # Extra note to add in run ID for logging
    local_log_dir: str = "./experiments/logs"        # Local directory for eval logs

    use_wandb: bool = False                          # Whether to also log results in Weights & Biases
    wandb_project: str = "YOUR_WANDB_PROJECT"        # Name of W&B project to log to (use default!)
    wandb_entity: str = "YOUR_WANDB_ENTITY"          # Name of entity to log under

    seed: int = 7                                    # Random Seed (for reproducibility)

    # fmt: on
```

在experiments/robot/libero/run_libero_eval.py中，修改对应的检查点，以及任务名称
```
#链接 libero
export PYTHONPATH="/mnt/nvme1n1p1/zzh/openvla/LIBERO:$PYTHONPATH"
python experiments/robot/libero/run_libero_eval.py
```

启动
```
python experiments/robot/libero/run_libero_eval.py \
  --model_family openvla \
  --pretrained_checkpoint openvla/openvla-7b-finetuned-libero-spatial \ #改这边
  --task_suite_name libero_spatial \
  --center_crop True
```

其它三套只要替换 checkpoint 和 `task_suite_name`：

- `openvla/openvla-7b-finetuned-libero-object` + `libero_object`
- `openvla/openvla-7b-finetuned-libero-goal` + `libero_goal`
- `openvla/openvla-7b-finetuned-libero-10` + `libero_10`

## 四、任务概览
### LIBERO包含130个任务，分为四个主要任务套件：
- LIBERO-Spatial（10个任务）
- LIBERO-Object（10个任务）
- LIBERO-Goal（10个任务）
- LIBERO-100（100个任务）
LIBERO-100进一步分为LIBERO-90（90个任务，用于预训练）和LIBERO-10（10个任务，用于测试下游持续学习性能）。

### 1、LIBERO-Spatial（空间关系迁移）
**这10个任务都涉及将黑碗放到盘子上，但黑碗的初始位置不同：**

- 拾取盘子和小碗之间的黑碗并放到盘子上
- 拾取小碗旁边的黑碗并放到盘子上
- 拾取桌子中央的黑碗并放到盘子上
- 拾取饼干盒上的黑碗并放到盘子上
- 拾取木柜顶部抽屉中的黑碗并放到盘子上
- 拾取小碗上的黑碗并放到盘子上
- 拾取饼干盒旁边的黑碗并放到盘子上
- 拾取炉子上的黑碗并放到盘子上
- 拾取盘子旁边的黑碗并放到盘子上
- 拾取木柜上的黑碗并放到盘子上

### 2、LIBERO-Object（物体知识迁移）
**这10个任务都是将不同物体放入篮子：**

- 拾取字母汤罐头并放入篮子
- 拾取奶油奶酪并放入篮子
- 拾取沙拉酱并放入篮子
- 拾取烧烤酱并放入篮子
- 拾取番茄酱并放入篮子
- 拾取番茄酱罐并放入篮子
- 拾取黄油并放入篮子
- 拾取牛奶并放入篮子
- 拾取巧克力布丁并放入篮子
- 拾取橙汁并放入篮子

### 3、LIBERO-Goal（目标导向迁移）
**这10个任务涉及不同的操作目标：**

- 打开柜子的中间抽屉
- 将碗放到炉子上
- 将酒瓶放到柜子顶部
- 打开顶部抽屉并将碗放入
- 将碗放到柜子顶部
- 将盘子推到炉子前面
- 将奶油奶酪放入碗中
- 打开炉子
- 将碗放到盘子上
- 将酒瓶放到架子上

### 4、LIBERO-10（综合测试套件）
**这10个任务来自不同场景，涉及复合操作：**

- 客厅场景2：将字母汤和番茄酱都放入篮子
- 客厅场景2：将奶油奶酪盒和黄油都放入篮子
- 厨房场景3：打开炉子并将摩卡壶放上去
- 厨房场景4：将黑碗放入柜子底部抽屉并关闭
- 客厅场景5：将白色杯子放到左边盘子上，黄白杯子放到右边盘子上
- 书房场景1：拾取书并放入收纳盒后部隔间
- 客厅场景6：将白色杯子放到盘子上，巧克力布丁放到盘子右边
- 客厅场景1：将字母汤和奶油奶酪盒都放入篮子
- 厨房场景8：将两个摩卡壶都放到炉子上
- 厨房场景6：将黄白杯子放入微波炉并关闭

### 5、LIBERO-90
**包含90个任务用于预训练：**

系统支持21种不同的任务顺序排列，用于评估持续学习算法在不同任务序列下的表现。