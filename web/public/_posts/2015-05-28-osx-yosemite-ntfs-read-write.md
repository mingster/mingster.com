---
layout: post
title: OSX Yosemite, NTFS Read & Write
date: 2015-05-28 15:40:38.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
tags: []
meta:
  _edit_last: '40718'
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455913280;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:974;}i:1;a:1:{s:2:"id";i:563;}i:2;a:1:{s:2:"id";i:246;}}}}
  _srslide_disable_on_post: '0'
  _srslide_title: OSX Yosemite, NTFS Read & Write
  _srslide_tags: ''
  interface_sidebarlayout: default
  original_post_id: '968'
  _wp_old_slug: '968'
author: mingster
---
<p>Upgrade to Yosemite will break NTFS R&amp;W. Here's how to redo it:</p>
<h1>Requirement</h1>
<ul>
<li>brew</li>
<li>brew cask</li>
</ul>
<p>if you don't know or don't have brew, check this out: <a href="https://github.com/mingster/dotfiles" target="_blank">dotfiles</a></p>
<h1>Installation</h1>
<p>1. Install a binary osxfuse package from Homebrew Cask:</p>
<pre><code>brew cask install osxfuse</code></pre>
<p>2. Install ntfs-3g:</p>
<pre><code>brew install ntfs-3g</code></pre>
<p>3. Symlink to correct version of mount_ntfs:</p>
<pre><code>sudo mv /sbin/mount_ntfs /sbin/mount_ntfs.original
sudo ln -s /usr/local/sbin/mount_ntfs /sbin/mount_ntfs
</code></pre>
<p>4. Remount the NTFS drive and it will work!</p>
