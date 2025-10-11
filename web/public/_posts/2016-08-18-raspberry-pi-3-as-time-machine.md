---
layout: post
title: Raspberry Pi 3 as Time machine
date: 2016-08-18 22:31:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Raspberry Pi
tags: []
meta:
  blogger_blog: mingster.blogspot.com
  blogger_author: ming tsai
  blogger_eb3191f8b77bf2ac10a5fe54aebee9ae_permalink: '5420622587709311765'
author: mingster
---
<p>The Raspberry Pi 3 + external 4TB drive setup, originally I tried to set it up as Plex server. And the CPU is just not powerful enough.</p>
<p>I decided to convert it to a NAS for Time machine purpose.</p>
<p>Follow <a href="https://raymii.org/s/articles/Build_a_35_dollar_Time_Capsule_-_Raspberry_Pi_Time_Machine.html" target="_blank">this post</a> to install netatalk and other related setup.</p>
<p>Note that it's wrong info about afp configuration (Edit the file /etc/afp.conf) section.</p>
<p>To configure afp, you should edit 
<pre>sudo nano /etc/netatalk/AppleVolumes.default</pre>
<p>, as stated in <a href="https://www.raspberrypi.org/forums/viewtopic.php?f=36&amp;t=26826" target="_blank">this post</a> (File sharing with OSX).  </p>
<p>To share the storage with Window machines, <a href="http://hackarobot.com/how-to-turn-your-raspberry-pi-into-nas-network-attached-storage-device/" target="_blank">install samba</a>.</p>
