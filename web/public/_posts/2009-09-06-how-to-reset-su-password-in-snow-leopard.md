---
layout: post
title: How to reset su password in snow leopard
date: 2009-09-06 23:18:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
- Tech Note
tags: []
meta:
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '1325777221036233048'
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingster
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455828729;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:373;}i:1;a:1:{s:2:"id";i:258;}i:2;a:1:{s:2:"id";i:253;}}}}
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/1325777221036233048
  blogger_permalink: "/2009/09/how-to-reset-su-password-in-snow.html"
  original_post_id: '251'
  _wp_old_slug: '251'
author: mingster
---
<p>In 10.5.x or <span class="blsp-spelling-corrected" id="SPELLING_ERROR_0">earlier</span> version of <span class="blsp-spelling-error" id="SPELLING_ERROR_1">OSX</span>, you use Directory Utility to enable root user and reset its password. In Snow Leopard, the utility is removed under the Application/Utility folder.  So what do you do?<br /><code><br /><span class="blsp-spelling-error" id="SPELLING_ERROR_2">sudo</span> <span class="blsp-spelling-error" id="SPELLING_ERROR_3">passwd</span><br /></code><br />Alternately, you can navigate to /System/Library/<span class="blsp-spelling-error" id="SPELLING_ERROR_4">CoreServices</span>/Directory Utility.app to do it in the old way.</p>
