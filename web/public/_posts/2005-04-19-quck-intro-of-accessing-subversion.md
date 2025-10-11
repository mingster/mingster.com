---
layout: post
title: Quck Intro of Accessing Subversion
date: 2005-04-19 16:25:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- book review
- dev enviornment
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2005/04/quck-intro-of-accessing-subversion.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1454858365;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:563;}i:1;a:1:{s:2:"id";i:167;}i:2;a:1:{s:2:"id";i:225;}}}}
  blogger_author: Ming Tsai
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/112297139003160939
  original_post_id: '54'
  _wp_old_slug: '54'
author: mingster
---
<p>Version control is the art of managing changes to information. It has long been a critical tool for programmers, who typically spend their time making small changes to software and then undoing those changes the next day. But the usefulness of version control software extends far beyond the bounds of the software development world. Anywhere you can find people using computers to manage information that changes often, there is room for version control. And that's where Subversion comes into play.</p>
<p>Subversion uses WebDAV to access the repository and as such every file is accessible using standard http addresses.</p>
<p>To check out the source from the repository, you can use one of the following clients:<br />
<blockquote>
<ul>
<li>AnkhSVN is a plugin for Visual Studio.NET and allows you to checkout the source from within the Microsoft development tool. This is recommended for Gentle.NET developers or people working with Gentle in source form, provided you're using VS.NET as development IDE. </li>
<li>TortoiseSVN is a Windows Explorer plugin which integrates well with Windows and allows access to the repository from outside the development IDE. </li>
<li>RapidSVN is a graphical client program much like you may be familiar with from Visual SourceSafe or a similar tool. </li>
<li>Subversion itself includes command-line tools to access the repository.</li>
</ul>
</blockquote>
<p>Additionally, you can browse the repository using a web browser:
<p>ViewCVS allows you to browse the source, view diffs, compare revisions and is a nice tool when you need to have a quick look at a file or revisions thereof.<br />WebDAV can be used to see the latest revision.
<p>See O'Reilly's article for more intro. </p></p></p>
