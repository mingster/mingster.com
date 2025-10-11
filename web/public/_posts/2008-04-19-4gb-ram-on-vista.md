---
layout: post
title: 4GB RAM on Vista
date: 2008-04-19 11:36:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2008/04/4gb-ram-on-vista.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455486986;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:98;}i:1;a:1:{s:2:"id";i:156;}i:2;a:1:{s:2:"id";i:198;}}}}
  original_post_id: '160'
  _wp_old_slug: '160'
author: mingster
---
<p>All 32-bit Operating Systems can only physically address 4 GB of RAM, due to the math involved (2<sup>32</sup> = 4,294,967,296).  Depending on your hardware, Vista may only see 3GB or 3.5GB of the total RAM installed, because there are some devices that are memory mapped.  The most common hardware of this type of device is a video card, which can use up to 512MB of memory for mapping.</p>
<p><strong></strong>You can tweak Vista's core to add another 4-bits of addressing capability, but you must have a 64-bit capable CPU (pretty much any processor made within the past two years like Core 2 Duo or Athlon 64).  Even though the math works out to address way more than 4GB (2<sup>36</sup> = 68,719,476,736), the operating system still has a cap (Windows Server can address anywhere from 8GB to 128GB depending on the flavor).</p>
<p>To force this new addressing method, you have to tell Vista to boot using this new parameter.  Vista no longer uses a BOOT.INI file as previous versions of Windows did, so you must modify the boot file using a built-in Vista tool called <span style="font-weight:bold;">BCDedit</span>.</p>
<p>To turn on PAE, in Command prompt, type <strong>BCDedit /set PAE forceenable</strong>.</p>
<p>This PAE flag (Physical Address Extension) tells the Vista core to use an additional 4 bits of addressing, which in theory allows the OS to see all of the RAM you have available.  We're not out of the woods yet, because once you reboot you may find that Vista still doesn't see all of your RAM.</p>
<p>Using PAE might make Vista to run slower. Vista runs slower with PAE because of the new page-translation system being used.  By default Vista uses 2 cycles to address memory, and will use 3 when Physicall Address Extension is enabled.  PAE also supports advanced procesor features such as Data Execution Prevention (no execute), Non-Uniform Memory Architecture (NUMA), and hot-add memory.  PAE is automatically disabled when DEP (Data Execution Prevention) is disabled, so you must force PAE when DEP is disabled by running BCDedit:</p>
<p>To disable DEP: <strong>BCDedit /set nx AlwaysOff</strong><span style="font-size:85%;"><br /></span></p>
<p>PAE force on: <span style="font-family:courier new;font-size:85%;"><strong>BCDedit /set pae ForceEnable</strong></span></p>
<p>You can turn PAE off again by typing <strong><span style="font-family:courier new;">BCDedit /set PAE forcedisable</span> </strong>or<strong> <span style="font-family:courier new;">BCDedit /set PAE default</span>.</strong></p>
<p><strong><br /></strong></p>
<p><strong></strong></p>
