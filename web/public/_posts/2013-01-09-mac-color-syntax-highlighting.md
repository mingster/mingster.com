---
layout: post
title: 'mac: color syntax highlighting'
date: 2013-01-09 19:23:14.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
tags: []
meta:
  _edit_last: '40718'
  fb_social_plugin_settings_box_like: default
  fb_social_plugin_settings_box_recommendations_bar: default
  fb_fan_page_message: ''
  _srslide_disable_on_post: '0'
  _srslide_title: 'mac: terminal color syntax highlighting'
  fb_status_messages: 'a:1:{i:0;a:2:{s:7:"message";s:313:"Failed posting to mingster''s
    Timeline because the access token expired.  To reactivate publishing, visit the
    Facebook settings page and re-enable the "Publish to fan page" setting. Full error:
    {"message":"Error validating access token: The session is invalid because the
    user logged out.","type":"OAuthException"}";s:5:"error";s:1:"1";}}'
  _srslide_tags: ''
  _wp_old_slug: '383'
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453386742;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:229;}i:1;a:1:{s:2:"id";i:167;}i:2;a:1:{s:2:"id";i:268;}}}}
  original_post_id: '383'
author: mingster
---
<p>To get the same syntax highlight as in bash shall, add this to ~/.profile<br />
<code>export CLICOLOR=cons25</code></p>
<p>In vi, add the lines below in ~/.vimrc, create the file if you don't have it yet:<br />
<code><br />
:set term=builtin_ansi<br />
:syntax on<br />
</code></p>
