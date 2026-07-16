---
title: 串口DMA
date: 2025-07-17 19:56:27
sticky: 10
categories:
    - stm32
tags:
    - stm32
disableNunjucks: true
---

---

### 串口DMA+空闲中断

优势:

​	1.DMA方式跟适合高速、大数据传输，cpu占用率低；

​	2.DMA传输不占用cpu资源，适合实时性要求高的场景；

​	3.可稳定处理突发大数据量（文件传输）；

精确帧检测：

​	1.空闲中断可以检测帧结束位置；

​	2.无需手动计算超时时间；

[文件已丢失]

> [!NOTE]
>
> 一定要写100,不能strlen(rx_buf),HAL_UARTEx_ReceiveToIdle_DMA在uart.exit里
>
> HAL_UARTEx_RxEventCallback在uart.h里

```
char rx_buf[100];
char send_buf[100];

HAL_UARTEx_ReceiveToIdle_DMA(&huart1,(uint8_t *)rx_buf,100);
```

```
void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
{
	if(huart ->Instance == USART1)
	{		
			rx_flag = 1;
			rx_size = Size;
			HAL_UARTEx_ReceiveToIdle_DMA(&huart1,(uint8_t *)rx_buf,1000);
	}
}

void handle(void)
{
		if(rx_flag ==1)
		{
			//接收操作
			sprintf(send_buf,"%s",rx_buf);
			HAL_UART_Transmit_DMA(&huart1,(uint8_t *)send_buf,strlen(send_buf));
			
			//接收点灯
			if (rx_size==1)
            {
            if (rx_buf[0]=='2')
            	led2_state = 1
            }
			rx_flag = 0;//标志位清零
			memset(rx_buf,0,100);//缓冲区清零
			
			//处理坐标数据
			int x1,x2,y1,y2;
			if(sscanf(rx_buf,"(%d,%d,%d,%d)",&x1,&y1,&x2,&y2)==4)
			{
				//处理坐标数据
			}
			
			rx_flag = 0;
			memset(rx_buf,0,100);
			
			//单个数字转数值
			if（rx_size==1&& is_nub(rx_buf[0])）
				result = rx_buf[0] -'0';
			else
                sprintf(send_buf,"error");
                HAL_UART_Transmit_DMA(&huart1,(uint8_t *)send_buf,strlen(send_buf));
				
		}
}

```

### char -> int

例如：int a = ‘9’-‘0’=9

```
int isnum(char a)
{
return (a>='0'&&a<='9')
}

```

 