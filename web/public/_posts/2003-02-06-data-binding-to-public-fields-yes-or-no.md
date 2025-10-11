---
layout: post
title: Data-binding to public fields... yes or no?
date: 2003-02-06 13:35:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev
tags:
- development
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2003/02/data-binding-to-public-fields-yes-or-no.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1446031856;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:253;}i:1;a:1:{s:2:"id";i:121;}i:2;a:1:{s:2:"id";i:31;}}}}
  original_post_id: '202'
  _wp_old_slug: '202'
author: mingster
---
<p>To bind or not to bind to fields? This seems to be a source of constant debate, with folks in both camps. I get a mail roughly every six months in one form or another on this one. Today was that day.</p>
<p>I happen to be in the camp that disagrees that we should support binding to fields, because public fields are not a recommended practice. While they maybe convenient for quick and dirty code, they do not version. Using properties instead allows you to change the access logic, and data storage behind the covers, as well as add validation logic when a value is assigned. Furthermore, accessing properties feels pretty much the same, and do not have any performance overhead. Thankfully we have an FxCop rule to call out public fields as errors. Another reason, why I happen to in the disagree camp is overall consistency within the framework. For example, the property grid does not display fields.</p>
<p>Aside: One of the reasons why data-binding support is limited to properties happens to be the fact that all of data-binding is built around PropertyDescriptors and not on direct reflection. This allows someone to implement ICustomTypeDescriptor to provide a different OM for the purposes of data-binding than the true set of properties present on the CLR type. For example, DataRowView implements ICustomTypeDescriptor to surface its columns as pseudo-properties that are visible to ASP.NET's data-binding infrastructure (such as GridView/DataGrid columns and DataBinder.Eval). Without this, DataRowView would have two properties - DataView and Index (and the second is the only one remotely interesting for data-binding).</p>
<p>The web service proxies generated using wsdl in v1.x however (and unfortunately) generated only fields, and not properties. This is probably the most significant argument in favor of supporting binding to fields. In Whidbey however, this has been finally fixed, and properties are also generated.</p>
<p>I am curious what the general opinion is, and whether there is any chance for consensus on this subject!</p>
<p>I'll take advantage of this opportunity to voice a small gripe I have with C#. I'd really like the language to provide a shortcut for implementing properties where the compiler generates the get/set accessors and underlying private field in much the same way it does for events. For example, when all you want is a simple read/write property:</p>
<p>public property int Count;</p>
<p>and this can then be converted to a full-fledged property without changing the public OM of the type as needed.</p>
