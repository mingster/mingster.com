---
layout: post
title: 'How-To: Recursively remove .svn folders'
date: 2009-09-06 15:51:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
- Tech Note
tags: []
meta:
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '4033576099166156248'
  blogger_author: mingster
  blogger_blog: mingstert.blogspot.com
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/4033576099166156248
  blogger_permalink: "/2009/09/how-to-recursively-remove-svn-folders.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455212409;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:563;}i:1;a:1:{s:2:"id";i:167;}i:2;a:1:{s:2:"id";i:223;}}}}
  original_post_id: '251'
  _wp_old_slug: '251'
author: mingster
---
<p>Moved from windows to mac, the old "D drive" staff need a bit of re-org.  One big trouble I found is that OSX doesn't deal with file start with "dot" well. For example, the ".svn" folders.</p>
<p>So how to get rid of these?  On any *nix machine (Mac included) you can run the following command:<br /><code><br />rm -rf 'find . -type d -name .svn'<br /></code></p>
