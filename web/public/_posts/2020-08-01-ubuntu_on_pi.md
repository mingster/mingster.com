---
layout: post
title: 安裝 ubuntu on Raspberry Pi
date: 2020-08-01 23:19:41.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
tags: Raspberry Pi
author: mingster
---

This is cheatsheet on installing ubuntu on Raspberry Pi.

## 1. download and flash to SD card

Visit [ubuntu](https://ubuntu.com/download/raspberry-pi) and download.

## 2. boot up and update

```
sudo apt update && sudo apt upgrade
```

## 3. configure wifi

### 3-1 which name?  

usually <b>wlan0</b>.  To find out: 

```
ls /sys/class/net
```

### 3-2 netplan config

```
sudo vi /etc/netplan/50-cloud-init.yaml
```

Add the wifi section:

```
# This file is generated from information provided by the datasource.  Changes
# to it will not persist across an instance reboot.  To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    ethernets:
        eth0:
            dhcp4: true
            optional: true
    version: 2
    wifis:
        wlan0:
            optional: true
            access-points:
                "SSID-NAME-HERE":
                    password: "PASSWORD-HERE"
            dhcp4: true
```

### 3-3 Apply the update

```
sudo netplan apply
```

### 3-4 Check it out

```
ip a
```


## SSH access / lock down

```
sudo apt install openssh-server
```

or you just need to connect with ip or correct host name

Be sure to lock it down with key or some sort.

## change hostname

```
sudo hostnamectl set-hostname newhostname
```

Update/append:

```
192.168.x.x	newhostname
```

apply change

```
hostnamectl
```


## mount usb

```
sudo lsblk -o model,name,fstype,size,label,mountpoint
```