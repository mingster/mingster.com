---
layout: post
title: Mount new disk on CentOS
date: 2008-12-22 01:06:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
tags: []
meta:
  blogger_author: mingster
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '4950320748299565525'
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2008/12/mount-new-disk-on-centos.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455611651;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:198;}i:1;a:1:{s:2:"id";i:98;}i:2;a:1:{s:2:"id";i:234;}}}}
  original_post_id: '175'
  _wp_old_slug: '175'
author: mingster
---
<p>1. Check what is the new hard disk device name with "fdisk -l", it should be something like /dev/sda. You can easily identify which is the new drive by running "mount" and finding the drive that exists in "fdisk -l" but is not mounted.<br /><code>mount; fdisk -l</code></p>
<p>2. Create a partition on the new drive, (the sample code below assume the disk is /dev/sdd)<br /><code>fdisk /dev/sdd</code></p>
<p>3. Create a filesystem on the new partition, we use ext3 file system.<br /><code>mkfs.ext3 /dev/sdd</code></p>
<p>4. Create a directory named whatever you like, this will be where you mount the new disk<br /><code>mkdir /backup</code></p>
<p>5. Edit /etc/fstab an add a record for the new drive at the end of the file. This will make the server mount the drive automatically after reboot. Mount options (like noatime and nodiratime) can be added as a comma separated list of values after "defaults": "defaults,noatime,nodiratime"</p>
<p><code>echo "/dev/sdd  /backup  ext3  defaults 0 0" &gt;&gt; /etc/fstab</code></p>
<p>Linux records information about when files were created and last modified as well as when it was last accessed. There is a cost associated with recording the last access time. Linux has a special mount option for file systems called <code>noatime</code> that can be added to each line that addresses one file system in the /etc/fstab file. If a file system has been mounted with this option, reading accesses to the file system will no longer result in an update to the <code>atime</code> information associated with the file. The importance of the noatime setting is that it eliminates the need by the system to make writes to the file system for files which are simply being read. Since writes can be somewhat expensive, this can result in measurable performance gains.</p>
<p><code>nodiratime</code> does the same thing but for directories. I know the beginners guide says to use both mount options on file systems, but from others I've talked to and places I've read it seems noatime implies nodiratime because noatime is a superset and nodiratime is a subset used specifically to disable it for directories but leave it on for files, and when you use noatime, it does it for everything, files/dirs</p>
<p><code>echo "/dev/sdd  /backup  ext3  rw,noatime,nodiratime 0 0" &gt;&gt; /etc/fstab</code></p>
<p>Mount the drive. "mount -a" just mounts everything according to /etc/fstab.</p>
<p><code>mount -a</code></p>
<p>Reboot to make sure it starts ok with the new drive mounted.</p>
