---
title: led_lcd
date: 2025-07-17 19:56:27
sticky: 6
categories:
    - stm32
tags:
    - stm32
disableNunjucks: true
---

---

# 点灯

##### 所有一起点（0x88）：

```
void Led_display(unsigned char ucLed)
{//熄灭所有灯
    HAL_GPIO_WritePin(GPIOC,GPIO_PIN_13|GPIO_PIN_14|GPIO_PIN_15|GPIO_PIN_8|GPIO_PIN_9|
                      GPIO_PIN_10|GPIO_PIN_11|GPIO_PIN_12, GPIO_PIN_SET);
    
    HAL_GPIO_WritePin(GPIOC,ucLed<<8, GPIO_PIN_RESET);

    HAL_GPIO_WritePin(GPIOD, GPIO_PIN_2, GPIO_PIN_SET);   
    HAL_GPIO_WritePin(GPIOD, GPIO_PIN_2, GPIO_PIN_RESET);

}
```

##### 单个点：

```
void led(uint8_t led,uint8_t mode)
{
    if (mode)
    	HAL_GPIO_WritePin(GPIOC,( GPIO_PIN_8<<(led-1)), GPIO_PIN_RESET);
    else
    	HAL_GPIO_WritePin(GPIOC,( GPIO_PIN_8<<(led-1)), GPIO_PIN_SET);

    HAL_GPIO_WritePin(GPIOD, GPIO_PIN_2, GPIO_PIN_SET);	
    HAL_GPIO_WritePin(GPIOD, GPIO_PIN_2, GPIO_PIN_RESET);
}
```

##### **闪烁**：

```
uint16_t timer_5s;
uint16_t led_state = 0;

void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
	if (htim->Instance == TIM4)
    { 
        timer_5s++;
        led_state = ！led_state
        if(timer_5s>=50)
        {
            timer_5s=0;//5s

        }
    }
}
```



# LCD显示	

> [!NOTE]
>
> ##### ==真题文档给的行数与LCD_DisplayStringLine(Line1,(uint8_t *)text);相差一位！！要减1！！==！****



##### 先锁存,低电平

```
	 HAL_GPIO_WritePin(GPIOD, GPIO_PIN_2, GPIO_PIN_RESET);
	 LCD_Init();
	 LCD_Clear(Black);
	 LCD_SetBackColor(Black);
	 LCD_SetTextColor(White);
```

##### 再在 (49)==LCD_Init==(96)==LCD_DisplayStringLine==(109)==LCD_Clear==前后加这两段代码

```
	//开始
	uint16_t temp=GPIOC->ODR;
	//末尾
	GPIOC->ODR=temp;
```

##### 显示代码

```
char text[20];
void Lcd_Show(void){
	sprintf(text,"   test   ");
	LCD_DisplayStringLine(Line1,(uint8_t *)text);
}
```

