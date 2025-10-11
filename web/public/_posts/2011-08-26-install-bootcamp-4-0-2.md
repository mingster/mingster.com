---
layout: post
title: Install BootCamp 4.0
date: 2011-08-26 11:00:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
tags: []
meta:
  blogger_blog: mingster.blogspot.com
  blogger_author: Ming Tsai
  blogger_eb3191f8b77bf2ac10a5fe54aebee9ae_permalink: '888581683501339444'
author: mingster
---
<p>If you upgrade to Lion from Snow Leopard + Win7 bootcamp, you might find that you can't download new bootcamp 4.0 from Bootcamp Assistant.  The way I go around it is by downloading it from Apple's CDN:
<ol>
<li>Download Bootcamp 4.0 Drivers, here's a link on some Apple CDN for the .pkg file containing the drivers (603MB): <a href="http://bit.fosk.it/bootcamp40">http://bit.fosk.it/bootcamp40</a></li>
<li>Open this file with 7Zip in Windows, and go through a few layers to extract BootCampESD.pkg\Payload\Payload~\.\Library\Application Support\BootCamp\WindowsSupport.dmg\0.Apple_ISO</li>
<li>Rename the file from 0.Apple_ISO to BootCamp4.iso</li>
<li>Extract the iso with 7Zip to a folder.</li>
<li>Open command prompt and navigate to the extracted folder, for example: <br /><code>E:<br />cd WindowsSupport\Drivers\Apple</code></li>
<li>From the prompt in that folder, run <code>msiexec /i BootCamp64.msi</code></li>
</ol>
