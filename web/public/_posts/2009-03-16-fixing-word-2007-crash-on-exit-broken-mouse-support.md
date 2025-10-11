---
layout: post
title: Fixing Word 2007 Crash on Exit & Broken Mouse Support!
date: 2009-03-16 17:20:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2009/03/fixing-word-2007-crash-on-exit-broken.html"
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/8243923432375617576
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1440482870;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:167;}i:1;a:1:{s:2:"id";i:103;}i:2;a:1:{s:2:"id";i:160;}}}}
  original_post_id: '256'
  _wp_old_slug: '256'
author: mingster
---
<p>Thanks to <a href="http://joeon.net/post/Fixing-Word-2007-Crash-on-Exit-amp3b-Broken-Mouse-Support!.aspx" target="_blank">Joe Stagner</a> to provide the fix.</p>
<p>I love Office 2007, but recently I've had big problems with Word.</p>
<p>1.) I can't select text.....<br />It seems this is a common problem with a number of add-ins. In this case it was the Word plug-in for Snag-It 8 from TechSmith - when I uninstalled it, mouse support came back. Note that this is not JUST a Snag-It problem. A bit of searching on the web reveals that MANY plug ins can cause this problem.</p>
<p>2.) The more irritating but was that Word always crashes on exit. I tried disabling and removing all the add-ins, deleting all the auto loaded templates, even uninstalling and re-installing Office 2007 with no success. Just about the time I was about to commit to waste my day rebuilding my day - I found the answer in a newsgroup archive.</p>
<p>DO THIS !!!</p>
<p>1. Start Regedit.<br />2. Go to HKEY_CURRENT_USER\Software\Microsoft\Office\12.0\Word\Data<br />3. Right mouse click on the "Data" folder and delete it.<br />4. Close Regedit.</p>
<p>POOF - Word 2007 is back to it's awesome self !!<br /><a href="http://joeon.net/post/Fixing-Word-2007-Crash-on-Exit-amp3b-Broken-Mouse-Support!.aspx" target="_blank">http://joeon.net/post/Fixing-Word-2007-Crash-on-Exit-amp3b-Broken-Mouse-Support!.aspx</a></p>
