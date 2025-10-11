---
layout: post
title: Finding video/ image file info
date: 2011-05-12 17:31:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev enviornment
tags: []
meta:
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/5594472814401207686
  blogger_permalink: "/2011/05/finding-video-image-file-info.html"
  blogger_blog: mingstert.blogspot.com
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455252461;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:50;}i:1;a:1:{s:2:"id";i:98;}i:2;a:1:{s:2:"id";i:249;}}}}
  original_post_id: '220'
  _wp_old_slug: '220'
author: mingster
---
<p>In ffmpeg, you can determine video or image file info:</p>
<p><code><br />ffmpeg -i my_video_filename<br /></code></p>
<p>Another option is exiftool tool.</p>
<p>1. Install on RHEL<br /><code>yum install perl-Image-ExifTool.noarch</code><br />**you need to have rpmforge repository installed.</p>
<p>2. Use it<br /><code>exiftool my_video_file</code></p>
