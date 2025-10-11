---
layout: post
title: 'Linux: Find and remove files recursively'
date: 2010-02-11 11:37:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Linux
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingster
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '4027371758911732860'
  _oembed_2af2bb7638a46220eb44276efd89e76b: "{{unknown}}"
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/4027371758911732860
  blogger_permalink: "/2010/02/linux-find-and-remove-files-recursively.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1456004071;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:255;}i:1;a:1:{s:2:"id";i:221;}i:2;a:1:{s:2:"id";i:353;}}}}
  original_post_id: '235'
  _wp_old_slug: '235'
author: mingster
---
<p><code><br />find . -type f -name "*.log" -exec rm -f {} \;<br /></code></p>
<p>Remember to switch to the directory you're working on..</p>
<p><a href="http://www.cyberciti.biz/faq/linux-unix-how-to-find-and-remove-files/">http://www.cyberciti.biz/faq/linux-unix-how-to-find-and-remove-files/</a></p>
