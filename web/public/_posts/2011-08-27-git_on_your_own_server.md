---
layout: post
title: Git on your own server
date: 2011-08-27 11:00:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
tags: [git]
author: mingster
---

# Git on your own server

1. First, you create a git user account and a .ssh directory for the daemon user.
2. Set up an empty repository for them by running git init with the --bare option, which initializes the repository without a working directory:

	```
	cd /srv/git
	mkdir project.git
	cd project.git
	git init --bare
	```
	
	git should response the following:
	
	<pre>Initialized empty Git repository in /srv/git/project.git/</pre>

3. On end user's computer, he/she can push the first version.

	```
	cd myproject
	git init
	git add .
	git commit -m 'Initial commit'
	git remote add origin git@gitserver:/srv/git/project.git
	git push origin master
	```

4. At this point, the others can clone it down and push changes back up just as easily:

	```
	git clone git@gitserver:/srv/git/project.git
	cd project
	vim README
	git commit -am 'Fix for README file'
	git push origin master
	```


## Security

You can easily restrict the git user account to only Git-related activities with a limited shell tool called git-shell that comes with Git. If you set this as the git user account’s login shell, then that account can’t have normal shell access to your server. To use this, specify git-shell instead of bash or csh for that account’s login shell. To do so, you must first add the full pathname of the git-shell command to /etc/shells if it’s not already there:

```
cat /etc/shells   # see if git-shell is already in there. If not...
which git-shell   # make sure git-shell is installed on your system.
sudo -e /etc/shells  # and add the path to git-shell from last command
```

To change the shell for a user:

```
sudo chsh git -s $(which git-shell)
```

At this point, end users are still able to use SSH port forwarding to access any host the git server is able to reach. If you want to prevent that, you can edit the authorized_keys file and prepend the following options to each key you’d like to restrict:

```
no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty
```

The result should look like this:


```
cat ~/.ssh/authorized_keys
```

```
no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCB007n/ww+ouN4gSLKssMxXnBOvf9LGt4LojG6rs6h PB09j9R/T17/x4lhJA0F3FR1rP6kYBRsWj2aThGw6HXLm9/5zytK6Ztg3RPKK+4kYjh6541N YsnEAZuXz0jTTyAUfrtU3Z5E003C4oxOj6H0rfIF1kKI9MAQLMdpGW1GYEIgS9EzSdfd8AcC IicTDWbqLAcU4UpkaX8KyGlLwsNuuGztobF8m72ALC/nLF6JLtPofwFBlgc+myivO7TCUSBd LQlgMVOFq1I2uPWQOkOWQAHukEOmfjy2jctxSDBQ220ymjaNsHT4kgtZg2AYYgPqdAv8JggJICUvax2T9va5 gsg-keypair

no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDEwENNMomTboYI+LJieaAY16qiXiH3wuvENhBG...
```