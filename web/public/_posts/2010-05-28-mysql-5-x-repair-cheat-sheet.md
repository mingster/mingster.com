---
layout: post
title: MySQL 5.x Repair Cheat Sheet
date: 2010-05-28 22:15:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev
- IT
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingsterhttp://www.blogger.com/profile/10981076410240209932noreply@blogger.com
  blogger_permalink: "/2010/05/mysql-5x-repair-cheat-sheet.html"
  _oembed_26041f79dbec44c48fbab15eacff7049: "{{unknown}}"
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/1631797778282203233
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455536640;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:258;}i:1;a:1:{s:2:"id";i:234;}i:2;a:1:{s:2:"id";i:256;}}}}
  original_post_id: '232'
  _wp_old_slug: '232'
author: mingster
---
<p>If you upgrade MySQL or move the database around, you are most likely need to do those operations:<br />
<h1>Backup</h1>
<p><code> mysqldump -u root -p --default-character-set=utf8 databasename &gt; data.sql<br /></code><br />
<h1>Restore</h1>
<p><code> mysqldump -u root -p --default-character-set=utf8  databasename &lt; data.sql </code><br />if database is larger then 100MB, this works better:<code><br />mysql -u root -p<br />#mysql&gt; use the_database<br />#mysql&gt; source data.sql<br /></code><br />
<h1>Check, Repair &amp; Optimize All Tables in All Databases</h1>
<p>If you need database server up, use mysqlcheck:<code><br />mysqlcheck -u root -p --auto-repair --check --optimize --all-databases<br /></code></p>
<p>Or you can make it offline and do a better check:<code><br />service mysqld stop<br />myisamchk /var/lib/mysql/the_database/*.MYI<br />service mysqld start<br /></code><br />
<h2>Repair single table</h2>
<p><code> mysql -u root -p<br />#mysql&gt; use the_database<br />#mysql&gt; repair table the_table<br /></code></p>
<p>Reference:<br /><a href="http://www.felipecruz.com/repair-mysql-database.php" target="_blank">http://www.felipecruz.com/repair-mysql-database.php</a></p>
