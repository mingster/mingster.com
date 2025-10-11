---
layout: post
title: 'REHL: mount iso images'
date: 2009-10-23 18:25:00.000000000 +08:00
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
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '8140926894813776734'
  _edit_last: '40718'
  _wpas_skip_yup: '1'
  _wpas_skip_twitter: '1'
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/8140926894813776734
  blogger_permalink: "/2009/10/rehl-mount-iso-images.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455380075;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:50;}i:1;a:1:{s:2:"id";i:218;}i:2;a:1:{s:2:"id";i:179;}}}}
  original_post_id: '175'
  _wp_old_slug: '175'
author: mingster
---
<p>Below is the way to mount iso image file in REHL system:</p>
<p>Before you start to mount your iso image, you need to ensure the folder /mnt/isoimage is available, if /mnt/isoimage is not available just create one using command below:-</p>
<p><code>#mkdir /mnt/isoimage </code></p>
<p>* Once isoimage directory is available, you can use the command below to mount your iso image</p>
<p><code># mount -o loop -t iso9660 myisoimage.iso /mnt/isoimage/</code></p>
<p>* You just mount your iso image file to /mnt/isoimage successfully. To access your iso image files, go to /mnt/isoimage</p>
<p>Once you finish using your files, below is the way to unmount your iso image:-</p>
<p><code># umount /mnt/isoimage</code></p>
