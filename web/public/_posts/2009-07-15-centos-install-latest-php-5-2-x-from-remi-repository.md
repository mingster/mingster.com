---
layout: post
title: CentOS - Install latest PHP (5.2.x) from Remi repository
date: 2009-07-15 00:40:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
- Tech Note
tags: []
meta:
  blogger_permalink: "/2009/07/centos-install-latest-php-52x-from-remi.html"
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingsterhttp://www.blogger.com/profile/10981076410240209932noreply@blogger.com
author: mingster
---
<p>A few app requires PHP 5.2.x but major repositories is yet support anything higher than 5.1.6 at this time. Recompile PHP is a pain also.</p>
<p><a href="http://blog.famillecollet.com/post/2005/10/02/8-telechargement-installation-et-yum">Remi</a> maintains a repository that can save your 1 day or 2 if you have such need.</p>
<p><code>cd /etc/yum.repos.d/<br />wget http://download.fedora.redhat.com/pub/epel/5/i386/epel-release-5-3.noarch.rpm<br />wget http://rpms.famillecollet.com/enterprise/remi-release-5.rpm<br />rpm -Uvh remi-release-5*.rpm epel-release-5*.rpm</code></p>
<p>You now have Remi repository on your system. It's disabled by default, and I recommend you leave it as is. To install from remi, run the following:</p>
<p><code>yum --enablerepo=remi update php</code></p>
<p>I use remi to install php and its related stuff like GD, mcrypt, etc. As well as MySQL. The repository rocks!</p>
