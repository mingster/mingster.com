---
layout: post
title: How to mount an LVM partition on another system
date: 2009-06-07 02:23:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2009/06/how-to-mount-lvm-partition-on-another.html"
author: mingster
---
<p>I ran into a Fedora box recently which after rebooting was unable to mount the root file system. Here's what I did to get this going:</p>
<p>First I booted off the Fedora CD and typed "linux rescue" at the prompt in order to boot into rescue mode. When asked if I would like to enable the network interfaces or mount the file systems, I said no to both.</p>
<p>If you are running a different Linux distro or don't have the Fedora CD, I'm pretty sure you can use a different Linux bootable media and then just install the LVM tools and use that instead.</p>
<p>So, once you're at the command prompt, you need to activate the LVM partitions so they can be used. This can be done using the following command:<br /><code><br />lvm vgchange --ignorelockingfailure -P -a y<br /></code><br />The -P will make logical volumes which are missing one of their disks available too.</p>
<p>This should create the device entries for these logical volumes. You can find out what the name of the logical volumes are by typing:<br /><code><br />lvm lvs<br /></code><br />This should give you output showing the name of the Volume Group and the name of the Logical Volume. The device entry should be created in /dev//. So in my case it was created as /dev/VolGroup00/LogVol00.</p>
<p>You can now mount or fsck or whatever you need to do. If you wanted to check/repair the file system you could run:<br /><code><br />fsck /dev/VolGroup00/LogVol00<br /></code><br />If you wanted to mount the file system you could run:<br /><code><br />mkdir /volmount<br />mount /dev/VolGroup00/LogVol00 /volmount<br /></code><br />And that's it, you now have access to your logical volume on another system.</p>
