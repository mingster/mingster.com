---
layout: post
title: Install OSX Tiger on Intel Boxes - VMWare rocks!
date: 2006-02-11 12:26:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2006/02/install-osx-tiger-on-intel-boxes-vmware.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1456208288;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:563;}i:1;a:1:{s:2:"id";i:255;}i:2;a:1:{s:2:"id";i:968;}}}}
  original_post_id: '54'
  _wp_old_slug: '54'
author: mingster
---
<p>Many of the guides for installing OSX Tiger are complicated and use linux. You can install OSX using public-domain free windows only tools.</p>
<p>If you wish to install OSX tiger to your intel machine or usb drive, you can follow these few steps. Be careful because you can kill your hard drive if you are not careful.</p>
<p>You will need either a seperate hard drive (seperate partition will not do) or an external hard drive. Whatever extra hard drive you use will be completely replaced by osx and you will lose all information on that drive.</p>
<p>1. Authorized users should obtain the OSX files from Apple. It is illegal to obtain them from torrent sites by searching under the following keywords: "VMWare files for patched Mac OS X Tiger Intel"<br />2. Unrar these files to the root of your C: drive<br />3. Download <a href="http://users.erols.com/gmgarner/forensics/forensic%20acquisition%20utilities-bin-1.0.0.1034%20(beta1).zip" target="_blank">Forensic Acquisition Utilities</a><br />4. Unzip these files and copy dd.exe to the root of c: drive as well</p>
<p>Note: the dd.exe program is used to write the image to your spare hard drive or external hard drive. The command is the following:</p>
<p><code>dd if=c:\tiger-x86-flat.img of=\\.\PhysicalDriveSomething</code></p>
<p><span style="font-style:italic;"><br />PhysicalDriveSomething</span> should be replaced with your real physicaldrive (PhysicalDrive1, PhysicalDrive2, etc.). What your hard drives or usb drives are labelled is not always obvious. So I use WMI to figure this out. If you don't need it, don't get it. It's free... and it may prevent you from killing your wrong hard drive.</p>
<p>5. Download <a class="postlink" href="http://www.microsoft.com/downloads/details.aspx?FamilyID=6430f853-1120-48db-8cc5-f2abdc3ed314&amp;DisplayLang=en" target="_blank">WMI Tools from Microsoft</a><br />6. Open <span style="font-weight:bold;">WMI Browser Object </span><br />7. <span style="font-weight:bold;">Allow block content </span>and click the <span style="font-weight:bold;">OK</span>s until it loads<br />8. Select <span style="font-weight:bold;">Win32_SystemPartitions.PartComponent </span>in the left column<br />9. In the right column right-click on the drive device id (Disk #0, Partition #0, etc) and select <span style="font-weight:bold;">Go to Object</span><br />10. The device window will open and click the <span style="font-weight:bold;">associations</span> tab<br />11. Exploring with this tool you should be able to match drive letters (Win32_LogicalDisk.DeviceID="C:") to each physicaldisk reference (Win32_DiskDrive.DeviceID="\\\\.\\PHYSICALDRIVE0")</p>
<p>12. Now that you know the physicaldrive label for your extra internal or external drive, you can drop to the root of your c: drive and run the command. Be sure to replace the physicaldrive text with the physical drive you determined above. If you use the wrong one, you will erase your primary hard drive.</p>
<p>dd if=c:\tiger-x86-flat.img of=\\.\<span style="font-style:italic;">PhysicalDrive</span></p>
<p>13. The command will appear to hang but you will notice your extra harddrive cranking away. It's going to do this for 15min to hours. Just let it run.<br />14. Once it is done, reboot and set the osx drive to your boot drive through your bios.<br />15. If your hardware is compatable, you should boot to OSX.</p>
<p>If you need to debug, I recommend <a class="postlink" href="http://www.concretesurf.co.nz/osx86/index.php" target="_blank">these forums</a>.</p>
<p>This wiki is also excellent:<br /><a class="postlink" href="http://wiki.osx86project.org/wiki/index.php/Main_Page" target="_blank">http://wiki.osx86project.org/wiki/index.php/Main_Page</a></p>
<p><a class="postlink" href="http://www.uneasysilence.com/os-x-proven-hacked-and-running-on-an-ordinary-pc/" target="_blank">UNEASYsilence</a> was one of the first to report on the OSX on intel hack... and is still a good source for updated news on the topic.</p>
