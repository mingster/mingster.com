---
layout: post
title: Fix backspace/delete when ssh'ing into Linux machines
date: 2011-03-12 22:44:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
tags: []
meta:
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/3633168935574912302
  blogger_permalink: "/2011/03/fix-backspacedelete-when-sshing-into.html"
  blogger_blog: mingstert.blogspot.com
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455230495;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:268;}i:1;a:1:{s:2:"id";i:103;}i:2;a:1:{s:2:"id";i:253;}}}}
  original_post_id: '222'
  _wp_old_slug: '222'
author: mingster
---
<p>the solution is very simple now-the-day. Just go to Terminal's preference, settings, advanced, and check the "Delete sends Ctrl-H".</p>
<p>There's no need to modify .tcshrc what so ever..</p>
