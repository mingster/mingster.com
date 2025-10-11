---
layout: post
title: MySQL 5.1.x & unicode
date: 2010-05-24 17:07:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- ".NET"
- dev
tags:
- ".Net"
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingsterhttp://www.blogger.com/profile/10981076410240209932noreply@blogger.com
  blogger_permalink: "/2010/05/mysql-51x-unicode.html"
  _oembed_79528e6099d3f33958614b8b1d51bf46: "{{unknown}}"
  _oembed_54dd374d87ec5d1bc06c09f585dcb23d: "{{unknown}}"
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/3818511376979490281
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1436923253;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:258;}i:1;a:1:{s:2:"id";i:233;}i:2;a:1:{s:2:"id";i:353;}}}}
  original_post_id: '232'
  _wp_old_slug: '232'
author: mingster
---
<p>In our recent upgrade from 5.0 to 5.1.47, the new version behaves differently and it screw up character set when user submit info from our web app powered by .NET. </p>
<p>After digging around for a afternoon, this is how to fix it:<br /><code><br />vi /etc/my.cnf<br /></code></p>
<p>And add those lines to the config:<br /><code><br />init_connect='SET collation_connection = utf8_general_ci'<br />init_connect='SET NAMES utf8'<br />default-character-set=utf8<br />character-set-server=utf8<br />collation-server=utf8_general_ci<br />skip-character-set-client-handshake<br /></code></p>
<p>There are other options for collation besides utf8_general_ci such as utf8_unicode_ci. See this article:<br />http://dev.mysql.com/doc/refman/5.1/en/charset-unicode-sets.html</p>
<p>Reference: <a href="http://rhyous.com/2009/11/05/how-to-create-a-utf-8-unicode-database-on-mysql/">http://rhyous.com/2009/11/05/how-to-create-a-utf-8-unicode-database-on-mysql/</a></p>
