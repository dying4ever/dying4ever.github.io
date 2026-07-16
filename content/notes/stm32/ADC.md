---
title: ADC
date: 2025-07-17 19:56:27
sticky: 2
categories:
    - stm32
tags:
    - stm32
disableNunjucks: true
---

---

# ADC

[文件已丢失]

#### PB12 - ADC1—IN11 R38

#### PB15 - ADC2—IN15 R37



```
double get_vol(void)
{
		HAL_ADC_Start(&hadc2);
		uint32_t adc_value =HAL_ADC_GetValue(&hadc2);
		return 3.3 * adc_value/4096;
}
```

