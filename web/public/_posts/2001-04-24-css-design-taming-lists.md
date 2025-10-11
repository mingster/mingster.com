---
layout: post
title: 'CSS Design: Taming Lists'
date: 2001-04-24 11:21:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
- Usability
tags: []
meta:
  blogger_blog: mingstert.blogspot.com
  blogger_permalink: "/2001/04/css-design-taming-lists.html"
  _jetpack_related_posts_cache: a:1:{s:32:"8f6677c9d6b0f903e98ad32ec61f8deb";a:2:{s:7:"expires";i:1453409484;s:7:"payload";a:3:{i:0;a:1:{s:2:"id";i:15;}i:1;a:1:{s:2:"id";i:103;}i:2;a:1:{s:2:"id";i:96;}}}}
  original_post_id: '202'
  _wp_old_slug: '202'
author: mingster
---
<p>As early as July of 1999 I was pontificating on email lists about the virtues of style sheets. Some things never change. </p>
<p>What <em>has</em> changed is how I think about CSS, and the underlying structure of (X)HTML to which it is applied. For example, I find that most pages on the web contain a menu of links in a navigation area. These are often marked up as a string of links, often in separate DIVs or paragraphs. Structurally, however, they are a list of links, and should be marked up as such. </p>
<p>Of course the reason that we don’t mark them up in that way is that we don’t want a bullet in front of every link in our navigation area. In this article, I'll demonstrate how to use CSS to bring unwieldy lists under control. It’s time for you to tell lists how to behave, instead of letting them run wild on your web page. </p>
<p>
<h3>Setting the stage</h3>
<p>For purposes of this article, I am using unordered lists. The same CSS can be applied, with similar results, to ordered lists as well. Unless otherwise defined, all of the examples in this article use the following code for the lists.</p>
<pre>&lt;ul&gt;<br /> &lt;li&gt;Item 1&lt;/li&gt;<br /> &lt;li&gt;Item 2&lt;/li&gt;<br /> &lt;li&gt;Item 3&lt;/li&gt;<br /> &lt;li&gt;Item 4&lt;/li&gt;<br /> &lt;li&gt;Item 5 we'll make a bit longer so<br />     that it will wrap&lt;/li&gt;<br />&lt;/ul&gt;<br /></pre>
<p>
<p>Each list is simply placed inside a different DIV, and the CSS is written so that the list’s behavior is determined by the DIV it is in. Each DIV has a base rule: </p>
<pre>#base {<br /> border: 1px solid #000;<br /> margin: 2em;<br /> width: 10em;<br /> padding: 5px;<br /> }<br /></pre>
<p>
<p>Without any additional styles applied, the list is rendered in this way in the base DIV: </p>
<div id="base">
<ul />
<li>Item 1
<li>Item 2
<li>Item 3
<li>Item 4
<li>Item 5 we'll make a bit longer so that it will wrap </li>
</li>
</li>
</li>
</li>
</div>
<p>
<h3>Positioning</h3>
<p>
<p>Sometimes the default indent of a list is too much for the design you are working on. But simply changing the margin <em>or</em> the padding of the UL doesn’t work for all browsers. To make the list flush left, e.g., you need to change <em>both</em> the margin and the padding. This is because Internet Explorer and Opera opted to create the indent with the left margin, while Mozilla/Netscape use padding. For more on this see the DevEdge article <a title="By Eric Meyer" href="http://devedge.netscape.com/viewsource/2002/list-indent/" target="_blank">Consistent List Indentation</a>. </p>
<p>
<p>In the following example both the <code>margin-left</code> and <code>padding-left</code> of the UL in the DIV are set to zero: </p>
<p>
<div id="zero">
<ul />
<li>Item 1
<li>Item 2
<li>Item 3
<li>Item 4
<li>Item 5 we'll make a bit longer so that it will wrap </li>
</li>
</li>
</li>
</li>
</div>
<p>
<p>Note that the markers lie outside of the DIV. If the containing box were the BODY of the HTML document, the markers might be rendered outside of the browser window, in effect vanishing. If you want the markers to line up inside the DIV, but along its left side, set either the left padding or margin to one em: </p>
<div id="one-em">
<ul />
<li>Item 1
<li>Item 2
<li>Item 3
<li>Item 4
<li>Item 5 we'll make a bit longer so that it will wrap </li>
</li>
</li>
</li>
</li>
</div>
<p>
<h3>Markers</h3>
<p>
<p>Maybe you've had a project that required a custom bullet. If so you might have marked it up in a table with one column containing the GIF image bullets aligned top and right, and the other column containing the content of what should have been LIs. With CSS it is possible to use an image as a bullet. If the browser doesn’t support this part of CSS (or doesn’t do images), the default bullet will be used (or you can specify a different HTML bullet if you wish).</p>
<p>The rule looks something like this: </p>
<pre>ul {<br /> list-style-image: url(bullet.gif);<br /> }<br /></pre>
<p>
<p>And the browser renders it:</p>
<div id="bullet">
<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
<li>Item 4</li>
<li>Item 5 we'll make a bit longer so that it will wrap </li>
</ul>
</div>
<p>
<p>To specify an HTML bullet to use if the browser doesn’t support this part of CSS, add: </p>
<pre> list-style-type: disc;<br /></pre>
<p>
<p>to your rule. Depending on the image that you choose you may find that it doesn’t align itself with the list items the way that you intend. In that case you may choose to have the image be placed within the list item block (rather than outside the block). Adding the following: </p>
<pre> list-style-position: inside;<br /></pre>
<p>
<p>to your rule will make that change. These three declarations can be combined into a single, shorthand declaration as illustrated in the following rule: </p>
<pre>ul {<br /> list-style: disc url(bullet.gif) inside;<br /> }<br /></pre>
<p>
<p>which is the equivalent of: </p>
<pre>ul {<br /> list-style-type: disc;<br /> list-style-image: url(bullet.gif);<br /> list-style-position: inside;<br /> }<br /></pre>
<p>
<p>This is what it looks like in the web page: </p>
<div id="bullet-inside">
<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
<li>Item 4</li>
<li>Item 5 we'll make a bit longer so that it will wrap </li>
</ul>
</div>
<p>There may be times when you have a list, but you don’t want any bullets, or you want to use some other character in place of the bullet. Again, CSS provides a straightforward solution. Simply add <code>list-style: none;</code> to your rule and force the LIs to display with hanging indents. The rule will look something like this: </p>
<pre>ul {<br /> list-style: none;<br /> margin-left: 0;<br /> padding-left: 1em;<br /> text-indent: -1em;<br /> }<br /></pre>
<p>
<p>Either the padding or the margin needs to be set to zero, with the other one set to 1em. Depending on the “bullet” that you choose, you may need to modify this value. The negative <code>text-indent</code> causes the first line to be moved to the left by that amount, creating a hanging indent. </p>
<p>The HTML will contain our standard UL, but with whatever character or HTML entity that you want to use in place of the bullet preceding the content of the list item. In our case we'll be using <code>&#187;</code>, the right double angle quote: ».</p>
<div id="custom">
<ul>
<li>» Item 1</li>
<li>» Item 2</li>
<li>» Item 3</li>
<li>» Item 4</li>
<li>» Item 5 we'll make a bit longer so that it will wrap </li>
</ul>
</div>
<p>
<p>I should point out that Netscape6/7/Mozilla (and other Gecko-based browsers) and Opera can create <a title="Read more about generated content at w3.org" href="http://www.w3.org/TR/REC-CSS2/generate.html" target="_blank">generated content</a> via the CSS2 <code>:before</code> pseudo-element. We can take advantage of this to automatically generate the » character (or any other character) for the bullets. This allows us to leave the content of the UL alone. If you are using Opera or a Gecko-based browser, the following CSS will create the same list as above, but using the standard UL with no extra content: </p>
<pre>#custom-gen ul li:before {<br /> content: "0BB 020";<br /> }<br /></pre>
<p>
<p>The <code>content</code> property may contain strings, URIs and more, including special characters. When using these characters, like », it is <a title="Read more at w3.org" href="http://www.w3.org/TR/REC-CSS2/syndata.html#escaped-characters" target="_blank">necessary to encode them</a> as their escaped <a title="hex and html# codes for ascii characters" href="http://www.ascii.cl/htmlcodes.htm" target="_blank">HEX equivalents</a>. For the right double angle quote, we use 0BB (the other character, 020, is a space). The final result (remember, the character will only be visible in Opera or Mozilla/Netscape): </p>
<div id="custom-gen">
<ul />
<li>Item 1
<li>Item 2
<li>Item 3
<li>Item 4
<li>Item 5 we'll make a bit longer so that it will wrap </li>
</li>
</li>
</li>
</li>
</div>
<p>
<h3>Truly inline lists</h3>
<p>
<p>Who says a list needs to be vertically aligned with bullets hanging off the left side of each item? Perhaps you want the structure of an ordered list of links, but visually you want it to look like a vertical navigation bar on the web page. Or maybe you want your list of links to align themselves horizontally across the top of your page.</p>
<p>This applies to more than just lists of links. There are times when you might need to list several items in the midst of a paragraph, maybe a list of books that you want to read. Structurally it makes sense to mark this up as a list, but presentationally you might not want break the flow of the paragraph. CSS to the rescue again! </p>
<p>Since this list will not be separate and unto itself, I won’t put it into the base DIV that the previous lists have inhabited. This time the markup will be a paragraph, followed by the same list, followed by another paragraph. </p>
<p>I hear you crying,“FOUL! I thought you were going to put a list <em>inside</em> of a paragraph, not <em>between</em> two paragraphs.” </p>
<p>To which I reply,“Well, yes. But (X)HTML does not allow a list to appear inside of a paragraph. However, with the help of our style sheet, that is how it will look in the web page.” </p>
<p>Here’s what the styles look like: </p>
<pre>#inline-list {<br /> border: 1px solid #000;<br /> margin: 2em;<br /> width: 80%;<br /> padding: 5px;<br /> font-family: Verdana, sans-serif;<br /> }<br /><br />#inline-list p {<br /> display: inline;<br /> }<br /><br />#inline-list ul, #inline-list li {<br /> display: inline;<br /> margin: 0;<br /> padding: 0;<br /> color: #339;<br /> font-weight: bold;<br /> }<br /></pre>
<p>
<p>The markup consists of a <code>&lt;div id="inline-list"&gt;</code>. This DIV contains a paragraph followed by our standard UL, and a followup paragraph. The UL list has been modified so that each list item has a comma after it, with the last item followed by a period. </p>
<p>
<p>The results are below (list appears bold and blue): </p>
<div id="inline-list">
<p>A bit of text before the list appears. Perhaps the context is something about a husband getting a call from his wife to pick up a few things on the way home from work. It doesn’t really matter, for our purposes we just need some preceding text before the list:</p>
<ul />
<li><span style="color:#333399;"><strong>Item 1, </strong></span>
<li><span style="color:#333399;"><strong>Item 2, </strong></span>
<li><span style="color:#333399;"><strong>Item 3, </strong></span>
<li><span style="color:#333399;"><strong>Item 4, </strong></span>
<li><strong><span style="color:#333399;">Item 5 we'll make a bit longer so that it will wrap. </span></strong></li>
<p>And then there is the text that follows the list in the paragraph. One or two sentences is sufficient for the example.</p>
</li>
</li>
</li>
</li>
</div>
<p>As in the custom bullet example above, we could use CSS to automatically generate the commas and period that follow each list item. If all you had to worry about were Opera and Gecko powered browsers, that is. This time the styles would look like: </p>
<pre>#inline-list-gen ul li:after {<br /> content: ", ";<br /> }<br />  <br />#inline-list-gen ul li.last:after {<br /> content: ". ";<br /> }<br /></pre>
<p>
<p>Here we use the <code>:after</code> pseudo-element to add a comma after each list item, and a period after a list item with <code>class="last"</code>, resulting in the following (remember, it will only be visible in Opera or Mozilla/Netscape): </p>
<div id="inline-list-gen">
<p>A bit of text before the list appears. Perhaps the context is something about a husband getting a call from his wife to pick up a few things on the way home from work. It doesn’t really matter, for our purposes we just need some preceding text before the list:</p>
<ul />
<li><span style="color:#333399;"><strong>Item 1 </strong></span>
<li><span style="color:#333399;"><strong>Item 2 </strong></span>
<li><span style="color:#333399;"><strong>Item 3 </strong></span>
<li><span style="color:#333399;"><strong>Item 4 </strong></span>
<li class="last"><strong><span style="color:#333399;">Item 5 we'll make a bit longer so that it will wrap </span></strong></li>
<p>
<p>And then there is the text that follows the list in the paragraph. One or two sentences is sufficient for the example.</p>
</li>
</li>
</li>
</li>
</div>
<h3>Navigation</h3>
<p>As I mentioned previously, the menus of links that appear on nearly every site should really be marked up as lists, since that is what they are. Since we usually don’t want the default list style to apply to these links, we can use CSS to change the way they appear on the page. As we saw above, lists can be forced to display horizontally (inline) rather than stacked vertically (the default behavior). When you do this the bullet goes away and you have many choices about how to separate the list items. </p>
<p>These examples of horizontal lists will all use the same base DIV with the following styles: </p>
<pre>#h-contain {<br /> padding: 5px;<br /> border: 1px solid #000;<br /> margin-bottom: 25px;<br /> }<br /></pre>
<p>
<p>The next two examples use the same UL as in the previous examples, but without the final list item with its extra text. They also include an additional class that sets apart one of the LIs in the list. </p>
<h4>Borders</h4>
<p>A pipe character, , is often used to differentiate between choices. It is an obvious separating character, and can be emulated by adding borders to list items: </p>
<pre>#pipe ul {<br /> margin-left: 0;<br /> padding-left: 0;<br /> display: inline;<br /> }<br /><br />#pipe ul li {<br /> margin-left: 0;<br /> padding: 3px 15px;<br /> border-left: 1px solid #000;<br /> list-style: none;<br /> display: inline;<br /> }<br /> <br />#pipe ul li.first {<br /> margin-left: 0;<br /> border-left: none;<br /> list-style: none;<br /> display: inline;<br /> }<br />Here we add <code>class="first"</code> to the first LI so that it does not end up with a border on its left side. </pre>
<p>
<div id="pipe">
<ul />
<li class="first">Item 1
<li>Item 2
<li>Item 3
<li>Item 4 </li>
</li>
</li>
</li>
</div>
<p>
<p>You can modify these styles to create a tabbed navigation effect: </p>
<pre>#tabs ul {<br /> margin-left: 0;<br /> padding-left: 0;<br /> display: inline;<br /> }<br /><br />#tabs ul li {<br /> margin-left: 0;<br /> margin-bottom: 0;<br /> padding: 2px 15px 5px;<br /> border: 1px solid #000;<br /> list-style: none;<br /> display: inline;<br /> }<br /> <br />  <br />#tabs ul li.here {<br /> border-bottom: 1px solid #ffc;<br /> list-style: none;<br /> display: inline;<br /> }<br /></pre>
<p>
<div id="tabs">
<ul />
<li>Item 1
<li>Item 2
<li class="here">Item 3
<li>Item 4 </li>
</li>
</li>
</li>
</div>
<p>
<p>In this example adding <code>class="here"</code> to an LI creates a bottom border that matches the background color to indicate that the tab refers to the current page. </p>
<p>
<p>Note: This technique was first proffered by <a title="Randal’s site" href="http://www.r2communications.com/" target="_blank">Randal Rust</a>, and then <a title="The thread split a few times. These links from the archive ought to get you started." href="http://archivist.incutio.com/css-discuss/?search=tabbed+menu" target="_blank">riffed on</a> by many on the <a title="An excellent, if not high-volume (50+ messages/day) list." href="http://three.pairlist.net/mailman/listinfo/css-discuss" target="_blank">css-discuss</a> email list </p>
<p>
<h3>Breadcrumb trails</h3>
<p>
<p>Another list of links that typically has a horizontal orientation on a web page is what has become known as breadcrumbing. Breadcrumbs show you where you are in the hierarchy of a site, starting with the home page and drilling down to the current section or page. If you really want to make the markup meaningful, you would want to create a series of nested lists, since each new section is part of the section before it: </p>
<pre>&lt;div id="bread"&gt;<br />&lt;ul&gt;<br /> &lt;li class="first"&gt;Home<br /> &lt;ul&gt;<br />  &lt;li&gt;&#187; Products<br />  &lt;ul&gt;<br />   &lt;li&gt;&#187; Computers<br />   &lt;ul&gt;<br />    &lt;li&gt;&#187; Software&lt;/li&gt;<br />   &lt;/ul&gt;&lt;/li&gt;<br />  &lt;/ul&gt;&lt;/li&gt;<br /> &lt;/ul&gt;&lt;/li&gt;<br />&lt;/ul&gt;<br />&lt;/div&gt;<br /></pre>
<p>
<p>creates the following: </p>
<p>
<div id="bread-sample">
<ul />
<li>Home
<ul />
<li>» Products
<ul />
<li>» Computers
<ul />
<li>» Software </li>
</li>
</li>
</li>
</div>
<p>
<p>Adding the following rules to the style sheet for the page: </p>
<pre>#bread {<br /> color: #ccc;<br /> background-color: #006;<br /> padding: 3px;<br /> margin-bottom: 25px;<br /> }<br /><br />#bread ul {<br /> margin-left: 0;<br /> padding-left: 0;<br /> display: inline;<br /> border: none;<br /> }<br /><br />#bread ul li {<br /> margin-left: 0;<br /> padding-left: 2px;<br /> border: none;<br /> list-style: none;<br /> display: inline;<br /> }<br /></pre>
<p>
<p>creates this: </p>
<p>
<div id="bread">
<ul />
<li>Home
<ul />
<li>» Products
<ul />
<li>» Computers
<ul />
<li>» Software </li>
</li>
</li>
</li>
</div>
<p>
<p>Again, we can generate the » character (or any other character you might want to use as a separator) with the <code>:before</code> pseudo-element, combined with a class="first" so that the first LI doesn’t generate a separator: </p>
<pre>#bread-gen ul li:before {<br /> content: "020 020 020 0BB 020";<br /> color: #ff9;<br /> }<br /> <br />#bread-gen ul li.first:before {<br /> content: " ";<br /> }<br /></pre>
<p>
<p>And the end result: </p>
<p>
<div id="bread-gen">
<ul />
<li class="first">Home
<ul />
<li>Products
<ul />
<li>Computers
<ul />
<li>Software </li>
</li>
</li>
</li>
</div>
<h3>In the Real World</h3>
<p>
<p>I'd like to end with a real world application of some of the techniques that have been discussed here. We'll use a standard UL containing links to create a dynamic menu with hover effects. In order to obtain the hover effects we'll let the UL provide the structure, and the anchor styles will provide most of the visual effects. </p>
<p>
<div id="button">
<ul />
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">Home</a>
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">Hidden Cameras</a>
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">CCTV Cameras</a>
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">Employee Theft</a>
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">Helpful Hints</a>
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">F.A.Q</a>
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">About Us</a>
<li><a href="http://www.blogger.com/post-create.g?blogID=7772966#" target="_blank">Contact Us</a> </li>
</li>
</li>
</li>
</li>
</li>
</li>
</li>
</div>
<p>
<p>This menu of links is actually a solution to a question posed by <a title="Michael’s web site" href="http://www.michaelefford.com.au/" target="_blank">Michael Efford</a> on the css-discuss list. Michael had created this exact <a title="The Asset Surveilance site as originally designed." href="http://assetsurveillance.com.au/test_site/" target="_blank">effect using a table, images, and JavaScript</a>. He <a title="Archive of the post in which the question was asked" href="http://archivist.incutio.com/css-discuss/?id=12237" target="_blank">asked the list</a> if it could be done with CSS. I took the challenge, and with the help of several other members who tracked down some browser specific issues, we came up with a style sheet that works on this markup: </p>
<pre>&lt;div id="button"&gt;<br />&lt;ul&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;Home&lt;/a&gt;&lt;/li&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;Hidden Cameras&lt;/a&gt;&lt;/li&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;CCTV Cameras&lt;/a&gt;&lt;/li&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;Employee Theft&lt;/a&gt;&lt;/li&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;Helpful Hints&lt;/a&gt;&lt;/li&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;F.A.Q&lt;/a&gt;&lt;/li&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;About Us&lt;/a&gt;&lt;/li&gt;<br /> &lt;li&gt;&lt;a href="#"&gt;Contact Us&lt;/a&gt;&lt;/li&gt;<br />&lt;/ul&gt;<br />&lt;/div&gt;<br /></pre>
<p>
<p>Let’s look at the style sheet rule by rule, and I'll explain why each rule is constructed the way that it is. </p>
<pre>#button {<br /> width: 12em;<br /> border-right: 1px solid #000;<br /> padding: 0 0 1em 0;<br /> margin-bottom: 1em;<br /> font-family: 'Trebuchet MS', 'Lucida Grande',<br />   Verdana, Lucida, Geneva, Helvetica,<br />   Arial, sans-serif;<br /> background-color: #90bade;<br /> color: #333;<br /> }<br /></pre>
<p>
<p>The first rule is for the <code>#button</code> DIV. It defines the space that the menu will occupy, and provides a context for the menu so that we can define the way the list and links will behave inside the DIV. I chose to make the menu fluid, based on the browser’s font size preferences, so (almost) all units are in ems. This includes the width of the menu. The solid black border on the right was based on the original design from Michael. The bottom padding is there to extend the DIV down beyond the menu of links so that you can see the background of the DIV. Again, this follows the original design. The bottom margin is to separate the DIV from what follows it. The colors came from the original design. </p>
<pre> #button ul {<br />  list-style: none;<br />  margin: 0;<br />  padding: 0;<br />  border: none;<br />  }<br />  <br /> #button li {<br />  border-bottom: 1px solid #90bade;<br />  margin: 0;<br />  }<br /></pre>
<p>
<p>Next I defined what the list will look like. Since all the list items were to be links, and the rollover functionality would be built into the CSS for the links, I essentially removed all styling from the lists. I did add a single pixel border on the bottom of each link that matched the background of the <code>#button</code> DIV, to work as the separator. In the original design, this was an image. </p>
<pre> #button li a {<br />  display: block;<br />  padding: 5px 5px 5px 0.5em;<br />  border-left: 10px solid #1958b7;<br />  border-right: 10px solid #508fc4;<br />  background-color: #2175bc;<br />  color: #fff;<br />  text-decoration: none;<br />  width: 100%;<br />  }<br /><br /> html&gt;body #button li a {<br />  width: auto;<br />  }<br /><br /> #button li a:hover {<br />  border-left: 10px solid #1c64d1;<br />  border-right: 10px solid #5ba3e0;<br />  background-color: #2586d7;<br />  color: #fff;<br />  }<br /></pre>
<p>
<p>Finally, I defined the links. The original design has 10 pixel borders on the right and left. These borders, along with the background, change color on the rollover. This is a relatively simple thing to control with the <code>:hover</code> pseudo-class in CSS, so I put this style into the anchor styles. </p>
<p>
<p>There is one workaround in this part of the style sheet. To make the links active for the full width of the DIV, I made them <code>display: block;</code>. This works for everything but IE/Windows. If you give the block an explicit width of 100%, then IE/Windows plays along. But doing this creates problems with IE5/Mac and Netscape/Mozilla. So I used the child selector“&gt;” to redefine the width to auto. Since IE/Windows doesn’t understand child selectors, it ignores the rule. IE5/Mac, Opera and Netscape/Mozilla follow the rule, and everyone is happy. </p>
<p>
<p>The rule for the <code>:hover</code> pseudo-class creates the color changes on the backgrounds and borders when the links are moused over. </p>
<p>
<p>The style and list markup (about 1K worth) replaced about 5K of JavaScript and TABLE markup, not to mention another 8K or so of images for the rollover effects. It also made the markup more readable, and easier to update, since you no longer need to create new images if a link name changes. Now you simply modify some text.</p>
<p>
<h3>Tip of the Iceberg</h3>
<p>
<p>Believe it or not, we have just scratched the surface of what can be done to modify lists with style sheets. I won’t claim that all of the techniques presented here are the most practical CSS that you'll come across, but I do hope they make you think about how using CSS can release you to use more structured markup.</p>
