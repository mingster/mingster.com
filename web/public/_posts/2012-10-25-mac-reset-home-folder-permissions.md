---
layout: post
title: 'Mac: Reset home folder permissions'
date: 2012-10-25 16:38:19.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
- Mac
tags:
- mac
meta:
  _edit_last: '40718'
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455224212;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:254;}i:1;a:1:{s:2:"id";i:253;}i:2;a:1:{s:2:"id";i:449;}}}}
  original_post_id: '373'
  _wp_old_slug: '373'
author: mingster
---
<p>This is for Mountain Lion.</p>
<p><a href="http://www.fixkb.com/2011/08/reset-home-folder-permissions.html">http://www.fixkb.com/2011/08/reset-home-folder-permissions.html</a></p>
<ol>
<li>In Terminal, type <strong>sudo bash</strong> and press Enter.</li>
<li>You will need to enter your password and press Enter.
<ul>
<li>It won’t show any characters when you type.</li>
</ul>
<ul>
<li>If you do not have a password then set one first.</li>
</ul>
</li>
<li>Type in the following (case-sensitive), pressing Enter at the end of each line.<br />
<em>Replace “username” with the name of your home folder.</em><br />
<code>sudo chmod -R -v -N ~<br />
sudo chown -R username:staff ~<br />
sudo chmod -R -v 700 ~<br />
sudo chmod -v 755 ~</code></li>
</ol>
