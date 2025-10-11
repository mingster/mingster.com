---
layout: post
title: ssh via apache deamon user
date: 2009-11-12 19:47:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Linux
- Tech Note
tags: []
meta:
  _edit_last: '40718'
  blogger_blog: mingstert.blogspot.com
  blogger_author: Ming Tsai
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '8212595174540119273'
  _wpas_skip_yup: '1'
  _wpas_skip_twitter: '1'
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/8212595174540119273
  blogger_permalink: "/2009/11/ssh-via-apache-deamon-user.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1438571294;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:167;}i:1;a:1:{s:2:"id";i:563;}i:2;a:1:{s:2:"id";i:238;}}}}
  original_post_id: '235'
  _wp_old_slug: '235'
author: mingster
---
<p>Scenario: You have a web script (php, ruby, python, or so) that need to ssh over a remote machine to do stuff.  How you do set up ssh key for the apache deamon user?</p>
<p>After some dig out, here's the steps, mostly taken from (<a href="http://www.boredworkers.com/2009/08/24/script-tips-ssh-key-for-apache/">Boredworkers.com</a>):</p>
<p><span style="font-weight:bold;">Make key for apache daemon</span><br />1. log in to source server as root<br />2. create .ssh directory for apache user. Make sure you have the ownership right:<br /><code><br />$ mkdir /var/www/.ssh<br />$ chown -R apache:nobody /var/www/.ssh<br /></code></p>
<p>3. Generate the ssh-key authentication key as user apache using sudo. Use the default file location and leave empty when prompted for passphrase.<br /><code><br />$ sudo -u apache ssh-keygen -t rsa<br /></code></p>
<p>4. Append apache's public key to destination server<br /><code><br />$ sudo -u apache cat .ssh/id_rsa.pub | ssh dest_user@dest_server 'cat &gt;&gt; /var/www/.ssh/authorized_keys'<br /></code></p>
<p>5. Test the set up. You’ll see that you can now run ssh commands without being prompted for the user password:<br /><code><br />$ sudo -u apache ssh dest_user@dest_server<br /></code></p>
<p>refernce: <a href="http://www.boredworkers.com/2009/08/24/script-tips-ssh-key-for-apache/">http://www.boredworkers.com/2009/08/24/script-tips-ssh-key-for-apache/</a></p>
