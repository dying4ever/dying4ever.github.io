---
title: Openvla_代码
date: 2026-03-24 16:21:22
sticky: 2
categories:
    - 具身智能
    - VLA
    - Openvla
tags:
    - 具身智能
    - Openvla
disableNunjucks: true
---

---

# 环境配置：

# 代码框架：
- `prismatic`- 封装源;提供模型加载、训练、数据预处理等核心工具
- `vla-scripts/`- 用于训练、微调和部署 VLA 的核心脚本。
- `experiments/`- 用于评估机器人环境中OpenVLA策略的代码。
- `LICENSE`- 所有代码均以MIT许可证发布;祝你黑客愉快！
- `Makefile`- 顶层 Makefile（默认支持线条处理——检查和自动修复）;根据需要扩展。
- `pyproject.toml`- 完整的项目配置细节（包括依赖关系），以及工具配置。

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
# 越疆nova5复现
