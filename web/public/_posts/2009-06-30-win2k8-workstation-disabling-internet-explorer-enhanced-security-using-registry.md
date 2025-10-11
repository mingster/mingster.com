---
layout: post
title: win2k8 workstation - Disabling Internet Explorer Enhanced Security using registry
date: 2009-06-30 10:45:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
tags: []
meta:
  _edit_last: '40718'
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2009/06/win2k8-workstation-disabling-internet.html"
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/5932573981952984087
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1442217752;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:103;}i:1;a:1:{s:2:"id";i:232;}i:2;a:1:{s:2:"id";i:156;}}}}
  original_post_id: '256'
  _wp_old_slug: '256'
author: mingster
---
<p>To turn off Internet Explorer Enhanced Security Configuration, you can remove the IEHarden registry entry from the user account profile. To do this, follow these steps:
<div>
<div>1. run Regedit.exe.</div>
<div>2. Locate and then click the following registry subkey: HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Zonemap</div>
<div>3. In the details pane, right-click IEHarden, click Modify, type 0 (zero) in the Value data box, and then click OK.</div>
<div>4. You can also remove this registry entry. Locate and then click the following registry subkey: HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings</div>
<div>5. In the details pane, right-click IEHardenIENoWarn, click Modify, type 0 (zero) in the Value data box, and then click OK.</div>
<div>6. Exit Registry Editor, and then start Internet Explorer.</div>
<div>7. On the Tools menu, click Internet Options.  Click the Advanced tab, click Restore Defaults, and then click OK.</div>
<div>ref:<br />-<a href="http://support.microsoft.com/kb/933991/">http://support.microsoft.com/kb/933991/</a><br />-<a href="http://www.win2008workstation.com/wordpress/2008/03/08/disabling-internet-explorer-enhanced-security/">http://www.win2008workstation.com/wordpress/2008/03/08/disabling-internet-explorer-enhanced-security/</a></div>
<div></div>
</div>
