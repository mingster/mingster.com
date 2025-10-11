---
layout: post
title: MacOS Sierra and ssh public key
date: 2016-09-22 15:55:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
tags: []
meta:
  blogger_blog: mingster.blogspot.com
  blogger_author: ming tsai
  blogger_eb3191f8b77bf2ac10a5fe54aebee9ae_permalink: '5936549539066941208'
author: mingster
---
<p>If ssh dsa key is used for password-less access to other boxes, it won't work in MacOS Sierra anymore.  It's because:</p>
<p><i>The problem is that DSA keys are obsolete after OpenSSH 7.0, which the new system seems to use. I generated a new RSA key and things worked again. Also, in the process I found out that the authorized_keys2 file has been actually deprecated for a long time! So I advice everybody to use authorized_keys instead, which works both with protocols 1 and 2. That way Apple's original sshd_config will work as is. </i></p>
<p> <a href="https://forums.developer.apple.com/thread/48794" target="_blank">https://forums.developer.apple.com/thread/48794</a></p>
<p>So be sure to redo your key in rsa before (or after) the OS upgrade.</p>
