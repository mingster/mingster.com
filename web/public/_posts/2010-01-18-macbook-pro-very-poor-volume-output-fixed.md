---
layout: post
title: MacBook Pro - Very Poor Volume Output FIXED!
date: 2010-01-18 09:59:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingster
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '5683765067810116014'
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/5683765067810116014
  blogger_permalink: "/2010/01/macbook-pro-very-poor-volume-output.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455263402;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:218;}i:1;a:1:{s:2:"id";i:257;}i:2;a:1:{s:2:"id";i:198;}}}}
  original_post_id: '235'
  _wp_old_slug: '235'
author: mingster
---
<p>If your bootcamp windows is having very poor volume output on 2009 unibody MacBook Pro, here's the solution: <a href="http://www.stuffedcow.net/macbook_audio">http://www.stuffedcow.net/macbook_audio</a>. Thank you, Henry.</p>
<p>I follow the instruction below, plus a reboot, and fixed the problem:
<ol>
<li>Download and unzip this package: <a href="http://www.stuffedcow.net/files/CirrusAudioXP_Macbook_c.zip">CirrusAudioXP_Macbook_c.zip 1.0.0.13c (Nov. 1, 2009)</a>.</li>
<li>In Device Manager, Update Driver for the Cirrus Logic High Definition Audio device. Don't let Windows search for or do anything automatically. Manually choose to the driver from a list, and use the "Have Disk..." button.</li>
<li>Reboot.</li>
</ol>
<p>My configuration is latest 13" MBP (MB990LL/A), bootcamp 3.0 from Snow Leopard, and latest Windows 7 (build 7600).</p>
<p>The detail discussion can be viewed here: <a href="http://discussions.apple.com/thread.jspa?threadID=2037093&amp;start=449">http://discussions.apple.com/thread.jspa?threadID=2037093&amp;start=449</a></p>
