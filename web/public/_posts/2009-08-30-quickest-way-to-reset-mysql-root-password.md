---
layout: post
title: Quickest way to reset mysql root password
date: 2009-08-30 12:22:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
tags: []
meta:
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '864928731760150177'
  blogger_author: mingster
  blogger_blog: mingstert.blogspot.com
  _edit_last: '40718'
  _wpas_skip_yup: '1'
  _wpas_skip_twitter: '1'
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/864928731760150177
  blogger_permalink: "/2009/08/quickest-way-to-reset-mysql-root.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453411530;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:233;}i:1;a:1:{s:2:"id";i:254;}i:2;a:1:{s:2:"id";i:256;}}}}
  original_post_id: '256'
  _wp_old_slug: '256'
author: mingster
---
<p>If you forgot root password for MySQL, this is the quickest way to reset it. You need to have root access to the box.<br /><code><br />service mysql stop<br /></code><br />wait until MySQL shuts down. Then run<br /><code><br />mysqld_safe --skip-grant-tables &amp;<br /></code><br />then you will be able to login as root with no password.<br /><code><br />mysql -u root<br /></code><br />In MySQL command line prompt issue the following command:<br /><code><br />mysql&gt; use mysql;<br />mysql&gt; UPDATE user SET password=PASSWORD('the_new_password') WHERE user='root';<br />mysql&gt; FLUSH PRIVILEGES;<br /></code><br />At this time your root password is reset and MySQL will now know the privileges and you'll be able to login with your new password:<br /><code><br />mysql -u root -p<br /></code></p>
