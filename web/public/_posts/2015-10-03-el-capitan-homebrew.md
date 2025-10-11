---
layout: post
title: El Capitan & Homebrew
date: 2015-10-03 16:17:50.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
tags: []
meta:
  _edit_last: '40718'
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455743603;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:968;}i:1;a:1:{s:2:"id";i:563;}i:2;a:1:{s:2:"id";i:226;}}}}
  _srslide_disable_on_post: '0'
  _srslide_title: ''
  _srslide_tags: ''
  _srslide_article_icon: ''
  interface_sidebarlayout: default
  original_post_id: '974'
  _wp_old_slug: '974'
author: mingster
---
<p>El Capitan just released. And surely we need to take care the upgrade for Homebrew. Check <a href="https://github.com/mingster/dotfiles">this</a> out if you're not familiar with it.</p>
<p>Here's the upgrade steps:</p>
<ol>
</ol>
<ol>
<li>update <a href="https://developer.apple.com/xcode/download/" target="_blank">xcode to 7.0.1</a></li>
<li>install command line tool</li>
</ol>
<pre><code>xcode-select --install</code></pre>
<ol>
</ol>
<ol>
<li>fix /usr/local permission</li>
</ol>
<pre><code>sudo chown $(whoami):admin /usr/local &amp;&amp; sudo chown -R $(whoami):admin /usr/local</code></pre>
<ol>
<li>run update &amp; upgrades
<pre><code>brew update
brew upgrade
brew cask update
brew doctor
brew cleanup
brew cask cleanup
</code></pre>
</li>
</ol>
<p>Reference:</p>
<ul>
<li><a href="http://superuser.com/questions/940874/homebrew-doesnt-install-new-apps-in-el-capitan" target="_blank">SuperUser discussion</a></li>
<li><a href="https://github.com/Homebrew/homebrew/blob/master/share/doc/homebrew/El_Capitan_and_Homebrew.md" target="_blank">Homebrew release note</a></li>
</ul>
