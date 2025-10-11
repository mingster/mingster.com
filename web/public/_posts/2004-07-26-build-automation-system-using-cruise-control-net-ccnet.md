---
layout: post
title: Build Automation System using Cruise Control .NET (CCNET)
date: 2004-07-26 16:29:50.000000000 +08:00
type: post
published: true
status: publish
categories:
- ".NET"
- dev enviornment
tags: []
meta:
  _wp_old_slug: ''
  _wpas_done_yup: '1'
  _wpas_done_twitter: '1'
  _edit_last: '40718'
  tagazine-media: a:7:{s:7:"primary";s:0:"";s:6:"images";a:0:{}s:6:"videos";a:0:{}s:11:"image_count";s:1:"0";s:6:"author";s:5:"40718";s:7:"blog_id";s:5:"41166";s:9:"mod_stamp";s:19:"2010-07-26
    08:30:33";}
author: mingster
---
<p>In a Team development environment where parallel development and testing goes we find a requirement of getting most recent build to test as well as some specific build to give the QA to do testing on. This post describes what all are needed to set up an automated source code integration and build system for an environment where we use Visual Studio for development, source control (SVN in our case) for source depot, and doc/ tracking system (trac in our case).</p>
<p>Why do we need a continuous source code integration and build system? well, this helps the QA team by allowing then to not spend more time in syncing the source and doing a build everytimes or even working on a relatively older build.  This works as a perfect backup for your Source Control and also the deployment server. This also allows to align the builds numbers to be same as your assembly\file version and also to the source control label there by making a particular build to be a complete unit in itself in terms of readiness for deployment or using the same for development.</p>
<p>Now coming back to build server where we can use cruise control .NET for source integration along with a couple of batch scripts to control the build number and assembly version. CCNET pings the source control (SVN) after every 30 mins (this is a default value and can be changed) to see if there are any modifications. If there are then it triggers a build and publishes it on the Build Server. Once done sleeps again for 30 mins unless it is Forced for a build in between i.e. you can manually force a build in between sleeps.</p>
<p>The core components of build server are:</p>
<p>1) Cruise Control .NET (CCNET):<br />
Its an open source build and integration engine which can be downloaded freely from <a href="http://confluence.public.thoughtworks.org/display/CCNET/DownloadOnce">http://confluence.public.thoughtworks.org/display/CCNET/DownloadOnce</a>. Once the installation is done CCNET needs to be configured according to your requirements.  The config file can be found at “%SYSTEMDRIVE%\Program Files\CruiseControl.NET\Server\ccnet.config”.</p>
<p>2) Batch Scripts:<br />
You might have some tasks to do before the automated build.  In our case, we want to shift the version in every new build. It can be done by altering AssemblyVersion attribute defined in AsseblyInfo.cs file(s). Also you might need to get all the green lights in NUnit testings before you build.  CCNET integrates with NUnit &amp; NAnt nicely for executing test  cases and more powerful automated scripts.</p>
<p>Fpr complete reference on the configuration blocks, check out the project home at <a href="http://ccnet.sourceforge.net/CCNET/">http://ccnet.sourceforge.net/CCNET/</a>.  If you like to do the same on Linux, you might wanna check out <a href="http://www.blogger.com/luntbuild.javaforge.com">luntbuild</a></p>
