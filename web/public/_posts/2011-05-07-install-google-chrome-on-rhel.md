---
layout: post
title: Install Google Chrome on RHEL
date: 2011-05-07 13:26:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Linux
tags: []
meta:
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/2459331328609702188
  blogger_permalink: "/2011/05/install-google-chrome-on-rhel.html"
  blogger_blog: mingstert.blogspot.com
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1446500694;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:225;}i:1;a:1:{s:2:"id";i:167;}i:2;a:1:{s:2:"id";i:236;}}}}
  original_post_id: '221'
  _wp_old_slug: '221'
author: mingster
---
<p>This howto explains howto install Google Chrome Web browser on <b>Fedora 14</b>, <b>Fedora 13</b>, <b>Fedora 12</b> and <b>Red Hat 6 (RHEL 6)</b>. Best way to install and keep up-to-date with Google Chrome browser is use Google’s own YUM repository. <br />
<h2>1. Enable Google YUM repository</h2>
<p>Add following to <i>/etc/yum.repos.d/google.repo</i> file:<br />32-bit
<div>
<div>
<pre style="font-family:monospace;"><span style="color:#7a0874;font-weight:bold;">[</span>google<span style="color:#7a0874;font-weight:bold;">]</span><br /><span style="color:#007800;">name</span>=Google - i386<br /><span style="color:#007800;">baseurl</span>=http:<span style="color:black;font-weight:bold;">//</span>dl.google.com<span style="color:black;font-weight:bold;">/</span>linux<span style="color:black;font-weight:bold;">/</span>rpm<span style="color:black;font-weight:bold;">/</span>stable<span style="color:black;font-weight:bold;">/</span>i386<br /><span style="color:#007800;">enabled</span>=<span style="color:black;">1</span><br /><span style="color:#007800;">gpgcheck</span>=<span style="color:black;">1</span><br /><span style="color:#007800;">gpgkey</span>=https:<span style="color:black;font-weight:bold;">//</span>dl-ssl.google.com<span style="color:black;font-weight:bold;">/</span>linux<span style="color:black;font-weight:bold;">/</span>linux_signing_key.pub</pre>
</div>
</div>
<p>64-bit
<div>
<div>
<pre style="font-family:monospace;"><span style="color:#7a0874;font-weight:bold;">[</span>google64<span style="color:#7a0874;font-weight:bold;">]</span><br /><span style="color:#007800;">name</span>=Google - x86_64<br /><span style="color:#007800;">baseurl</span>=http:<span style="color:black;font-weight:bold;">//</span>dl.google.com<span style="color:black;font-weight:bold;">/</span>linux<span style="color:black;font-weight:bold;">/</span>rpm<span style="color:black;font-weight:bold;">/</span>stable<span style="color:black;font-weight:bold;">/</span>x86_64<br /><span style="color:#007800;">enabled</span>=<span style="color:black;">1</span><br /><span style="color:#007800;">gpgcheck</span>=<span style="color:black;">1</span><br /><span style="color:#007800;">gpgkey</span>=https:<span style="color:black;font-weight:bold;">//</span>dl-ssl.google.com<span style="color:black;font-weight:bold;">/</span>linux<span style="color:black;font-weight:bold;">/</span>linux_signing_key.pub</pre>
</div>
</div>
<p><b>Note: Both 32-bit and 64-bit repos can be placed in the same file.</b><br />
<h2>2. Install Google Chrome with YUM (as root user)</h2>
<h3>Install Google Chrome Stable Version</h3>
<div>
<div>
<pre style="font-family:monospace;"><span style="color:#666666;font-style:italic;">## Install Google Chrome Stable version ##</span><br />yum <span style="color:#c20cb9;font-weight:bold;">install</span> google-chrome-stable</pre>
</div>
</div>
<h3>Install Google Chrome Beta Version</h3>
<div>
<div>
<pre style="font-family:monospace;"><span style="color:#666666;font-style:italic;">## Install Google Chrome Beta version ##</span><br />yum <span style="color:#c20cb9;font-weight:bold;">install</span> google-chrome-beta</pre>
</div>
</div>
<h3>Install Google Chrome Unstable Version</h3>
<div>
<div>
<pre style="font-family:monospace;"><span style="color:#666666;font-style:italic;">## Install Google Chrome Unstable version ##</span><br />yum <span style="color:#c20cb9;font-weight:bold;">install</span> google-chrome-unstable</pre>
</div>
</div>
