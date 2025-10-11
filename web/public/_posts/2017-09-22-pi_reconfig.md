---
layout: post
title: Pi & 中文
date: 2017-09-21 23:19:41.000000000 +08:00
type: post
published: true
status: publish
categories:
- Raspberry Pi
tags:
author: mingster
---

When you iso the sd card and first boot up, the default is GB. So we need to do
those to fit our culture.

## 更改語系
```
sudo raspi-config
```
check en_US.UTF-8 and zh_TW.UTF-8

```
sudo dpkg-reconfigure keyboard-configuration
```

```
sudo dpkg-reconfigure tzdata
```

## 中文字型
另外還有一些中文字型：文泉驛微米黑、文泉驛正黑、文泉驛點陣宋體，如果需要的話也可以一起裝起來：
```
sudo apt-get install ttf-wqy-microhei ttf-wqy-zenhei xfonts-wqy
```

## 酷音中文輸入法
```
sudo apt-get install scim-chewing
```

## References
* [Raspberry Pi 筆記：系統語系與中文輸入法](http://atceiling.blogspot.tw/2017/03/raspberry-pi_26.html)
