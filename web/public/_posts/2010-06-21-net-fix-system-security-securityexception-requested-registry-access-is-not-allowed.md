---
layout: post
title: ".NET fix: System.Security.SecurityException: Requested registry access is
  not allowed."
date: 2010-06-21 12:11:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- ".NET"
tags:
- ".Net"
meta:
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/3580094788594316148
  blogger_permalink: "/2010/06/net-fix-systemsecuritysecurityexception.html"
  blogger_blog: mingstert.blogspot.com
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453385552;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:317;}i:1;a:1:{s:2:"id";i:103;}i:2;a:1:{s:2:"id";i:262;}}}}
  original_post_id: '232'
  _wp_old_slug: '232'
author: mingster
---
<p>If you get something like this:</p>
<pre>Server Error in '/applicationname' Application.<br />---------------------------------------------------------------------------<br />Security Exception <br />Description: The application attempted to perform an operation not allowed by the security policy. To grant this application the required permission please contact your system administrator or change the application's trust level in the configuration file. <br /><br />Exception Details: System.Security.SecurityException: Requested registry access is not allowed.<br /><br />Source Error: <br />An unhandled exception was generated during the execution of the current web request. Information regarding the origin and location of the exception can be identified using the exception stack trace below. <br /><br />Stack Trace: <br />[SecurityException: Requested registry access is not allowed.]<br />Microsoft.Win32.RegistryKey.OpenSubKey(String name, Boolean writable) +473<br />....<br /></pre>
<p>I'm not sure there's a secured way, but adding permission for iis daemon user solve the problem for me.</p>
<p>1. Find out which deamon user your app is using, by looking up App_Pool and secruity section in event log.</p>
<p>2. Give the user permission to read/write access for the eventlog registry entry. To do so, open regedit and navigate to the key:
<pre>HKEY_LOCAL_MACHINESYSTEMCurrentControlSetServicesEventlog</pre>
<p>. <br />Right click and select Permissions, and add permission for the user.</p>
<p>3. restart iis and give it a try.</p>
