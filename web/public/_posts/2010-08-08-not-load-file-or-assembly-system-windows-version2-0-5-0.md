---
layout: post
title: not load file or assembly 'System.Windows, Version=2.0.5.0...'
date: 2010-08-08 14:38:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- ".NET"
tags:
- ".Net"
meta:
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/8657280401557286956
  blogger_permalink: "/2010/08/not-load-file-or-assembly-systemwindows.html"
  blogger_blog: mingstert.blogspot.com
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453388291;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:353;}i:1;a:1:{s:2:"id";i:317;}i:2;a:1:{s:2:"id";i:232;}}}}
  original_post_id: '230'
  _wp_old_slug: '230'
author: mingster
---
<p>if you get this error, it's because Sliverlight assembly is not in GAC. Do this to fix:</p>
<p><code><br />cd C:Program FilesMicrosoft Silverlight4.0.50524.0<br />gacutil -i System.Core.dll<br />gacutil -i system.dll<br />gacutil -i system.net.dll<br />gacutil -i system.xml.dll<br />gacutil -i System.Runtime.Serialization.dll<br /></code></p>
<p><a href="http://forums.silverlight.net/forums/p/135896/303959.aspx">check out what other people said.</a></p>
