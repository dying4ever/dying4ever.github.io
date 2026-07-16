---
title: π0--A-Vision-Language-Action-Flow--9C6Y3H3P
date: 2026-06-08 13:28:00
sticky: 2
categories:
    - 具身智能
    - VLA
    - vla
tags:
    - 具身智能
    - VLA
    - vla
---

# <span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(238, 249, 253);">                                                                                      π0: A Vision-Language-Action Flow Model for General Robot Control</span></span>

| <!-- --> |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(219, 238, 221);">作者:</span></span>**<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(219, 238, 221);"> Kevin Black; Noah Brown; Danny Driess; Adnan Esmail; Michael Equi; Chelsea Finn; Niccolo Fusai; Lachy Groom; Karol Hausman; Brian Ichter; et al.</span></span>               |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(243, 250, 244);">期刊: </span></span><span style="color: rgb(255, 0, 0);"><span style="background-color: rgb(243, 250, 244);">,</span></span>**                                                                                                                                                               |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(219, 238, 221);">期刊分区:</span></span>**                                                                                                                                                                                                                                                                      |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(243, 250, 244);">本地链接: </span></span>**<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(243, 250, 244);"><a href="zotero://open-pdf/0_ZEK3NANU" rel="noopener noreferrer nofollow">Black 等 - π0 A Vision-Language-Action Flow Model for General Robot Control.pdf</a></span></span> |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(219, 238, 221);">URL:</span></span>**                                                                                                                                                                                                                                                                       |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(243, 250, 244);">摘要:</span></span>**                                                                                                                                                                                                                                                                        |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(219, 238, 221);">标签:</span></span>**                                                                                                                                                                                                                                                                        |
| **<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(243, 250, 244);">笔记日期: </span></span>**<span style="color: rgb(25, 60, 71);"><span style="background-color: rgb(243, 250, 244);">2026/3/22 19:42:44</span></span>                                                                                                                                           |


## <span style="color: rgb(224, 255, 255);"><span style="background-color: rgb(102, 205, 170);">📜 研究核心</span></span>

***

> Tips: 做了什么，解决了什么问题，创新点与不足？

### 提出三大挑战

*   **<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">海量数据需求</span></span>**<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">：为了实现广泛适应性，模型需要在多任务、多机器人类型的大规模数据集上进行训练。</span></span>

<!---->

*   **<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">合适的网络架构</span></span>**<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">：设计能够对齐多模态数据（图像、文本和动作）的架构，充分挖掘预训练与微调的潜力。</span></span>

<!---->

*   **<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">精确的训练策略</span></span>**<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">：精心设计的训练流程，合理分配预训练和微调的数据，以确保模型具备泛化能力，并能够高效执行任务。</span></span>**<span style="color: rgb(254, 44, 36);"><span style="background-color: rgb(255, 255, 255);">三大挑战：大规模数据、架构、训练策略/方法</span></span>**→提出pi0模型：<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">一种基于 </span></span>**<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">预训练视觉语言模型（VLM）</span></span>**<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);"> 和 </span></span>**<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">流匹配模型（Flow Mathing</span></span><span style="background-color: rgb(255, 255, 255);">）</span>**<span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);"> 的新型架构。</span></span>

**<span style="color: rgb(254, 44, 36);"><span style="background-color: rgb(255, 255, 255);">1、整合多样的数据源：</span></span>**

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">首先利用一个预训练的视觉-语言模型(VLM)来导入互联网规模的经验。基于VLM构建他们的模型，使其继承了语言模型和视觉-语言模型的通用知识、语义推理和问题解决能力。其次，</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">进一步训练模型以整合机器人动作，使其成为一个视觉-语言-动作(VLA)模型。</span></span>**

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">为了能够利用多种不同的机器人数据源，作者采用跨体态训练，即</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">将多种类型机器人的数据合并到同一个模型中。</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);"><br>这些不同类型的机器人具有不同的构型空间和动作表示，包括单臂和双臂系统，以及移动操作机器人。</span></span>

**<span style="color: rgb(254, 44, 36);"><span style="background-color: rgb(255, 255, 255);">2、在模型的架构上</span></span>**

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">为了能够执行高度灵巧和复杂的物理任务，作者使用</span></span>**<span style="color: rgb(190, 25, 28);"><span style="background-color: rgb(255, 255, 255);">带有流匹配的动作分块架构（</span></span>*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">即动作分块算法ACT</span></span>*<span style="color: rgb(190, 25, 28);"><span style="background-color: rgb(255, 255, 255);">）来表示复杂的连续动作分布</span></span>**

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">相当于通过流匹配微调VLM以生成动作(且是多时间步的动作块)</span></span>

*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">那为何要这么做呢？原因很简单，</span></span><span style="color: rgb(149, 111, 231);"><span style="background-color: rgb(255, 255, 255);">VLM</span></span><span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);"> 可以有效地从网络上传输语义知识，但它们经过训练</span></span><span style="color: rgb(81, 27, 120);"><span style="background-color: rgb(255, 255, 255);">只</span></span><span style="color: rgb(149, 111, 231);"><span style="background-color: rgb(255, 255, 255);">能输出离散语言token</span></span><span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">。灵巧的机器人操作需要π0以高频率(比如高达每秒 50 次)输出运动命令。为了提供这种级别的灵活性，他们</span></span><span style="color: rgb(81, 27, 120);"><span style="background-color: rgb(255, 255, 255);">通过流匹配为预训练的 VLM 提供连续动作输出</span></span>*

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">且为了将流匹配与VLM结合，他们使用了一种新颖的动作专家，它通过</span></span><span style="color: rgb(190, 25, 28);"><span style="background-color: rgb(255, 255, 255);">流式输出(flow-based outputs)</span></span><span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">增强了标准VLM</span></span>

**<span style="color: rgb(254, 44, 36);"><span style="background-color: rgb(255, 255, 255);">3、在训练策略/方法上：</span></span>**

<span style="background-color: rgba(255, 212, 0, 0.5);">预训练+微调</span> 模式 的概念：**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">首先在高度多样化的机器人数据上进行预训练，然后再针对所需任务进行微调或prompt会更加有效</span></span>**

### ⚙️ 内容

#### 一、模型架构：

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/XJGNXH7J.png|1599]]

#### 1.预训练数据集：

*   <span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">包括团队自有的</span></span>**<span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">灵巧操作数据集</span></span>**<span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">(第V-C节)与</span></span>**<span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">OXE</span></span>**<span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">（</span></span>*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">Open X-Embodiment</span></span>*<span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">）数据集的加权组合组成，该数据集涵盖7种不同的机器人配置，涉及68项不同任务，而OXE数据集包含包含22种机器人的数据</span></span>

**补充：**

1.<u>预训练</u><span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">阶段还使用了</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">多样化的语言标签</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">，</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">结合了任务名称和片段标注</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">(对子轨迹的细粒度标签，通常长度约为2秒)<br></span></span><span style="color: rgb(5, 162, 239);"><span style="background-color: rgb(255, 255, 255);">预训练阶段的目的是训练一个基础模型，使其具备广泛的能力和泛化能力，但不必针对任何单一任务达到高性能。该基础模型能够根据语言指令执行多种任务，具备初步的熟练度</span></span>

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">2.对于复杂且需要灵巧操作的任务，随后采用后训练流程，利用高质量的精心策划数据将模型适配到特定的下游任务</span></span>

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">3.他们研究了数据量较小至中等的高效后训练，以及针对如折叠衣物和移动操作等复杂任务，采用较大规模数据集的高质量后训练——即</span></span><u>微调</u>

#### 2.输入：

*   图像 → ViT → image tokens
*   语言 → text tokens
*   状态 q\_t → state embedding

#### 3.pi0模型**（改造 <span style="color: rgb(79, 79, 79);"><span style="background-color: rgb(255, 255, 255);">PaliGemma——增加额外的输入输出、引入流匹配时间步、加上动作专家权重）</span></span>**：

<span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">做了以下三点改造：</span></span>

1.  <span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">为机器人特定的token增加了额外的输入和输出投影，包括状态向量</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">qt</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">和动作向量</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">At</span></span>**

2.  <span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">增加了一个用于 “融合流匹配时间步” 的MLP信息</span></span>

3.  <span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">以及动作专家(比如gemma_300m)的一组较小的权重</span></span>

**设计类似于专家混合模型，其中有两大模块：**

1.  **<span style="color: rgb(51, 51, 51);">第一大模块用于</span><span style="color: rgb(28, 120, 146);">图像和文本(比如人类指令)输入</span>**
2.  **<span style="color: rgb(51, 51, 51);">第二大模块用于</span><span style="color: rgb(28, 115, 49);">机器人特定的输入(比如机器人的状态)</span>，<span style="color: rgb(237, 121, 118);">和输出(比如预测的机器人动作)</span>，该第二组权重称为动作专家**

*   **VLM Backbone：**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">π0模型主要由一个语言模型transformer骨干组成。</span></span>

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/7GGDIK2H.png|3898]]

**图像编码器** 将机器人的 **图像观测数据** 嵌入到 与 **语言标记** 相同的嵌入空 间：\[image tokens + language tokens]

再进一步通过机器人专用输入输出——即**本体感觉 状态（*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">proprioceptive state</span></span>*）**与**机器人动作（*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">robot actions</span></span>*）**来对主干进行增强

*   **Action Expert、Flow Matching：**

*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(238, 240, 244);">action expert 根据</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(238, 240, 244);">文本指令去噪</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(238, 240, 244);">生成具体的连续的动作——而无需像RT-2那样对其进行离散化或token化(discretize or tokenize)。</span></span>*

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">π0使用条件流匹配[28,32]来</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">建模动作的连续分布</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">。流匹配为他们的模型提供了</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">高精度和多模态建模能力</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">，使其特别适合高频率的灵巧操作任务；</span></span>

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">该架构灵感来自Transfusion [59]，</span></span>*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">该方法通过多目标训练单一transformer，其token对应的</span></span><span style="color: rgb(185, 85, 20);"><span style="background-color: rgb(255, 255, 255);">连续输出</span></span>*<span style="color: rgb(237, 121, 118);"><span style="background-color: rgb(255, 255, 255);">(比如机器人的动作)</span></span>*<span style="color: rgb(185, 85, 20);"><span style="background-color: rgb(255, 255, 255);">通过</span></span>****<u>流匹配(扩散风格)损失</u>****<u>进行监督，离散输出的token通过交叉熵损失进行监督（</u>*<span style="color: rgb(79, 79, 79);"><span style="background-color: rgb(238, 240, 244);">在Transfusion的基础上，他们还发现，为机器人特定的(动作和状态)token使用一套单独的权重能够提升性能</span></span>*<u>）</u>*

*   数学建模     $p(A_t|o_t)$

**1、未来动作序列**$A_t$ <span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">(</span></span>***<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">作者在任务中使用H=50，即一次性预测未来的50个连续动作块</span></span>***<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">)</span></span>：

$$
A_t = [a_t, a_{t+1}, ..., a_{t+H−1}]
$$

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">对于</span></span><span style="color: rgb(237, 121, 118);"><span style="background-color: rgb(255, 255, 255);">动作块 </span></span>$A_t$ <span style="color: rgb(237, 121, 118);"><span style="background-color: rgb(255, 255, 255);">中的每个动作 </span></span>$a_t$<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">，都有一个相应的动作token，将其输入动作专家action expert(转化而来)</span></span>

$ A_t$ <span style="color: rgb(254, 44, 36);"><span style="background-color: rgb(255, 255, 255);">表示的是输出的预测动作——相当于是不带有噪声的动作</span></span>

$A_t^τ$ <span style="color: rgb(28, 115, 49);"><span style="background-color: rgb(255, 255, 255);">表示的是输入噪声动作——相当于是带有噪声的动作</span></span>

（*<span style="color: rgb(28, 115, 49);"><span style="background-color: rgb(255, 255, 255);">动作输入用的绿色字体</span></span><span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">，</span></span><span style="color: rgb(237, 121, 118);"><span style="background-color: rgb(255, 255, 255);">动作输出用的红色字体 </span></span>*）

$$
A^τ_t = τA_t + (1 −τ)ϵ
$$

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">其中下标t表述机器人时间步，上标τ∈[0,1]表述流匹配时间步，而ε代表纯噪声</span></span>  

**2、观测值$ o_t$**

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">由</span></span>**<span style="color: rgb(28, 120, 146);"><span style="background-color: rgb(255, 255, 255);">多张RGB图像、一个语言指令</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">和</span></span>**<span style="color: rgb(28, 115, 49);"><span style="background-color: rgb(255, 255, 255);">机器人的本体状态</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">组成，即</span></span>：

$$
o_t[I_{1t},... ,I{nt},l_t ,q_t]
$$

图像 $ I_t$ 和关节角向$ q_t$ 通过各自的编码器进行编码，然后通过线性投影层：<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">投影到与语言token相同的嵌入空间中。</span></span>

<span style="color: rgb(77, 77, 77);"><span style="background-color: rgb(255, 255, 255);">在训练过程中，</span></span>**<span style="color: rgb(77, 168, 238);"><span style="background-color: rgb(255, 255, 255);">使用条件流匹配损失Conditional Flow Matching[28,32]，来监督这些动作token</span></span>**

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/RF57NLGF.png|444]]

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/VZDXPKEV.png|957]]

**<span style="color: rgb(79, 79, 79);"><span style="background-color: rgb(238, 240, 244);">整体含义：</span></span>**<span style="color: rgb(79, 79, 79);"><span style="background-color: rgb(238, 240, 244);"> 训练阶段的目的，是用均方误差MSE</span></span>**<span style="color: rgb(79, 79, 79);"><span style="background-color: rgb(238, 240, 244);">去迫使神经网络预测的“速度方向”，无限逼近那个绝对正确的“真实速度方向”</span></span>**

*   **具体训练流程**

**<span style="color: rgb(190, 25, 28);"><span style="background-color: rgb(255, 255, 255);">第一步</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">，</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">构建中间状态(加噪操作)</span></span>**

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">网络</span></span><span style="color: rgb(25, 27, 31);"><span style="background-color: rgb(255, 255, 255);">先</span></span><span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">通过随机采样符合正太分布的噪声τ，进行训练，计算“带噪声的动作”：</span></span>

$$
A^τ_t = τA_t + (1 −τ)ϵ
$$

噪声 $ϵ ∈N（0,1）$

原始流匹配的论文 时间变量 $τ ∈ u(0,1)$

在此，作者设计了<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">一个强调低时间步(高噪声水平)的时间步采样分布</span></span>![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/ZHK9FRWF.png|204]]

**<span style="color: rgb(190, 25, 28);"><span style="background-color: rgb(255, 255, 255);">第二步</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">：</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">训练</span></span>**

**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">训练网络输出 </span></span>**$v_θ(A^τ_t,o_t)$ **<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">去匹配 </span></span><span style="color: rgb(81, 27, 120);"><span style="background-color: rgb(255, 255, 255);">去噪向量场</span></span>**$u(A^τ_t,A_t)$

$v_θ$ *<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">代表预测的向量场，或预测的速度 (</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">预测的是中间状态(</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">下一步以什么样的速度往哪走</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">)</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">)</span></span>*

$u$ *<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">代表从纯噪声直接指向干净动作的真实向量场，或真实速度(</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">是终点向量 - 起点向量</span></span>****<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">)</span></span>*

$u(A^τ_t|A_t)=A_t-ϵ$

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/CK4EUJU9.png|235]]

*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(255, 255, 255);">即：</span></span><span style="color: rgb(156, 142, 193);"><span style="background-color: rgb(255, 255, 255);">目标速度向量 = 终点向量(干净动作) - 起点向量(纯噪声)</span></span>*

**做loss：**

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/PPI3EGCH.png|444]]

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/64DGCD7L.png|963]]

*   <span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">动作专家使用完全双向注意力掩码，使得所有动作token都能够相互关注</span></span>
*   关于注意力掩码

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/XEETZV3C.png|1296]]

#### 4.输出：

*   动作序列：连续值、高频

#### 二、代码：

![[π0--A-Vision-Language-Action-Flow--9C6Y3H3P.assets/LDT66W2Q.png|1764]]

### 💡 创新点

1.多样数据集（机械臂多样）；

2.多样训练策略（复杂场景，机械臂预训练）。

3.加强了 预训练+微调 模式 的概念：**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">首先在高度多样化的机器人数据上进行预训练，然后再针对所需任务进行微调或prompt会更加有效（</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">可以解决数据稀缺的问题，因为通用模型可以利用更多的数据来源——包括其他任务、其他机器人，甚至非机器人领域的数据</span></span>**<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(255, 255, 255);">）</span></span>**

4.模型架构：VLM+action expert（transformer， flow-matching）

openvla问题：低赫兹频率运动，

diffusion policy：看未来很多步，一种生成方法，最初被用在图像生成领域。图像生成技术，如stable diffusion和midjourney。思想核心：逐步地对图像进行调整和改善，从而生成高质量图像

<span style="color: rgb(79, 79, 79);"><span style="background-color: rgb(238, 240, 244);">流匹配的工作方式和扩散模型有些类似，核心思想都是通过逐步添加噪声来简化数据分布，然后逐步去噪得到隐私数据「</span></span>*<span style="color: rgb(123, 127, 130);"><span style="background-color: rgb(238, 240, 244);">Google deepmind团队专门有一篇文章阐述流匹配其实与扩散模型是等价的，详见：</span></span><span style="color: rgb(78, 161, 219);"><span style="background-color: rgb(238, 240, 244);"><a href="https://diffusionflow.github.io/" title="diffusionflow.github.io/" rel="noopener noreferrer nofollow">diffusionflow.github.io/</a></span></span>*<span style="color: rgb(79, 79, 79);"><span style="background-color: rgb(238, 240, 244);">」</span></span>

<span style="color: rgb(51, 51, 51);"><span style="background-color: rgb(238, 240, 244);">具体而言</span></span>

*   <span style="color: rgb(51, 51, 51);">训练时，随机对动作施加高斯噪声，并训练模型输出去噪向量场<br>推理时，从高斯噪声开始，通过数值积分向量场生成动作序列</span>

*   <span style="color: rgb(51, 51, 51);">不同之处在于<br></span>**<span style="color: rgb(51, 51, 51);">流匹配直接对数据和噪声分布之间的映射场(vector field)进行建模，训练目标是匹配这一映射场</span>**

### 🧩 不足

## <span style="color: rgb(32, 178, 170);"><span style="background-color: rgb(175, 238, 238);">🔁 研究内容</span></span>

***

### 💧 数据

### 👩🏻‍💻 方法

### 🔬 实验

### 📜 结论

## <span style="color: rgb(0, 77, 153);"><span style="background-color: rgb(135, 206, 250);">🤔 个人总结</span></span>

***

> Tips: 你对哪些内容产生了疑问，你认为可以如何改进？

openvla：图片 先经 视觉模型 处理，在融合语言指令到语义大模型；

pi0：图片和语言指令 组合 到 VLM（多模态大模型）

### 🙋‍♀️ 重点记录

### 📌 待解决

### 💭 思考启发
