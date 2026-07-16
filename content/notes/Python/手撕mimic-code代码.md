---
title: 手撕mimic-code代码
date: 2026-02-11 00:14:02
sticky: 1
categories:
    - Python
tags:
    - Python
disableNunjucks: true
---

---

```
class MimicVideo(Module):  
	#构造函数
    def __init__(  
        self,  
        dim,  
        #传一个类或者不传
        video_predict_wrapper: Module | None = None,  
        #后面的参数都必须用“关键字形式”传入，不能用位置参数。
        #形如“action_chunk_len = 32而不是32” 
        *, 
        dim_video_hidden = None,  
        action_chunk_len = 32,  
        dim_action = 20,  
        dim_joint_state = 32,  
        proprio_mask_prob = 0.1,  
        depth = 8,  
        dim_head = 64,  
        heads = 8,  
        expansion_factor = 4.,  
        ada_ln_zero_bias = -5.,  
        dim_time_cond = None,  
        sample_time_fn = None,  
        train_time_rtc = False,  
        train_time_rtc_max_delay = None,  
        num_residual_streams = 1,  
        #默认空字典\mhc_kwargs:变量名\dict类型注解\dict()默认值
        mhc_kwargs: dict = dict(),  
        #可以传一个tensor,也可不传None
        action_mean_std: Tensor | None = None,  
        joint_mean_std: Tensor | None = None,  
        model_output_clean = True,  
        num_task_ids = 0,  
        num_advantage_ids = 0,  
        advantage_cfg_dropout = 0.25,  
        extracted_video_layer_indices: list[int] | None = None,  
        num_video_viewpoints = 1,  
        video_time_denoise_mu = 0.,  
        video_time_denoise_sigma = 1.,  
        eps = 1e-5  
    ):
    
```
#### 1.继承
```
from torch.nn import Module
class 子类名(父类名):
class MimicVideo(Module):
	def __init__(self,dim,...):
		super().__init__()
		...
```
然后
#### 2.构造函数__init__
self就是这个函数本身，即"model"
```
def __init__(self,dim,...):
```
执行时
```
model = MimicVideo(dim=512)
```
会自动调用
```
MimicVideo.__init__(model,dim=512)
```
#### 3.\mhc_kwargs:变量名\dict类型注解\dict()默认值
```
mhc_kwargs: dict = dict()
```
#### 4.类型注解：`Module | None`、`Tensor | None`
Module只是提示类型，运行时不强制
```
video_predict_wrapper: Module | None = None,  
```