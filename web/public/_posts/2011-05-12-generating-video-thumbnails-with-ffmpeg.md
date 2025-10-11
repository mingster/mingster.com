---
layout: post
title: Generating Video Thumbnails With FFMPEG
date: 2011-05-12 18:33:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
tags: []
meta:
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/7447091065756471640
  blogger_permalink: "/2011/05/generating-video-thumbnails-with-ffmpeg.html"
  blogger_blog: mingstert.blogspot.com
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1443979995;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:220;}i:1;a:1:{s:2:"id";i:225;}i:2;a:1:{s:2:"id";i:391;}}}}
  original_post_id: '219'
  _wp_old_slug: '219'
author: mingster
---
<p>Check out flowplayer's - <a href="http://flowplayer.org/tutorials/generating-thumbs.html">http://flowplayer.org/tutorials/generating-thumbs.html</a></p>
<p>In short, <br /><code><br />ffmpeg -i [video_file] -f image2 -vframes 1 [output_image].jpg<br /></code></p>
<p>For example,<br /><code><br />ffmpeg -ss 12 -i flowplayer.mov -f image2 -vframes 1 flowplayer-12.jpg</code></p>
