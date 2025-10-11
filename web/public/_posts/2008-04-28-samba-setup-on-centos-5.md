---
layout: post
title: Samba Setup on CentOS 5
date: 2008-04-28 15:57:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev enviornment
- IT
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2008/04/samba-setup-on-centos-5.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1444599428;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:179;}i:1;a:1:{s:2:"id";i:243;}i:2;a:1:{s:2:"id";i:317;}}}}
  original_post_id: '160'
  _wp_old_slug: '160'
author: mingster
---
<p>I have an existing user "amy" on my new installation of CentOS v5.1. I want a directory located at "/home/fileServer" to be shared through samba as "fileServer", that can be mounted by amy in Windows XP and Vista.</p>
<p>Here's the steps:</p>
<p>1. Installed samba server<br />yum install samba</p>
<p>2. Created directory to be shared<br /># mkdir /home/fileServer<br /># chown root:root /home/fileServer<br /># chmod 770 /home/fileServer</p>
<p>3. Edit samba configuration file<br /># cd /etc/samba<br /># mv smb.conf smb.conf.sample<br /># vi <b>smb.conf</b><br />[global]<br />workgroup = MYWORKGROUP</p>
<p>[fileServer]<br />comment = file server<br />path = /home/fileServer<br />writable = yes<br />create mask = 0770<br />directory mask = 0770</p>
<p>4. Edit samba user accounts<br /># smbpasswd -a root<br /># smbpasswd -a amy</p>
<p>5. Update smbusers file<br /># vi <b>smbusers</b><br />root = administrator admin<br />amy = amy</p>
<p>6. Started smb daemon<br /># service smb restart</p>
<p>7. Test<br />In Windows XP, typed \\, and entered amy as user with the password. You should see the share defined in smb.conf.</p>
