---
title: i2c
date: 2025-07-17 19:56:27
sticky: 4
categories:
    - stm32
tags:
    - stm32
disableNunjucks: true
---

---

## 初始化（千万别忘记！！，加在Lcd_Init之后）

```
HAL_GPIO_WritePin(GPIOD, GPIO_PIN_2, GPIO_PIN_RESET);
LCD_Init();
LCD_Clear(Black);
LCD_SetBackColor(Black);
LCD_SetTextColor(White);

I2CInit();//important

int a,b,c,d;
if(e2prom_read(4)==0x11)//断电以后检测依然保存数据
{
	a=e2prom_read(0);
	b=e2prom_read(1);
	c=e2prom_read(2);
	d=e2prom_read(3);
}
else//第一次检测,置零,然后把数据存入e2prom,如果是浮点数,则x10,再/10转换
{
    e2prom_write(0,0);
	e2prom_write(1,0);
	e2prom_write(2,0);
	e2prom_write(3,0);
	
	e2prom_write(4,0x11);//标志位
}


```



## 写入

```d
void e2prom_write(uint8_t adr,uint8_t data)
{
	I2CStart();
	I2CSendByte(0xA0);
	I2CWaitAck();
	I2CSendByte(adr);
	I2CWaitAck();
	I2CSendByte(data);
	I2CWaitAck();
	I2CStop();
	HAL_Delay(20);//掩饰别忘记了

}
```

## 读取

```
uint8_t e2prom_read(uint8_t adr)
{
	I2CStart();
	I2CSendByte(0xA0);
	I2CWaitAck();
	I2CSendByte(adr);
	I2CWaitAck();
	
	I2CStart();
	I2CSendByte(0xA1);
	I2CWaitAck();
	uint8_t data = I2CReceiveByte();
	I2CSendNotAck();//是I2CSendNotAck,不是I2CSendAck()!!!
	I2CStop();

	
	return data;

}

```

```
void write_resistor(uint8_t data)
{   
	I2CStart();
	I2CSendByte(0x5E);  
	I2CWaitAck();
	
	I2CSendByte(data);  
	I2CWaitAck();
	I2CStop();
}
uint8_t read_resistor(void)
{   
	I2CStart();
	I2CSendByte(0x5F);  
	I2CWaitAck();
	
	uint8_t value = I2CReceiveByte();
	I2CSendNotAck();
	I2CStop();

	return value;
}
```

