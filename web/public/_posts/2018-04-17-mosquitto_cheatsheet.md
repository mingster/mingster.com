---
layout: post
title: Mosquitto on pi cheatsheet / Mosquitto的安裝
date: 2018-04-17 18:19:41.000000000 +08:00
type: post
published: true
status: publish
categories:
- HomeAutomation
tags: Smart Home
meta:
author: mingster
---
# 第一步 更新Pi

  ```
  sudo apt-get update

	sudo apt-get upgrade -y
  ```

# 第二步 安裝 mosquitto

## 安裝：

  ```
  sudo apt-get install mosquitto mosquitto-clients
  ```

## 移除舊init

  ```
  sudo systemctl stop mosquitto
  sudo update-rc.d mosquitto remove
  sudo rm /etc/init.d/mosquitto
  ```

## 安裝systemd

  ```
  sudo vi /etc/systemd/system/mosquitto.service
  ```

  貼進以下服務敘述：

  ```
  [Unit]
  Description=MQTT message broker
  After=network.target
  Requires=network.target

  [Service]
  Type=simple
  ExecStart=/usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf
  Restart=always

  [Install]
  WantedBy=multi-user.target
  ```

## 服務設定

	```
	sudo systemctl daemon-reload
	sudo systemctl enable mosquitto
	```

## 啟動服務

	```
	sudo systemctl start mosquitto.service
	```

## mosquitto帳密

	```
	sudo mosquitto_passwd -c /etc/mosquitto/accesslist.txt pi
	```
	這會設置pi 這個使用者

## mosquitto設定檔

	編輯mosquitto設定檔：

	```
	sudo vi /etc/mosquitto/mosquitto.conf
	```

	然後這些內容：

	```
	pid_file /var/run/mosquitto.pid

	listener 1883

	persistence true
	persistence_location /var/lib/mosquitto/
	persistence_file mosquitto.db

	log_dest syslog
	log_dest stdout
	log_dest topic
	log_type error
	log_type warning
	log_type notice
	log_type information
	log_timestamp true

	log_dest file /var/log/mosquitto/mosquitto.log

	connection_messages true
	allow_anonymous false

	password_file /etc/mosquitto/accesslist.txt
	#include_dir /etc/mosquitto/conf.d
	```

## 重啟服務

	```
	sudo systemctl stop mosquitto
	sudo systemctl start mosquitto
	```

# 第三步 設置Home Assistant
與HA聯接，只要新增以下幾行到 configuration.yaml

```
mqtt:
  broker: localhost
  port: 1883
  client_id: home-assistant-1
  username: !secret mqtt_username
  password: !secret mqtt_password
```

設完重啟HA就可以了。

# 第四步 測試
首先可以看看服務狀態：

```
sudo systemctl status mosquitto
```

若要debug，也可以
```
sudo tail -f /var/log/mosquitto/mosquitto.log
```

## Cli測試
打開2個terminal，一個將是publisher; 另一個是subscriber。

subscriber方，來接收這個topic:

```
mosquitto_sub -h localhost -t "sensor/temperature" -u username -P password
```

publisher方，發佈topic:

```
mosquitto_pub -h localhost -t "sensor/temperature" -m 22.5  -u username -P password
```

## HA服務測試
HA若有成功設置mqtt，會有 mqtt.publish 的服務可呼叫。


# References
- [Getting start with MQTT Mosquitto Broker on Raspberry Pi, Windows, MacOS and Linux](https://diyprojects.io/mqtt-mosquitto-communicating-connected-objects-iot/#.WtxWQC-B2ls)
- [Installing secure Mosquitto broker on Raspberry Pi with Raspbian Jessie or Stretch along with systemd start up](https://hobbytronics.pk/installing-mosquitto-broker-on-raspberry-pi/)
- [Home Assistant and MQTT](https://swabbster.wordpress.com/2017/06/19/home-assistant-and-mqtt/)
- [HA - Mosquitto MQTT broker](https://www.home-assistant.io/addons/mosquitto/)
- [HA - mqtt Testing](https://www.home-assistant.io/docs/mqtt/testing/)
