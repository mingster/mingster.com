---
layout: post
title: Under the Hood of Content Management Systems - Part I – What is a CMS?
date: 2002-02-13 13:42:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev
- My Work
tags:
- development
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2002/02/under-hood-of-content-management.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1447045572;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:16;}i:1;a:1:{s:2:"id";i:135;}i:2;a:1:{s:2:"id";i:10;}}}}
  original_post_id: '202'
  _wp_old_slug: '202'
author: mingster
---
<p>Content Management Systems - these three words can create feelings of elation or frustration in internet professionals depending on their past experiences. Loosely defined, content management systems (CMS for short) are applications designed to make content publishing online easier and/or more structured. In the past several years, the term has been applied to a wide variety of software and database packages offering a wide spectrum of services and functionality.</p>
<p>
<p>Our two-part series of articles is designed to shed some light on CMS - its purposes, functions, broad categories, and current market players. This article begins with the basics, describing the functional components of content management systems. Part one is intended as a primer for people who want to understand how content management systems can help their business.</p>
<p>
<p>In part two, we will cover the broad categories of CMS. We will discuss the differences between enterprise platforms and their smaller competitors. We will also look at low-priced and open-source options. Finally, we will discuss some specific software packages that stand apart in a crowded marketplace.</p>
<p>
<p><b>What is Content Management?</b></p>
<p>
<p>As any web manager can attest, keeping web site content fresh is a tricky business. In many organizations, the individuals that seek to add new content are different than those that create content, who in turn are different than those that put it on the web site. The back-and-forth between owners, contributors, approvers, producers, and web owners can mean real delays in posting timely content, frustration that small changes take forever, and a significant investment of man-hours when multiple people are involved. Compound this with the integration of third parties, such as an interactive agency responsible for content production, and the end result may be a web site that stagnates with a lack of fresh content.</p>
<p>
<p>Content management systems are designed to increase efficiency in content publishing. Some systems are very tactical, making it easier for non-technical users to publish directly to the site (thereby obviating the role of "producer"). Others offer more comprehensive content workflow, making it easier for approvers and owners to be involved. The largest systems provide a comprehensive framework that integrates across the enterprise to deliver content to multiple sources, including a web site.</p>
<p>
<p><b>The Functions</b></p>
<p>
<p>In order to understand what content management systems do, we will describe their functionality starting with the most basic components. We will build on these to demonstrate how more and more robust systems supplement CMS functionality with complex management processes.</p>
<p>
<p>Content publishing - The heart of any CM system is the ability to publish content to a web site or intranet. At its most basic level, this provides users with the tools necessary to input content, view it for quality assurance, and push it live to the site. Typically, this means that a specific type of content is put in a specific place on the site in a specific format. A good example of this is a press release.</p>
<p>
<p>Press releases must be posted very rapidly depending on their nature. The originators of press release content (say, the investor relations group) may not be affiliated with the web group and may not be technically savvy. A simple form-based content publishing tool allows the content originator to use an online form (typically intranet-based with password protection) to input specific content into pre-defined areas. For a press release, these areas might include "title", "byline", and "body content". When users fill out the form and click the submit button, they are presented with a preview of the page. The content is automatically placed in specific areas of the page, formatted with the appropriate fonts, "wrapped" in the correct site design, and located in the correct part of the site architecture. By clicking "approve", the content is pushed live and the process is complete.</p>
<p>
<p>Even simple content publishing tools can have relatively complex technology on the back-end. The system must incorporate functionality to effectively link the site from the site navigation or an index page. In the above example, the "title" field will be used as a link from the press releases page of the site and incorporated dynamically. Many content publishing tools use databases to manage the content. Others will dynamically create "flat files", essentially simple text documents, which are read by the site.</p>
<p>
<p>A key limitation of this type of system is that it applies to specific types of pages that need to be updated frequently, such as press releases, events, and announcement sections of a site, rather than publishing to any page on a site. Full-site publishing (below) addresses this need.</p>
<p>
<p><b>WYSIWYG editing</b></p>
<p>
<p>Many types of software packages exist allowing WYSIWYG (What You See Is What You Get) web page development. Built as fully functional software applications, these tools allow users to build web pages without any real knowledge of HTML. Pages are built using a Microsoft Word- or PowerPoint-style editor, allowing users to format content and imagery on the page.</p>
<p>
<p>Some content management systems offer formatting controls allowing users to modify how content looks on the page. This can be as simple as allowing font choices, color choices, bold/italic/underline, etc. It can be as complex as full WYSIWYG editing allowing robust control for image placement, tables, and forms. Some WYSIWYG suites have incorporated many of the other functional components we describe in this article, turning them into functional CMS applications.</p>
<p>
<p><b>Full-site publishing</b></p>
<p>
<p>More robust systems take this concept of content publishing and extend it to all pages of the site. Essentially, the methodology for this type of system is similar to content publishing (above) with the addition of tools to allow users to access multiple pages across the site. Users typically access a directory tree to find the site area or specific page to modify. All of the modifiable pages are template-based, meaning that they share design templates that dictate content location, image location, etc. Multiple templates can be used for different areas of the site.</p>
<p>
<p><b>Integration of site</b></p>
<p>
<p>Wide CMS tools is serious business. This is best done as the site is being built out for the first time - retrofitting a site to integrate CMS can often mean rethinking how content, imagery, and navigation are used.</p>
<p>
<p><b>Workflow</b></p>
<p>
<p>Once a system is put in place allowing users to add content to a site, a key corporate requirement quickly presents itself: oversight. Workflow processes provide the communication framework allowing system-based approval processes that are critical for effective site management. In many corporations, approval requirements are varied. Even in a simple corporate structure, once a contributor creates new content, it may need to be approved by the content owner, legal, and site administrator. If any one of these approvers asks for revisions, the process must repeat itself. Workflow systems help to make this process efficient and easy. When a contributor submits content, an email is automatically sent to a predetermined approver or group of approvers. The approver reviews the content in the system and can either approve or reject it. If rejected, it is automatically sent back to the contributor with comments. If approved, it moves to the next person in the approval chain, and so on.</p>
<p>
<p>Because these systems are email-based, reviews and approvals can be completed very quickly, reducing the time that manual approvals can take. These systems also provide a documentation trail that many corporations now require for corporate accountability.</p>
<p>
<p><b>Version control</b></p>
<p>
<p>Version control provides a fail-safe mechanism for rolling back versions of content. If content is pushed live that is incorrect, site administrators can use version control systems to immediately go back to a previous version. These systems will often archive content indefinitely, allowing a content trail that can be used for corporate accountability. The biggest benefit of version control is speed. Fixing an error on a page can be as easy as pushing a button. </p>
<p>
<p><b>User Management</b></p>
<p>
<p>In a complex site development environment, system users must have a variety of permissions. These are typically assigned both vertically and horizontally. Vertical permissions define the role that users have as they access the system. A simple role hierarchy might be: </p>
<p>
<p>¨ Author - An Author is permitted to create and modify content. All content modifications by an Author must be approved. </p>
<p>
<p>¨ Editor - An Editor has same permissions as an Author. In addition, an Editor is permitted to approve/deny content modifications from Authors. Editors may be able to promote content to the live environment. </p>
<p>
<p>¨ Administrator - An Administrator has all of the permissions as the above two roles. In addition, Administrators may create/delete/modify users as well as modify template-based content such as navigation. </p>
<p>
<p>Horizontal permissions typically permit users to access different sections of the site. Corporate Communications users, for example, may only be permitted to modify content within the Investor Relations and About Us sections of a site. Corporate Communications users will be a mix of Authors and Editors. Administrators typically have all-site access.</p>
<p>
<p>User management not only defines the permissions that users have, but usually provides the security infrastructure governing site access. This includes password protection and integration with corporate access protocols.</p>
<p>
<p><b>Multiple Combinations</b></p>
<p>
<p>The CMS components described above represent the range of functionality that different systems offer. How individual CMS packages differ is dependant on how these components are combined as well as the scale at which they are offered. Some packages offer all of these functions, but are only capable of working with small sites. Others offer one or two functions targeted at large enterprises.</p>
<p>
<p>In our next edition of Extracts, we will discuss the various categories of CMS platforms as well as highlighting some of the most well-known software packages. If you have any immediate questions about content management, please feel free to contact me at mtsai@extractable.com.</p>
<p></p>
