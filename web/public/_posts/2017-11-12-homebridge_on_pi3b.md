---
layout: post
title: 安裝 HomeBridge On Raspberry Pi 3b
date: 2018-01-13 23:19:41.000000000 +08:00
type: post
published: true
featured: true
status: publish
categories:
- HomeAutomation
tags: HomeBridge, Raspberry Pi
author: mingster
---

## this reference is OBSOLETED

check out the [official up-to-date info](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian#configuration-reference)






<s>
HomeBridge是基於nodejs server的應用，它模擬iOS HomeKit，成為一個我們可以『控制』的網關。

我們需要HomeBridge來搭入Apple設備，這樣就可以使用siri/iPhone/iPad 來控制小米、Home Assistant、或其他HomeBridge有plug-in的platform了。

HomeBridge是基於nodejs的應用，在Pi上，nodejs的版本很關鍵。不work 大部份就是這裡出錯。

[少數派已經有文](https://sspai.com/post/38849)解釋了。以下是操作的筆記。

#***** 很重要 -- 本文只適用於 Pi 3B 的硬體 *****
要知道你的Pi是哪個版本，可以：

```
cat /proc/cpuinfo | grep 'Revision' | awk '{print $3}' | sed 's/^1000//'
```

a02082, a22082, 或 a32082 才是 Pi 3.

[出處](https://elinux.org/RPi_HardwareHistory)

硬體確認了，就可以進行以下HomeBridge的安裝。

## 第一步 清理nodejs

裝了幾次HomeBridge都出錯，結論就是nodejs版本不正確，所以先清空nodejs可以保證接下來的安裝。

若有其他node.js的東西在run，就不能這樣做了。

```
sudo apt-get -y remove nodejs;

sudo rm -rf /usr/lib/node_modules/; rm -rf ~/node_modules/
```

## 第二步 安裝HomeBridge所需軟體

1. 安裝相關軟體：
```
sudo apt-get install git gcc g++ make python3 net-tools
```


2. 安裝 nodejs (版本很重要，不能亂換)：

```
cd ~/

# setup repo
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -

# install Node.js
sudo apt-get install -y nodejs

# test node is working
node -v

# upgrade npm (version 6.13.4 has issues with git dependencies)
sudo npm install -g npm


sudo npm install -g node-gyp
```

this get you node 14.15.2


3. 安裝Avahi包：

```
sudo apt-get install -y libavahi-compat-libdnssd-dev
```

4. 安裝 homebridge及相關 (--unsafe-perm 很重要，不能拿掉)：

Reference: [Installing Homebridge](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian)

```
sudo npm install -g --unsafe-perm homebridge homebridge-config-ui-x
```

5. 安裝 bignum

```
cd /usr/lib/node_modules/homebridge/;
sudo npm install --unsafe-perm bignum
```
安裝會有錯誤warning，可以不理他。

6. 安裝並重整 mdns

```
cd /usr/lib/node_modules/homebridge/;
sudo npm install --unsafe-perm mdns

sudo node-gyp BUILDTYPE=Release rebuild
```

## 第三步 安裝homebridge-homeassistant

安裝『homebridge-homeassistant』插件，就可以把HB跟HA串起來，來實現平台聯動：

```
sudo npm install -g homebridge-homeassistant
```

## 第四步 安裝broadlink plug-in

[homebridge-broadlink-rm-pro](https://broadlink.kiwicam.nz/#homebridge-broadlink-rm)

```
sudo chmod -R 755 /usr/lib/node_modules/;
sudo chown -R pi.pi /usr/lib/node_modules/;

rm -rf ~/.cache/; mkdir ~/.cache/; sudo chmod -R 755 ~/.cache/;

sudo npm install -g homebridge-broadlink-rm-pro
```

1. Run "which node" to determine your node path.
2. Run "sudo setcap cap_net_raw+ep /path/to/node".

```
which node
sudo setcap cap_net_raw+ep /usr/lib/
```

## 第四步 HomeBridge 設定

以下是我的設定，接了小米及Home Assistant:

```
{
"bridge": {
    "name":"Homebridge",
    "username":"拉拉拉拉拉",
    "port":51826,
    "pin":"拉拉拉拉拉"
  },
"platforms": [{
      "platform": "MiAqaraPlatform",
      "gateways": {
          "拉拉拉拉拉": "拉拉拉拉拉"
      }
  }],
"platforms": [{
    "platform": "HomeAssistant",
    "name": "HomeAssistant",
    "host": "http://127.0.0.1:8123",
    "password": "拉拉拉拉拉",
    "supported_types": ["automation", "binary_sensor", "climate", "cover", "device_tracker", "fan", "group", "input_boolean", "light", "lock", "media_player", "remote", "scene", "script", "sensor", "switch", "vacuum"],
    "logging": true,
    "verify_ssl": false
  }]
}
```
小米如何設，可以看[這裡](https://sspai.com/post/40113)。


## 第五步 測試

```
homebridge -D
```

看看結果，Ctrl + C 來退出。


## 第六步 將 HomeBridge 安裝成服務
1. 用root身份，新增服務設定 ```sudo vi /etc/default/homebridge```

	貼上以下：

	```
	# Defaults / Configuration options for homebridge
	# The following settings tells homebridge where to find the config.json file and where to persist the data (i.e. pairing and others)
	HOMEBRIDGE_OPTS=-U /var/homebridge

	# If you uncomment the following line, homebridge will log more
	# You can display this via systemd's journalctl: journalctl -f -u homebridge
	# DEBUG=*
	```
2. 新增服務script: ```sudo vi /etc/systemd/system/homebridge.service```

	貼上以下：

	```
	[Unit]
Description=Node.js HomeKit Server
After=syslog.target network-online.target
[Service]
Type=simple
User=homebridge
EnvironmentFile=/etc/default/homebridge
ExecStart=/usr/bin/homebridge $HOMEBRIDGE_OPTS
Restart=on-failure
RestartSec=10
KillMode=process
[Install]
WantedBy=multi-user.target
	```

3. 開HomeBridge專屬的帳號

	```
	sudo useradd --system homebridge

	sudo passwd homebridge
	```

4. 設定檔位置：
	```
	sudo mkdir /var/homebridge
	```

5. 將測試好的設定檔拷到 ```/var/homebridge/``` 並設開放的權限：

	```
	sudo cp ~/.homebridge/config.json /var/homebridge/
	sudo cp -r ~/.homebridge/persist /var/homebridge
	sudo chmod -R 0777 /var/homebridge
	```

## 第六步 測試服務

```
homebridge -U /var/homebridge
```

重整服務：
```
sudo systemctl daemon-reload
```

啟用：
```
sudo systemctl enable homebridge
```

啟動：
```
sudo systemctl start homebridge
```

狀態：
```
sudo systemctl status homebridge
```


進入homebridge身份：
```
sudo su -s /bin/bash homebridge
```

都裝好了，就可以開始[將設備接入](https://sspai.com/post/40075)。



## 第七步 更新
要更新homebridge，可以：


	sudo npm upgrade -g homebridge

	sudo npm upgrade -g homebridge-homeassistant


### Node更新
```
sudo hb-service rebuild
```


## References
- [How to Extract All Your Custom IR Hex Codes from a Broadlink RM Mini 3 for Homebridge](https://alwayswithyouwhatcannotbedone.wordpress.com/2020/09/28/how-to-extract-all-your-custom-ir-hex-codes-from-a-broadlink-rm-mini-3-for-homebridge/)
- [HomeBridge on Raspberry-Pi](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian)
- [Setup Homebridge to Start on Bootup](https://timleland.com/setup-homebridge-to-start-on-bootup/)
- [homebridge-mi-aqara](https://github.com/YinHangCode/homebridge-mi-aqara)
- [https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi](https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi)
- [Setup Homebridge to Start on Bootup](https://timleland.com/setup-homebridge-to-start-on-bootup/)
- [入门智能家居，从米家到HomeKit （一）](https://sspai.com/post/39851)
- [入门智能家居，从米家到HomeKit （一）](https://sspai.com/post/39851)
- [入门智能家居，从 IFTTT 到 HomeKit 自动化（二）](https://sspai.com/post/39881)

</s>
