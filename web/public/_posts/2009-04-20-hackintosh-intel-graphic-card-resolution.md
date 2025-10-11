---
layout: post
title: hackintosh - Intel graphic card resolution
date: 2009-04-20 23:07:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2009/04/hackintosh-intel-graphic-card.html"
  _edit_last: '40718'
  _wpas_skip_yup: '1'
  _wpas_skip_twitter: '1'
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455916557;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:98;}i:1;a:1:{s:2:"id";i:165;}i:2;a:1:{s:2:"id";i:147;}}}}
  original_post_id: '175'
  _wp_old_slug: '175'
author: mingster
---
<p><a href="http://www.insanelymac.com/forum/lofiversion/index.php/t5513.html">http://www.insanelymac.com/forum/lofiversion/index.php/t5513.html</a></p>
<p>For G33,Q33 Intel chip, there's no ktext for it; however you can do this to alter the resolution:</p>
<p>vi /Library/Preferences/SystemConfiguration/com.apple.Boot.plist</p>
<p>Edit string value for Kernel Flags,<br />Kernel Flags<br />"Graphics Mode"="1280×1024×32"</p>
<p>After reboot, it's default to 1280x1024 instead of 1024x768, much better.</p>
<p>This works on iDeneb 10.5.6.</p>
