---
layout: post
title: Prevent .DS_Store file creation over network connections
date: 2009-09-20 14:00:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
- Tech Note
tags: []
meta:
  blogger_author: mingster
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '865446409169080180'
  blogger_blog: mingstert.blogspot.com
  _oembed_4fa24ba081ad4ef682f66a655190b52d: "{{unknown}}"
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/865446409169080180
  blogger_permalink: "/2009/09/prevent-dsstore-file-creation-over.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455213404;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:253;}i:1;a:1:{s:2:"id";i:373;}i:2;a:1:{s:2:"id";i:75;}}}}
  original_post_id: '251'
  _wp_old_slug: '251'
author: mingster
---
<p>1. Open the Terminal application from the Utilities folder which is nested in the Applications folder</p>
<p>2. In the newly opened terminal type:<br /><code><br />defaults write com.apple.desktopservices DSDontWriteNetworkStores true<br /></code><br />3. Restart the computer for the change to take effect</p>
<p>Reference: <a href="http://support.apple.com/kb/HT1629">http://support.apple.com/kb/HT1629</a></p>
