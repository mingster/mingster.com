---
layout: post
title: Tuning the Linux kernel for better network throughput
date: 2008-04-19 17:24:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingster
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '2151657612462321792'
  blogger_permalink: "/2008/04/tuning-linux-kernel-for-better-network.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453637155;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:164;}i:1;a:1:{s:2:"id";i:156;}i:2;a:1:{s:2:"id";i:167;}}}}
  original_post_id: '160'
  _wp_old_slug: '160'
author: mingster
---
<p>If your linux server needs to have better network throughput, try this out.<br />From /etc/sysctl.conf:
<div style="font-family:courier new;">net.ipv4.tcp_window_scaling = 1<br />net.ipv4.tcp_syncookies = 1<br />net.ipv4.tcp_rmem = 4096 87380 16777216<br />net.ipv4.tcp_wmem = 4096 65536 16777216<br />net.core.rmem_max = 16777216<br />net.core.wmem_max = 16777216</div>
<p>The first command enables TCP window scaling, which allows clients to download data at a higher rate by enabling extra bits in TCP packets that are used to increase the window size.<br />The second command enables TCP SYN cookies, which is often enabled by default and is extremely effective in preventing conditions such as SYN floods that can drain the server of resources used to process incoming connections.<br />The last four options increase the TCP send and receive buffers, which allow an application to move its data out faster so as to serve other requests. This also improves the client's ability to send data to the server when it gets busy.<br />To make the change immediately:
<div style="font-family:courier new;">sysctl -p /etc/sysctl.conf</div>
<p>To see all of the currently configured sysctl parameters:
<div style="font-family:courier new;">sysctl -a</div>
<p>You can also use sysctl to make the change:
<div style="font-family:courier new;">sysctl -w net.ipv4.tcp_window_scaling=1</div>
<p>This can be useful for testing the effectiveness of certain settings without committing them to being defaults.</p>
