---
title: rtc
date: 2025-07-17 19:56:27
sticky: 7
categories:
    - stm32
tags:
    - stm32
disableNunjucks: true
---

---

# RTC

配置：

[文件已丢失]

[文件已丢失]

![4fb6b5fc0bb1e8cb10c46bfbd822c65](E:\WeChat\files\WeChat Files\wxid_eluxtt970oud22\FileStorage\Temp\4fb6b5fc0bb1e8cb10c46bfbd822c65.png

[文件已丢失]

> [!NOTE]
>
> 记得开中断！！
>
> 结构体一定要从rtc.c里复制

```
  RTC_DateTypeDef sDate = {0};
  RTC_AlarmTypeDef sAlarm = {0};
```
```
{
    HAL_RTC_GetTime(&hrtc,&sTime,RTC_FORMAT_BIN)
{
    HAL_RTC_GetTime(&hrtc,&sTime,RTC_FORMAT_BIN);//获得日期，时间
    HAL_RTC_GetDate(&hrtc,&sDate,RTC_FORMAT_BIN);//第二个是&结构体名字，第三个是cubemx选的

	sprintf(text,"       %d:%d:%d ",sTime.Hours,sTime.Minutes ,sTime.Seconds);//crt+alt+空格查看结构体
	LCD_DisplayStringLine(Line2,(uint8_t*)text);
	sprintf(text,"       20%d/%d/%d ",sDate.Year ,sDate.Month ,sDate.Date);
	LCD_DisplayStringLine(Line9,(uint8_t*)text);

	led(5,p);
}
//闹钟中断
void HAL_RTC_AlarmAEventCallback(RTC_HandleTypeDef *hrtc)
{
 p=1;
}
```

