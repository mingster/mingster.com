---
layout: post
title: Accessing Custom Site Templates through the Sharepoint API
date: 2004-08-10 16:10:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev
- IT
- Tech Note
tags:
- development
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2004/08/accessing-custom-site-templates.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453387326;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:167;}i:1;a:1:{s:2:"id";i:345;}i:2;a:1:{s:2:"id";i:253;}}}}
  original_post_id: '202'
  _wp_old_slug: '202'
author: mingster
---
<p>Using custom site templates in Sharepoint is a really powerful feature. You can customize your WSS site through frontpage or the web UI and save the site as a template. By default the template is stored in the top-level site template gallery of the site you customized.</p>
<p>This template can be exported as an ".stp" file and imported on other top-level websites. But you can also place the template in two other locations. The three locations for site templates are:<br />Top-Level (WSS) Site Template Gallery Sharepoint Portal Server Template Gallery Sharepoint Virtual Server TemplatesTo enter the template into the Portal gallery go to <span style="font-family:courier new;color:#993399;">Portal &gt; Site Settings &gt; Manage</span> security and additional settings &gt; Manage site template gallery and upload your ".stp" file (read on to find out why this is useless).</p>
<p>To enter the template into the Virtual Server Templates open the commandline at the directory \Program Files\Common Files\Microsoft Shared\web server extensions\60\BIN and run <span style="font-family:courier new;color:#993399;">stsadm -o addtemplate -filename \sitetemplate.stp -title sitetemplate</span></p>
<p>You can run stsadm -o enumtemplates to verify that your template was added, and you'll also notice that it's been given a name like "_GLOBAL_#1". If you've added a template to the Sharepoint Portal Server Template Gallery (#2 above) you'll notice that this template is not listed when using stsadm.
<ul>
<li>Team Site, STS#0</li>
<li>Blank Site, STS#1</li>
<li>Document Workspace, STS#2</li>
<li>Basic Meeting Workspace, MPS#0</li>
<li>Blank Meeting Workspace, MPS#1</li>
<li>Decision Meeting Workspace, MPS#2</li>
<li>Social Meeting Workspace, MPS#3</li>
<li>Multipage Meeting Workspace, MPS#4</li>
<li>Business Activity Services Team Site, BAS#0</li>
<li>SharePoint Portal Server Site, SPS#0</li>
<li>SharePoint Portal Server Personal Space, SPSPERS#0</li>
<li>SharePoint Portal Server My Site, SPSMSITE#0</li>
<li>Contents area Template, SPSTOC#0</li>
<li>Topic area template, SPSTOPIC#0</li>
<li>News area template, SPSNEWS#0</li>
<li>News Home area template, SPSNHOME#0</li>
<li>Site Directory area template, SPSSITES#0</li>
<li>SharePoint Portal Server BucketWeb Template, SPSBWEB#0</li>
<li>Community area template, SPSCOMMU#0</li>
<li>sitetemplate, _GLOBAL_#1 &lt;- My custom template on the Virtual Server</li>
</ul>
<p>When you look at the Sharepoint SDK for the SPSiteCollection.Add method there is a parameter for sitetemplate. In the example they've used "STS#0", which indicated that the method expects the Name property of the SPWebTemplate, and that it makes a selection from the templates on the virtual server. So if you want to create a site with the template you just deployed with stsadm, specify "_GLOBAL_#1". If you find it uncomfortable to use this generated name a simple mapping can be applied like this:</p>
<p><span style="font-family:courier new;color:#663366;">string template = "My Template Title"; </span><br /><span style="font-family:courier new;color:#663366;">SPGlobalAdmin globalAdmin = new SPGlobalAdmin();</span><br /><span style="font-family:courier new;color:#663366;">SPWebTemplateCollection webTemplates </span><br /><span style="font-family:courier new;color:#663366;">= globalAdmin.VirtualServers[0].GetWebTemplates(lcid);</span><br /><span style="font-family:courier new;color:#663366;">foreach(SPWebTemplate t in webTemplates) </span><br /><span style="font-family:courier new;color:#663366;">if (t.Title.CompareTo(template) == 0) template = t.Name;</span></p>
<p>So what do you specify if you want to apply one of the templates in the Sharepoint Portal Server Template Gallery? After all, it's more user friendly to expose templates here than through the command line interface (if you're not doing complex automated deployments that is). Well by looking in the Gallery UI in Site settings you'll notice that the Name property of the template you've uploaded is TemplateName.stp. Supplying this as a parameter to the SPSiteCollection.Add method will not work. The template won't be found.</p>
<p>The only way to get a hold of these templates are by accessing the SPSite of the portal (either by using context site or creating a new object). You'll find these templates by using the SPSite.GetCustomWebTemplates method. The problem is that SPSite has no way of applying a template other than in the constructor. That leaves you with manipulating the SPSite.RootWeb object after you've created the new SPSite.</p>
<p>But now you've got two different SPSite objects; the portal and the top-level site you just added. Because the templates are stored on the portal SPSite object they cannot be accessed on the top level website. This is because the method SPWeb.ApplyWebTemplate(SPWebTemplate obj) actually is just an overload that reads the SPWebTemplate name property as a string and passes it down to the SPSite object, which in turn looks up in it's own template gallery.</p>
<p>So the conclusion is that for top-level websites you have to deploy your templates using stsadm. Then what's the use of the Sharepoint Portal Server Template Gallery? Beats me. I haven't actually found any of the templates I've added to that list anywhere else than in the SPSite object of the portal root site.</p>
