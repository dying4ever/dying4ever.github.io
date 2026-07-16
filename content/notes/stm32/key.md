---
title: key
date: 2025-07-17 19:56:27
sticky: 5
categories:
    - stm32
tags:
    - stm32
disableNunjucks: true
---

---

# 按键

### 1.最普通的模板B1

```
//B1*********
uint8_t B1_state;
uint8_t B1_last_state;
void key_scan(void)
{
//***按键消抖***
static uint16_t last ;
uint16_t now = uwTick;
if ((now - last )<20)
	return;
last = now;	

//1.状态赋值
	B1_state= HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_0);
//2.检测按键
	//B1***
	if(B1_state == 0 && B1_last_state == 1)
	{	//单机操作
		count++;
	}
//3.状态再赋值
	B1_last_state=B1_state ;
}
	

```

### 2.双击+单击B2

```
//B2*********
uint8_t B2_state;
uint8_t B2_last_state;
//判断两次按下间隔时间
uint32_t current_time_B2; //用于记录B2当前按下的时间
uint32_t last_time_B2; //用于记录B2当前按下的时间

uint32_t click_count_B2; //点击次数，判断是否双击

uint32_t click_time_B2; //点击定时器
uint32_t click_flag_B2; //点击标志，记录事件是否发生

void key_scan(void)
{
//1.状态赋值
	B2_state= HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_1);
//2.检测按键
	//B2***
	if(B2_state == 0 && B2_last_state == 1)
	{
		//Ⅰ.记录当前时间
		current_time_B2 = uwTick;
		if(click_count_B2 ==1 &&(current_time_B2-last_time_B2) < 300)
		{	
			//双击操作
			count+=2;
			//Ⅱ.重置点击次数，点击标志
			click_count_B2 = 0;
			click_flag_B2 = 0;
		}
		else
		{	
		  //Ⅰ.表示第一次按下按键
 			click_count_B2 = 1;	
          //Ⅱ.这两个为handle_B2做准备************************************B2这句在else里,B3在else外面
			click_flag_B2 = 1;
			click_time_B2 = 0 ;
		}
	      //Ⅲ.为检测连击做准备
			last_time_B2 = current_time_B2;
	}
//3.状态再赋值
	B2_last_state=B2_state ;
}


void handle_B2(void)
{
	if (click_flag_B2 && click_time_B2 >300)//click_time_B2定时器一直在增加
	{
		//单击操作
		count++;
		
		click_count_B2 = 0;
		click_flag_B2 = 0;
		
	}
}
```

### 3.三击+双击+单击B3

```
//B3*********
uint8_t B3_state;
uint8_t B3_last_state;
//判断两次按下间隔时间
uint32_t current_time_B3; //用于记录B3当前按下的时间
uint32_t last_time_B3; //用于记录B3当前按下的时间

uint32_t click_count_B3; //点击次数，判断是否双击

uint32_t click_time_B3; //点击定时器
uint32_t click_flag_B3; //点击标志，记录事件是否发生

void key_scan(void)
{
//1.状态赋值
	B3_state= HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_2);
//2.检测按键
//B3***
	if (B3_state==0 && B3_last_state==1)
	{	
		//Ⅰ.记录当前时间
		current_time_B2 = uwTick;
		if(click_count_B3 && (last_time_B3 - current_time_B3)<300)
		{	
			//Ⅱ.记录次数
			click_count_B3++;
			if(click_count_B3==3)
			{
			//三击操作	
				count+=3;
			//Ⅲ.重置点击次数，点击标志
			click_count_B3=0;
			click_flag_B3=0;
			}
		}
		else
		{	
			 //Ⅰ.表示第一次按下按键
			click_count_B3 = 1;
		}
        	//Ⅱ.为检测连击做准备
	        last_time_B3 = current_time_B3;
 		   //Ⅲ.这两个为handle_B3做准备
            click_flag_B3 = 1;//第一次按下标志
            click_time_B3 = 0;//第一次按下，点击计时器=0，可以开始记时了
  }
//3.状态再赋值
	B3_last_state=B3_state ;
}

void handle_B3(void)
{
	if (click_flag_B3 && click_time_B3 >300)//click_time_B2定时器一直在增加
	{
		if (click_count_B3==1)
		{
		//单击操作
		count++;
		}
		else if(click_count_B3==2)
		{
		//双击操作
		count+=2;
		}
		click_count_B3= 0;
		click_flag_B3 = 0;
	}
}
```

### 4.长按松手检测+单击B4

```
//B4*********
uint8_t B4_state;
uint8_t B4_last_state;

uint32_t press_duration_B4;
uint32_t press_flag_B4;

void key_scan(void)
{
//1.状态赋值
	B4_state= HAL_GPIO_ReadPin(GPIOA,GPIO_PIN_0);
//2.检测按键
//B4长按，松手检测***
		if (B4_state==0 && B4_last_state==1)//开始按
		{
		press_flag_B4 = 1;
		press_duration_B4 = 0;
		}
		else if (B4_state==1 && B4_last_state==0)//结束按
		{
			if (press_flag_B4)
			{
				if (press_duration_B4 >= 1000)
					count = 0;//长按操作
				else 
					count ++;//未长按，松手则为单击
			}
		}
//3.状态再赋值
	B4_last_state=B4_state ;
}
```

### 5.长按按下检测+单击B4

```
uint8_t B4_state;
uint8_t B4_last_state;
uint32_t press_duration_B4;

//检测部分有不同
if(B4_state == 0 && B4_last_state == 1)
{
		press_duration_B4 = 0;
}
else if (B4_state == 0 && B4_last_state == 0)
{
				if (press_duration_B4 >= 1000)//如果长按超过一秒
				{
						//长按操作
						count--;
				}
 }//注意else跟上面,{}不能省略
else if (B4_state == 1 && B4_last_state == 0)
				if (press_duration_B4 <= 1000)
				{
						//单击操作
						count-=2;
				}


```



### <以上都要加定时器中断和设置全局变量>

##### 在headfile.h里

```
extern int count;

extern uint32_t click_time_B2; //点击定时器
extern uint32_t click_flag_B2; //点击标志，记录事件是否发生

extern uint32_t click_time_B3; //点击定时器
extern uint32_t click_flag_B3; //点击标志，记录事件是否发生

extern uint32_t press_duration_B4;
extern uint32_t press_flag_B4;
```

##### 在fun.h里

```
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
 if (htim->Instance ==TIM2)
 {
//双击B2
 if (click_flag_B2)
		click_time_B2++;
	  handle_B2();
//三击B3
	 if (click_flag_B3)
		click_time_B3++;
	  handle_B3();
//长按松手检测B4	 
	  if (press_flag_B4)
		press_duration_B4++;
//长按按下检测B4	 	
	    press_duration_B4++;
	 
 }
}
```

### 合在一起

```
#include "headfile.h"


//B1*********
uint8_t B1_state;
uint8_t B1_last_state;

//B2*********
uint8_t B2_state;
uint8_t B2_last_state;
//判断两次按下间隔时间
uint32_t current_time_B2; //用于记录B2当前按下的时间
uint32_t last_time_B2; //用于记录B2当前按下的时间

uint32_t click_time_B2; //点击定时器
uint32_t click_count_B2; //点击次数，判断是否双击
uint32_t click_flag_B2; //点击标志，记录事件是否发生

//B3*********
uint8_t B3_state;
uint8_t B3_last_state;
//判断两次按下间隔时间
uint32_t current_time_B3; //用于记录B2当前按下的时间
uint32_t last_time_B3; //用于记录B2当前按下的时间

uint32_t click_time_B3; //点击定时器
uint32_t click_count_B3; //点击次数，判断是否双击
uint32_t click_flag_B3; //点击标志，记录事件是否发生

//B4*********
//松手检测
//uint8_t B4_state;
//uint8_t B4_last_state;
//uint32_t press_duration_B4;
//uint32_t press_flag_B4;
//按下检测
uint8_t B4_state;
uint8_t B4_last_state;
uint32_t press_duration_B4;


void key_scan(void){
//1.状态赋值
	B1_state= HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_0);
	B2_state= HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_1);
	B3_state= HAL_GPIO_ReadPin(GPIOB,GPIO_PIN_2);
	B4_state= HAL_GPIO_ReadPin(GPIOA,GPIO_PIN_0);
//2.检测按键
	//B1***
	if(B1_state == 0 && B1_last_state == 1)
	{
		count++;
	}
	//B2***
	if(B2_state == 0 && B2_last_state == 1)
	{
		current_time_B2 = uwTick;
		if(click_count_B2 ==1 &&(current_time_B2-last_time_B2) < 300)
		{	
			//双击操作
			count+=2;
			//重置点击次数，点击标志
			click_count_B2 = 0;
			click_flag_B2 = 0;
		}
		else
		{	//表示第一次按下按键，点击次数=1
 			click_count_B2 = 1;
		  //这两个为handle_B2做准备
			click_flag_B2 = 1;
			click_time_B2 = 0 ;
			
		}
			last_time_B2 = current_time_B2;
	}
	//B3***
	if (B3_state==0 && B3_last_state==1)
	{
		current_time_B2 = uwTick;
		if(click_count_B3 && (last_time_B3 - current_time_B3)<300)
		{
		click_count_B3++;
			if(click_count_B3==3)
			{//三击操作	
				count+=3;
			click_count_B3=0;
			click_flag_B3=0;
			}
		}
		else
		{
			click_count_B3 = 1;

		}
					//这两个为handle_B3做准备
		 click_flag_B3 = 1;//第一次按下标志
		 click_time_B3 = 0;//第一次按下，点击计时器=0，可以开始记时了
	 last_time_B3 = current_time_B3;

	}
//	//B4长按，松手检测***
//		if (B4_state==0 && B4_last_state==1)//开始按
//		{
//		press_flag_B4 = 1;
//		press_duration_B4 = 0;
//		}
//		else if (B4_state==1 && B4_last_state==0)//结束按
//		{
//			if (press_flag_B4)
//			{
//				if (press_duration_B4 >= 1000)
//					count = 0;//长按操作
//				else 
//					count ++;//未长按，松手则为单击
//			}
//		}
	
	if(B4_state == 0 && B4_last_state == 1)
	{
		press_duration_B4 = 0;
	}
	else if (B4_state == 0 && B4_last_state == 0)
	{
						if (press_duration_B4 >= 1000)//如果长按超过一秒
						{
							//长按操作
							count--;
						}
  }//注意else跟上面,{}不能省略
	else if (B4_state == 1 && B4_last_state == 0)
						if (press_duration_B4 <= 1000)
						{
							//单击操作
							count-=2;
						}
  //3.状态再赋值
	B1_last_state=B1_state ;
	B2_last_state=B2_state ;
	B3_last_state=B3_state ;
	B4_last_state=B4_state ;
}


void handle_B2(void)
{
	if (click_flag_B2 && click_time_B2 >300)//click_time_B2定时器一直在增加
	{
		//单击操作
		count++;
		
		click_count_B2 = 0;
		click_flag_B2 = 0;
		
	}
}

void handle_B3(void)
{
	if (click_flag_B3 && click_time_B3 >300)//click_time_B2定时器一直在增加
	{
		if (click_count_B3==1)
		{
		//单击操作
		count++;
		}
		else if(click_count_B3==2)
		{
		//双击操作
		count+=2;
		}
		click_count_B3= 0;
		click_flag_B3 = 0;
	}
}

//****************fun.c**************************
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
 if (htim->Instance ==TIM2)
 { if (click_flag_B2)
		click_time_B2++;
	  handle_B2();
	 
	 if (click_flag_B3)
		click_time_B3++;
	  handle_B3();
	 
//	  if (press_flag_B4)
//		press_duration_B4++;
	 press_duration_B4++;
 }
}
```



### 孙老师的按键

```
*key 检测*/
struct GPIO_KEY
{
    GPIO_TypeDef      *port;
    uint16_t          pin;
    uint16_t          active_value;
};
static const struct GPIO_KEY key[] =
{
    {GPIOB, GPIO_PIN_0, 0},
    {GPIOB, GPIO_PIN_1, 0},
    {GPIOB, GPIO_PIN_2, 0},
    {GPIOA, GPIO_PIN_0, 0},
};

#define NUM_KEYS  4
typedef enum
{
    KEY_UP   = 0,      // 按键抬起状态
    KEY_DEBOUNCE,      // 按键消抖状态
    KEY_WAIT_RELEASE   // 按键等待释放状态
}KEY_STATE;
//全局变量
KEY_STATE KeyState = KEY_UP;     // 按键状态指示变量，初值为按键抬起状态
volatile uint8_t KeyFlag  = 0;   // 按键有效标志，0：无效；大于1：有效    
uint8_t key_numb = 0;
    
uint8_t get_key_flag(void)
{
    if(KeyFlag )
    {
        KeyFlag = 0;
        printf("\r\nkey=%d\r\n",key_numb);
        return key_numb+1;        
    }
    else
        return 0;
}

void KeyScan(void)
{
    static int pressed_time;
    switch(KeyState)
    {
      case KEY_UP:    // 按键抬起状态
      {
          // 读到低电平，转换到按键消抖状态
      for(int i = 0; i < NUM_KEYS; i++)
      {
        if(HAL_GPIO_ReadPin(key[i].port, key[i].pin) == key[i].active_value)
        {
                    KeyState = KEY_DEBOUNCE;   // 读到低电平，转换到按键消抖状态
          key_numb = i;
                    pressed_time = 0;
          break;
        }
      }
      break;                 
      }
      case KEY_DEBOUNCE:  // 按键消抖状态
    { 
            // 读到低电平，转换到按键等待释放状态，并设置按键有效标志
            if(HAL_GPIO_ReadPin(key[key_numb].port, key[key_numb].pin) == key[key_numb].active_value)
            {
                 KeyState = KEY_WAIT_RELEASE;   // 读到低电平，转换到按键消抖状态
                 pressed_time ++;
                break;
            }
            // 读到高电平，表明是干扰信号，转换到按键抬起状态
            else   
            {
                KeyState = KEY_UP;
            }
      break;                 
      }
      case KEY_WAIT_RELEASE:  // 按键释放状态
      {
          // 读到高电平，说明按键释放，转换到按键抬起状态
      if(HAL_GPIO_ReadPin(key[key_numb].port, key[key_numb].pin) == !key[key_numb].active_value)
          {
            KeyState = KEY_UP;
                KeyFlag  = 1;  // 设置按键有效标志  
                if(pressed_time>100)
                    key_numb += 100;
          }
            else
            {
                pressed_time++;
            }
      break;                 
      }
      default: break;
    }
}

```

