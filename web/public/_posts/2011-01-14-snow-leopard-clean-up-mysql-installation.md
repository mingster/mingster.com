---
layout: post
title: Snow Leopard - clean up MySQL installation
date: 2011-01-14 22:26:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
tags: []
meta:
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/6189502429538450814
  blogger_permalink: "/2011/01/snow-leopard-clean-up-mysql.html"
  blogger_blog: mingstert.blogspot.com
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455362652;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:256;}i:1;a:1:{s:2:"id";i:449;}i:2;a:1:{s:2:"id";i:254;}}}}
  original_post_id: '226'
  _wp_old_slug: '226'
author: mingster
---
<p>For whatever reason you need to reinstall/ clean MySQL. Here are the spots:</p>
<p><code>sudo rm -rf /usr/local/mysql*<br />sudo rm -rf /Library/StartupItems/MySQLCOM<br />sudo rm -rf /Library/PreferencePanes/My*<br />rm -rf ~/Library/PreferencePanes/My*<br />sudo rm -rf /Library/Receipts/mysql*<br />sudo rm -rf /Library/Receipts/MySQLStartupItem.pkg/<br />sudo rm -rf /var/db/receipts/com.mysql.mysql*<br />sudo rm -rf /var/db/receipts/com.mysql.mysqlstartup*<br /></code></p>
<p>edit /etc/hostconfig and remove the line MYSQLCOM=-YES-</p>
<p>Launchctl<br /><code>launchctl list|grep mysql<br /></code></p>
<p>remove anything found.</p>
