---
layout: post
title: F5 debugging of ASP.NET applications on IIS7 Vista
date: 2007-01-03 13:36:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev
- Tech Note
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2007/01/f5-debugging-of-aspnet-applications-on.html"
author: mingster
---
<p>Basically, this is the quickest way to fix back F5 debugging on IIS7/Vista:<br />1. Install <a title="links" href="http://www.microsoft.com/downloads/details.aspx?familyid=fb6bb56a-10b7-4c05-b81c-5863284503cf&amp;displaylang=en" target="_blank">Visual Studio 2005 SP1 update</a>;<br />2. Install required IIS components such as Windows Authenication;<br />3. Make the web application to run under Classic mode.</p>
<p>Check out <a href="http://mvolo.com/blogs/serverside/archive/2006/12/28/Fix-problems-with-Visual-Studio-F5-debugging-of-ASP.NET-applications-on-IIS7-Vista.aspx" target="_blank">Mike Volodarsky's article</a> for a complete load-down.</p>
