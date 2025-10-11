---
layout: post
title: What Is A Permission, by Keith Brown
date: 2006-04-11 12:44:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- dev
tags:
- development
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2006/01/what-is-permission-by-keith-brown.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1455083257;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:167;}i:1;a:1:{s:2:"id";i:232;}i:2;a:1:{s:2:"id";i:14;}}}}
  original_post_id: '54'
  _wp_old_slug: '54'
author: mingster
---
<p><a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook.WhatIsAPermission">http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook.WhatIsAPermission</a></p>
<p>
<p>Throughout my discussions of access control and ACLs in this book, I will often talk about permissions as numbers. For example, I might talk about <code>0x1FF</code> as being a set of permissions, or granting "permission 1 and 2" to someone. What I'm doing is being very generic and using literal access masks or numbered permissions. I'm not specifying just what types of objects I'm talking about; I'm just talking about how access control works for all different types of objects.</p>
<p>
<p>So let's make this concrete and look at some examples of permissions for some specific types of objects in Windows. Let's start with, oh, a registry key. Peeking at a Win32 header file called <code>winnt.h</code> shows us the following<sup>1</sup>:</p>
<pre> // excerpt from winnt.h<br /> #define KEY_QUERY_VALUE         (0x00000001)<br /> #define KEY_SET_VALUE           (0x00000002)<br /> #define KEY_CREATE_SUB_KEY      (0x00000004)<br /> #define KEY_ENUMERATE_SUB_KEYS  (0x00000008)<br /> #define KEY_NOTIFY              (0x00000010)<br /> #define KEY_CREATE_LINK         (0x00000020)<br /></pre>
<p>
<p>Let's also look at the permission definitions for a thread:</p>
<pre> // excerpt from winnt.h<br /> #define THREAD_TERMINATE               (0x00000001)  <br /> #define THREAD_SUSPEND_RESUME          (0x00000002)  <br /> #define THREAD_GET_CONTEXT             (0x00000008)  <br /> #define THREAD_SET_CONTEXT             (0x00000010)  <br /> #define THREAD_SET_INFORMATION         (0x00000020)  <br /> #define THREAD_QUERY_INFORMATION       (0x00000040)  <br /> #define THREAD_SET_THREAD_TOKEN        (0x00000080)<br /> #define THREAD_IMPERSONATE             (0x00000100)<br /> #define THREAD_DIRECT_IMPERSONATION    (0x00000200)<br /></pre>
<p>
<p>If you wanted to grant <code>Alice</code> permission to create a new registry key under some existing key, you'd edit the existing key's DACL and add an ACE ( <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/WhatIsAnAccessControlList.html">What Is An Access Control List</a> ) that grants <code>Alice</code> the KEY_CREATE_SUB_KEY permission. Pretty simple. But look at those permissions again and tell me how you'd grant Alice the permission to delete the key she just created!</p>
<p>
<p>That's right, the registry subsystem doesn't bother defining a permission for deleting a key. That's because it's such a common permission (most secure objects can be deleted) that it's included as part of a standard set of permissions that are common across all types of objects. Here are the standard permissions that are allowed to be put in an ACL:</p>
<pre> // excerpt from winnt.h<br /> #define DELETE           (0x00010000L)<br /> #define READ_CONTROL     (0x00020000L)<br /> #define WRITE_DAC        (0x00040000L)<br /> #define WRITE_OWNER      (0x00080000L)<br /> #define SYNCHRONIZE      (0x00100000L)<br /></pre>
<p>
<p>Compare the numerical layout of the standard permissions to the specific permissions defined for registry keys. Note how the standard permissions all fall in the upper word of the 32 bit mask, while the specific permissions are defined in the lower word. Notice the same technique is used for the thread permissions. You see, each class of object is allowed to define up to 16 specific permissions, and they must all be in that lower word, so they don't conflict with permissions Microsoft has already defined for all objects, such as the standard permissions shown above.</p>
<p>
<p>The standard permissions are really quite straightforward. Let me briefly explain what they mean. <code>READ_CONTROL</code> ("Read Permissions") controls whether you can read the owner and DACL in the object's security descriptor. If you don't have this permission, you're not even allowed to see what permissions you do have! <code>WRITE_DAC</code> ("Write Permissions") and <code>WRITE_OWNER</code> ("Take Ownership") say whether you're allowed to change the object's DACL or take ownership of the object by changing the owner SID to be your own SID (for more detail, see <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/WhatIsOwnership.html">What Is Ownership</a> ). <code>SYNCHRONIZE</code> says whether you can wait on an object (this is most often used with synchronization objects such as a mutex or semaphore). By limiting SYNCHRONIZE access, you can prevent an untrusted user from grabbing a mutex that your program depends on and deadlocking you. And <code>DELETE</code> is pretty obvious.</p>
<p>
<p>Let's say you want to grant <code>Alice</code> permission to read a registry key. It'd make sense to grant her a combination of the following: </p>
<p>
<ul>
<li>KEY_QUERY_VALUE </li>
<li>KEY_ENUMERATE_SUB_KEYS </li>
<li>KEY_NOTIFY </li>
<li>READ_CONTROL </li>
</ul>
<p>
<p>If you binary OR these values together, you'll end up with <code>0x00020019</code>. This would be the access mask you'd put into the ACE ( <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/WhatIsAnAccessControlList.html">What Is An Access Control List</a> ) to grant <code>Alice</code> read access to the key. For an example of code that modifies an ACL programmatically, check out <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/HowToProgramACLs.html">How To Program ACLs</a> .</p>
<p>
<p>Look at the following access mask and try to figure out what it means: <code>0x00130000</code>. The answer is in the following footnote<sup>2</sup>. Now try to decode this one: <code>0x00000001</code>. Surely this one is easier! Oh wait, I didn't tell you what type of object we're talking about. I mean, if it were a registry key, this would be <code>KEY_QUERY_VALUE</code> -a fairly benign permission to grant, at least compared to <code>THREAD_TERMINATE</code>! You see, given a random permission mask, you really can't tell what it means unless you know the type of object to which it applies, unless it simply consists of standard permissions, which are defined centrally for all objects.</p>
<p>
<p>With this in mind, think about a permission mask that would be generic enough to grant read permission to any type of object in the system, including registry keys and threads. For a registry key, we'd want <code>0x00020019</code>, as we calculated earlier for <code>Alice</code>. But for a thread, it'd be <code>0x00020048</code>. That's a very different mask. As you can see, because no two types of objects can be expected to have the same sorts of permissions, at first glance it'd be impossible to treat objects polymorphically with respect to permissions. But if you look a bit further into <code><strong>winnt.h</strong></code>, you'll find the following rather interesting definitions:</p>
<pre> // excerpt from winnt.h<br /> #define GENERIC_READ      (0x80000000L)<br /> #define GENERIC_WRITE     (0x40000000L)<br /> #define GENERIC_EXECUTE   (0x20000000L)<br /> #define GENERIC_ALL       (0x10000000L)<br /></pre>
<p>
<p>What do you think would happen if you added an ACE to a registry key's DACL that granted <code>Alice</code> <code>GENERIC_READ</code>? Think about it for a moment. If you guessed that the system would convert the access mask from <code>0x80000000</code> to <code>0x00020019</code> before storing the new DACL in the metadata for the registry key, then you'd be correct. You see, each class of object in Windows defines a mapping from these four generic permissions onto standard and specific permissions. This allows us to make statements like, "By default, I'd like to grant full control to <code>SYSTEM</code> and myself for any object I create. Oh and I'd also like <code>Alice</code> to have read access as well." Here's a text representation of just such a DACL:</p>
<pre> grant SYSTEM 0x10000000<br /> grant Keith  0x10000000<br /> grant Alice  0x80000000<br /></pre>
<p>
<p>It turns out that Windows makes a statement like this for every process! You see, inside the token ( <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/WhatIsAToken.html">What Is A Token</a> ) is a default owner and DACL that are used whenever you create new objects<sup>3</sup>. For example, if you were to create a thread, how would the system know what the DACL for that thread should look like? Well, it looks at this default DACL that's tucked away inside your token.</p>
<p>
<p>Here's what a default DACL would look like for me on my laptop<sup>4</sup>:</p>
<pre> grant SYSTEM 0x10000000<br /> grant Keith  0x10000000<br /></pre>
<p>
<p>So by default, any new threads that I create, or semaphores, shared memory sections and so on, start life with DACLs that specifically grant my account and <code>SYSTEM</code> full control. Nobody else will be able to touch the objects I create, barring specially privileged users such as administrators ( <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/WhatIsAPrivilege.html">What Is A Privilege</a> ). Note that hierarchical systems like the file system and registry instead use ACL inheritance to come up with a default DACL; this ensures that permissions remain consistent through the branches of the hierarchy. See <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/WhatIsACLInheritance.html">What Is ACL Inheritance</a> for the details.</p>
<p>
<p>The default DACL is one of the few mutable bits of data in a token. In most cases you shouldn't ever need to change this DACL, as it's already about as tightly secured as it can be. If you ever find the need to adjust it, you'll want to look at the Win32 function <code>SetTokenInformation</code>.</p>
<p>
<div class="Rule"></div>
<p>
<ol>
<li>I've omitted three permissions that are specific to 64-bit Windows for brevity. </li>
<li><code>DELETE</code>, <code>READ_CONTROL</code>, and <code>SYNCHRONIZE</code>. </li>
<li>By "objects" I mean any object that has a security descriptor ( <a href="http://www.pluralsight.com/wiki/default.aspx/Keith.GuideBook/WhatIsASecurityDescriptor.html">What Is A Security Descriptor</a> ), such as a process, thread, mutex, etc. </li>
<li>If you want to do this experiment, you should download the Token Dump component from my website. I don't know of any built-in tool that shows this information. </li>
</ol>
