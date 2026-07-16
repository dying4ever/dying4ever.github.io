---
title: 第09章_Transformer
date: 2026-06-02 14:47:48
sticky: 10
categories:
    - 计算机视觉
    - 数字图像处理
tags:
    - 计算机视觉
    - 数字图像处理
---

# 第 9 章 Transformer

## 本章概括
本章介绍 Transformer 的序列建模框架，重点包括 Seq2seq、Encoder、Decoder、自注意力、Q/K/V、Softmax 权重、多头注意力和训练流程。核心是理解注意力如何让每个 token 动态聚合其他 token 的信息。

## Seq2seq 与 Encoder-Decoder
Seq2seq 模型用于把一个序列映射为另一个序列，如语音到文字、机器翻译或图像描述。Encoder 负责编码输入序列，Decoder 根据编码结果逐步生成输出序列。

## Self-attention
自注意力让序列中每个位置都能关注其他位置。对输入向量 $a_i$，先线性变换得到 Query、Key、Value：

$$
q_i=W_q a_i,\qquad k_i=W_k a_i,\qquad v_i=W_v a_i
$$

$q_i$ 用于发起查询，$k_i$ 用于被匹配，$v_i$ 是被加权汇聚的信息。

相关性分数为：

$$
\alpha_{i,j}=q_i^\top k_j
$$

再经 softmax 归一化：

$$
\alpha'_{i,j}=\frac{\exp(\alpha_{i,j})}{\sum_l\exp(\alpha_{i,l})}
$$

输出向量为：

$$
b_i=\sum_j \alpha'_{i,j}v_j
$$

它表示第 $i$ 个 token 根据注意力权重从所有 token 中汇聚的信息。

## Scaled Dot-Product Attention
实际 Transformer 使用缩放点积注意力：

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

$d_k$ 是 key 的维度，除以 $\sqrt{d_k}$ 可避免点积过大导致 softmax 梯度过小。

## Multi-head Attention
多头注意力把 $Q,K,V$ 投影到多个子空间中并行计算注意力：

$$
\operatorname{MultiHead}(Q,K,V)=\operatorname{Concat}(head_1,\cdots,head_h)W^O
$$

不同头可以关注不同关系，如局部关系、长距离依赖或语义相关性。

## Encoder
Encoder 通常由多层堆叠组成，每层包含多头自注意力、前馈网络、残差连接和层归一化。残差连接帮助梯度传播，层归一化稳定训练。

## Decoder
Decoder 包含 masked self-attention、encoder-decoder attention 和前馈网络。Masked self-attention 防止当前位置看到未来输出，保证自回归生成。

## Training
训练时常使用 teacher forcing，即 Decoder 输入真实前缀，预测下一个 token。损失函数通常为交叉熵。推理时模型逐步生成，每一步把已生成 token 作为下一步输入。

## 图示说明
PPT 中的 Q/K/V 和注意力权重图展示了自注意力的计算过程：先由输入生成查询、键和值，再用查询和键计算相关性，最后对 value 加权求和。复习时应能把图中的箭头对应到上述公式。
