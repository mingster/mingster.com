---
layout: post
title: Smart Home Spec / 智慧家庭的規格 2018
date: 2018-01-21 23:19:41.000000000 +08:00
type: post
published: true
status: publish
categories:
- HomeAutomation
tags: Smart Home
meta:
author: mingster
---

現是2018年初，智慧家庭的零件已經百家齊放。但普及率還僅限於高端的使用者。

玩過一堆小米套件、Sonoff、Broadlink、Home Assistant、Home Bridge後，應該寫ㄧ寫規格來釐清未來要如何繼續架設。


# 介面
萬物皆上網，可以使用以下介面來操控元件：

1. 手機、電腦：
  可使用手機或電腦，在單一app操作。單一是key word，目前常搞成一個vendor一個app。所以需要如Home Assistant的總管網關。
2. 語音介面：
  Amazon Alexa、Google Home、Siri、小愛等，任選一個或多個並存。
3. 實體遙控器及實體開關：
  傳統的實體開關還是要有，才夠方便。
4. 自動化：
  所有元件應該都能透過程式來自動化。例如：偵測到離家時，自動關掉所有燈。

# 元件
以下現時該是智能化的元件：
1. 燈具、
2. 插座、
3. 空調、
4. 門、
5. 窗、
6. 監控、
7. 開關
7. 各式家電


# Use Cases
e.g.
1. 出門時，關掉所有燈跟空調。
2. 人在玄關時，打開玄關燈; 2分鐘沒人，關掉玄關燈。
3. 溫度超過27度時，打開空調。

下次再來寫具體的實施方法。另外，有一些Super Home的範籌，如自主發電，也可以收集。
