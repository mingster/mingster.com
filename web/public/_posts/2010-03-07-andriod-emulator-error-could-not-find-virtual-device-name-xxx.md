---
layout: post
title: 'Andriod Emulator ERROR: could not find virtual device name: xxx'
date: 2010-03-07 01:39:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev enviornment
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingster
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '9090638493696192391'
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/9090638493696192391
  blogger_permalink: "/2010/03/emulator-error-could-not-find-virtual.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453947226;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:232;}i:1;a:1:{s:2:"id";i:317;}i:2;a:1:{s:2:"id";i:160;}}}}
  original_post_id: '235'
  _wp_old_slug: '235'
author: mingster
---
<p>If you get this error, it's because your windows user home directory is changed. Fix the error by adding a environment variable named ANDROID_SDK_HOME, and set the value to, for example, d:\users\MY_USERNAME.</p>
<p><a href="http://mingster.com/blog_content/androiderror.jpg"><img align="left" alt="Click to view" src="/img/androiderror.jpg" width="350" /></a></p>
<p>Reference: <a href="http://www.mail-archive.com/android-beginners@googlegroups.com/msg13718.html">http://www.mail-archive.com/android-beginners@googlegroups.com/msg13718.html</a></p>
