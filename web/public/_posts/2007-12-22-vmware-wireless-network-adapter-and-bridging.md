---
layout: post
title: VMware, Wireless Network Adapter and Bridging
date: 2007-12-22 15:59:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
- Tech Note
tags: []
meta:
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '9206777455028451850'
  blogger_author: mingster
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2007/12/vmware-wireless-network-adapter-and.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455253402;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:98;}i:1;a:1:{s:2:"id";i:253;}i:2;a:1:{s:2:"id";i:167;}}}}
  original_post_id: '483'
  _wp_old_slug: '483'
author: mingster
---
<p>If you're using VMware Server on Windows Vista with a Wireless network adapter, you might have problems using native VMware bridged networking. NAT networking works ok to give your guest OS internet access but isn't so good if your guest is a server.</p>
<p>A good alternative is to create a windows MAC bridge between the VMware "virtual" network adapter and your wireless adapter.</p>
<p>And here's how I did it:
<ol>
<li>Using the VMware Network manager to create a new network adapter. Rather than using the existing number 1 and number 8 adapters (used for host only and NAT only respectively), I created a new virtual network card on the VMnet7 slot.</li>
<li>By default, VMware virtual NIC won't allow to take part in a windows MAC bridge unless you modify windows registry as described <a href="http://kb.vmware.com/selfservice/dynamickc.do?cmd=show&amp;forward=nonthreadedKC&amp;docType=kc&amp;externalId=1212&amp;sliceId=2&amp;stateId=0%200%209345265" target="_blank">here</a>.</li>
<li>Do the Net card bridge: On the "Control Panel\Network Connections" screen, hold CTRL key, and select the VMnet7 card and your wireless net card, and right-click to "Create the bridge.</li>
</ol>
<p><span style="font-weight:bold;">The Impact</span><br />After the steps, my guest OS (CentOS5) is able to appeal in my physical network just like a real machine. However the configuration eats up so much resource that my Vista is pretty much un-useable on my almost top-of-line brand new laptop (Acer 4920, TM7500, 2GB RAM) and VMware Server 1.04.</p>
<p>As result, my conclusion is that I rather use NAT mode in the VM in the mid-time until a pure VMware solution comes out.</p>
<p><span style="font-weight:bold;">References</span>
<ul>
<li><a href="http://cs.thefoleyhouse.co.uk/blogs/karl/archive/2007/07/18/vmware-server-v1-0-3-unable-to-bridge-to-wireless-network-on-vista.aspx" target="_blank">Karl Foley's VMware post</a></li>
<li><a href="http://www.abstractpath.com/weblog/2007/06/vmware-wireless-network-adapter-and.html">Abstract path:VMWare, Wireless Network Adapter and Bridging</a></li>
<li><a href="http://kb.vmware.com/selfservice/dynamickc.do?cmd=show&amp;forward=nonthreadedKC&amp;docType=kc&amp;externalId=1212&amp;sliceId=2&amp;stateId=0%200%209345265" target="_blank">VMware KB about Window Network bridge</a></li>
</ul>
