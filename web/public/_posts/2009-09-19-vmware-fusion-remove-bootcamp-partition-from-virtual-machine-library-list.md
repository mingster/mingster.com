---
layout: post
title: VMware Fusion - remove "Bootcamp partition" from Virtual Machine Library List
date: 2009-09-19 16:20:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Mac
- Tech Note
tags: []
meta:
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '242591125960790712'
  blogger_author: mingster
  blogger_blog: mingstert.blogspot.com
  _oembed_c30151165cd9af0244e369e43b1188f2: "{{unknown}}"
  _blogger_self: https://www.blogger.com/feeds/7772966/posts/default/242591125960790712
  blogger_permalink: "/2009/09/vmware-fusion-remove-bootcamp-partition.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453388130;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:98;}i:1;a:1:{s:2:"id";i:156;}i:2;a:1:{s:2:"id";i:198;}}}}
  original_post_id: '251'
  _wp_old_slug: '251'
author: mingster
---
<p>The boot camp VM is broken because missing files.  How do you redo it all?</p>
<p>It's extremely annoying that one cannot remove the Boot Camp partition entry on the Virtual Machine Library without going through some hoops and jumps...</p>
<p>If you do the following this will stop the Boot Camp partition entry from showing on the Virtual Machine Library...</p>
<p>1. Close Fusion</p>
<p>2. In a Terminal (/Applications/Utilities/Terminal) copy and paste the following command, as is, and then press Enter and type in your password then press Enter.<br /><code><br />sudo mv "/Library/Application Support/VMware Fusion/vmware-rawdiskCreator" "/Library/Application Support/VMware Fusion/vmware-rawdiskCreator.bak"<br /></code></p>
<p>3. Open Fusion and then ctrl-click the Boot Camp partition entry on the Virtual Machine Library and select Delete.</p>
<p>Note: If you have Imported the Boot Camp partition as a normal file based Virtual Machine you could have a Boot Camp partition entry on the Virtual Machine Library that you do not want to delete so before deleting the Boot Camp partition entry on the Virtual Machine Library you can ctrl-click the Boot Camp partition entry on the Virtual Machine Library and select Show in Finder and then make sure this is the one in your "/Users/${USER}/Library/Application Support/VMware Fusion/Virtual Machines/Boot Camp" folder before removing it from the Virtual Machine Library.</p>
<p><span style="font-weight:bold;">To restore the Boot Camp partition entry on the Virtual Machine Library...<br /></span></p>
<p>1. Close Fusion</p>
<p>2. In a Terminal (/Applications/Utilities/Terminal) copy and paste the following command, as is, and then press Enter and type in your password then press Enter.</p>
<p><code>sudo mv "/Library/Application Support/VMware Fusion/vmware-rawdiskCreator.bak" "/Library/Application Support/VMware Fusion/vmware-rawdiskCreator"</code></p>
<p>Reference: <a href="http://communities.vmware.com/thread/200649">http://communities.vmware.com/thread/200649</a></p>
