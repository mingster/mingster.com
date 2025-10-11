---
layout: post
title: 'REHL: rsync setup & ssh keys'
date: 2009-09-26 15:30:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Tech Note
tags: []
meta:
  blogger_blog: mingster.blogspot.com
  blogger_author: Ming Tsai
  blogger_eb3191f8b77bf2ac10a5fe54aebee9ae_permalink: '3474391653180365568'
author: mingster
---
<p>Have you ever wanted to know how to easily synchronize the data between multiple servers automatically?</p>
<p>rsync is the anwser. And here's some note. We will use rsync, ssh key authentication, and a cron job.</p>
<p>Let’s call the 2 servers "SOURCESERVER" and "DESTSERVER" for:<br />SOURCESERVER = Source server (the server we’re connecting from to upload the data)<br />DESTSERVER = Destination server (the server we’re connecting to receive the data)</p>
<p><b>Part 1 - Setting up SSH key authentication</b><br />First, we need to make sure the DESTSERVER has the ability to use key authentication enabled. Find your sshd configuration file (usually /etc/ssh/sshd_config) and enable the following options if they are not already set.<br /><code><br />RSAAuthentication yes<br />PubkeyAuthentication yes<br />AuthorizedKeysFile .ssh/authorized_keys</code></p>
<p>If you edit the file be sure to restart sshd afterwards.<br /><code><br />#service sshd restart</code></p>
<p>Next, on the SOURCESERVER we will create the public &amp; private key pair to be used for authentication with the following command:<br /><code><br />ssh-keygen -t dsa<br /></code><br />*Note 1: Do not enter a passphrase for this, just hit enter when prompted.<br />*Note 2: if SOURCESERVER doesn't have key yet, do the keygen as well.</p>
<p>This should create 2 files in ~/.ssh folder, a public key file (id_dsa) and a private key file (id_dsa.pub).</p>
<p>The private key file (~/.ssh/id_dsa) we will keep on the SOURCESERVER.</p>
<p>*Be sure to keep this private key safe. With it anyone will be able to connect to the DESTSERVER that contains the public key.<br /><code><br />chmod 700 ~/.ssh<br />chmod -R 600 ~/.ssh/*</code></p>
<p>Now we will add the public key we created on to the DESTSERVER.<br />Choose the user account which you will use to connect to on DESTSERVER, we'll call this user ‘destuser’ for now.</p>
<p>The public key file (~/.ssh/id_dsa.pub) we will upload to the DESTSERVER, and call it SOURCESERVER.pub.<br /><code><br />scp ~/.ssh/id_dsa.pub DESTUSER@DESTSERVER:~/.ssh/SOURCESERVER.pub</code></p>
<p>On the DESTSERVER, in the DESTUSER's home directory, in the .ssh folder, create a new text file called "authorized_keys". <br /><code>touch ~/.ssh/authorized_keys</code></p>
<p>If it already exists, great, we will use the existing authorized_keys file to add the SOURCESERVER's public key.<br /><code><br />cat ~/.ssh/SOURCESERVER.pub &gt;&gt; ~/.ssh/authorized_keys</code></p>
<p>Be sure the permissions for key files are 600 and 700 for the ‘.ssh’ folder.</p>
<p>Now to test that the keys are working. From the SOURCESERVER try logging in as normal using ssh to the DESTSERVER.<br /><code><br /># ssh destuser@DESTSERVER</code></p>
<p>If all is working you should not be prompted for a password and able to connected directly to a shell on the DESTSERVER.</p>
<p><b>Part 2 - Creating the rsync script</b><br />Now for the rsync script. I use a simple script such as the following<br /><code><br />#!/bin/bash</p>
<p>SOURCEPATH=’/source/directory’<br />DESTPATH=’/destination’<br />DESTHOST=’123.123.123.123′<br />DESTUSER=’destuser’<br />LOGFILE=’rsync.log’</p>
<p>echo $’\n\n’ &gt;&gt; $LOGFILE<br />rsync -av –rsh=ssh $SOURCEPATH $DESTUSER@$DESTHOST:$DESTPATH 2&gt;&amp;1 &gt;&gt; $LOGFILE<br />echo “Completed at: `/bin/date`” &gt;&gt; $LOGFILE<br /></code><br />Copy this file into the home directory of the sourceuser on the SOURCESERVER and modify the first 4 variables in the file.</p>
<p>SOURCEPATH (Source path to be synced)<br />DESTPATH (Destination path to be synced)<br />DESTHOST (Destination IP address or host name)<br />DESTUSER (User on the destination server)</p>
<p>Save it as something like ‘rsync.sh’</p>
<p>Set the permissions on the file to 700.<br /><code># chmod 700 rsync.sh</code></p>
<p>Now you should be able to run the script, have it connect to the DESTSERVER, and transfer the files all without your interaction.</p>
<p>The script will send all output to the ‘rsync.log’ file specified in the script.</p>
<p><b>Part 3 - Setting up the cron job</b></p>
<p>Assuming everything has worked so far all that’s left is to setup a cron job to run the script automatically at a predefined interval.</p>
<p>As the same sourceuser use the ‘crontab’ command to create a new cron job.<br /><code><br /># crontab -e<br /></code><br />This will open an editor where you can schedule the job. Enter the following to have the script run once every hour:<br /><code><br /># Run my rsync script once every hour<br />0 * * * * /path/to/rsync.sh<br /></code><br />Your 2 servers should now be syncing the chosen directory once every hour.</p>
