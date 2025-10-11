---
layout: post
title: 'RHEL: Drupal install on CentOS5'
date: 2009-09-06 15:12:00.000000000 +08:00
type: post
published: true
status: publish
categories:
- Linux
- Tech Note
tags: []
meta:
  blogger_ca678228220bc856f5131874f02e04d9_permalink: '1475801722667569825'
  blogger_blog: mingstert.blogspot.com
  blogger_author: mingster
  _wpas_skip_yup: '1'
  _edit_last: '40718'
  _wpas_skip_twitter: '1'
  _oembed_61cb3ed483e15fb68e8d8f523da8e823: "{{unknown}}"
  _oembed_0054e268487de8d99429ce0fdb75ce40: "{{unknown}}"
  _oembed_cd8ccd10af6779911269926ddc3095bf: "{{unknown}}"
  _oembed_fdc7e542564d49fa77d220b8ac6c5024: "{{unknown}}"
  _oembed_ed564524d0e5c33e250f8a8494201aba: "{{unknown}}"
  _oembed_8ffc0c7703f5b1ca31fbe42b8b8b1bda: "{{unknown}}"
  _oembed_f5299aa502af28b3a677f0cd73cfe2f3: "{{unknown}}"
  _oembed_92b9246a6274e5a1232c2f373fef23ef: "{{unknown}}"
  _oembed_f49444de49130fcdb8401497a1227d58: "{{unknown}}"
  _oembed_38ff04bea0b2fdd71892613ff22d1388: "{{unknown}}"
  _oembed_38de91ca20dbcce33b36be032276b6e1: "{{unknown}}"
  _oembed_a0454b8bd6353c56d26ead2be410f6bf: "{{unknown}}"
  _oembed_b425e1c9e5bd508adef3a497a04fe780: "{{unknown}}"
  _oembed_c9e126811fc0cd44c4c4d6e44e087a9d: "{{unknown}}"
  _oembed_890a2ceb94caf388a7ac542ba79c13b1: "{{unknown}}"
  _oembed_97890356b05bc6c64e1979076bb0567e: "{{unknown}}"
  _oembed_ba31385cdb5c2789c8b2749892f4f5ae: "{{unknown}}"
  _oembed_a942636dddd8ea8a28a23542355ee3b1: "{{unknown}}"
  _oembed_9b2c8a7ed78fac564528361cc88cd74d: "{{unknown}}"
  _oembed_73c91901c76b9c9a1ccee88cd752fb8f: "{{unknown}}"
  _oembed_343ed79242c49acde95b297aca11db76: "{{unknown}}"
  _oembed_7be5076a12c22fe65311bddcbe844449: "{{unknown}}"
  _oembed_f4b4101e7d6d97bf5e93386ea57a06f8: "{{unknown}}"
  _oembed_ed28091fa7b7bbee940c4144bf0ec7c3: "{{unknown}}"
  _oembed_3879462a33734b075971f1f5397499a3: "{{unknown}}"
  _oembed_62b0ed614ab11cbb45d736892b44e75d: "{{unknown}}"
  _oembed_5724bfc5fe02746b9f8b0998e0081e5b: "{{unknown}}"
  _oembed_09989ebda57cc02fe724a388b933e04c: "{{unknown}}"
  _oembed_f2a24298d7ffd47072c4ae243b426710: "{{unknown}}"
  _oembed_4df554347c51204534c0c9c8ba02d752: "{{unknown}}"
  _oembed_2a2f6f37cdd4615204818641e1e9c291: "{{unknown}}"
  _oembed_20c8c0f7ad3ea102655fe02525b31022: "{{unknown}}"
  _oembed_1032fac7540b49dbeb6e9b294131a7e3: "{{unknown}}"
  _oembed_19333732b1c4e326e6c4754acc51ac8b: "{{unknown}}"
  _oembed_45f514833de5b5ec7809528e360119ac: "{{unknown}}"
  _oembed_3eaaa38b70ff5864f240fedde949f564: "{{unknown}}"
  _oembed_dfd9c44229ba011c95371fb9ebc6b19a: "{{unknown}}"
  _oembed_dde01a17ee1be0b804fa98d913378d57: "{{unknown}}"
  _oembed_56e8d357194e6d7ca70afcff3f9fbcd1: "{{unknown}}"
  _oembed_e1e502ad6832a6b06491aae97beacb53: "{{unknown}}"
  _oembed_437a1b7deaba6dfe528e55197d9db667: "{{unknown}}"
  _oembed_8adf06eb9346e7c8e7e66507b97bfcdf: "{{unknown}}"
  _oembed_5aff9e7f13685a38e9135bb0159ef42e: "{{unknown}}"
  _oembed_1e796570cc05ca535dca3fd9aa0885a9: "{{unknown}}"
  _oembed_53c92518a0899a7a3454b8ed848e3b76: "{{unknown}}"
  _oembed_26754455fdf5cc354d988e20202325d6: "{{unknown}}"
  _oembed_970ab4a28d5369fd9291d1213e76b20a: "{{unknown}}"
  _oembed_d37bafa11367ef2c807bc104570f96f3: "{{unknown}}"
  _oembed_dc3ef8670e293321ca52ebfed2a31baf: "{{unknown}}"
  _oembed_baa44ebf1a5d6298e9930bfcb2985383: "{{unknown}}"
author: mingster
---
<p>PHP 5.3 is not supported on current Drupal (6.14), and CentOS's PHP version is still on 5.1.9. So the drupal installation needs a little bit of work.</p>
<p>1. Install MySQL<br />
<code><br />
wget http://download.fedora.redhat.com/pub/epel/5/i386/epel-release-5-3.noarch.rpm<br />
rpm -ivh epel-release-5-3.noarch.rpm</p>
<p>wget http://rpms.famillecollet.com/enterprise/remi-release-5.rpm<br />
rpm -ivh remi-release-5.rpm</p>
<p>yum --enablerepo=remi install mysql mysql-server<br />
</code><br />
2. Install PHP 5.2.9 from CentOS testing repository:<br />
<code><br />
cd /etc/yum.repos.d<br />
wget http://dev.centos.org/centos/5/CentOS-Testing.repo<br />
yum --enablerepo=c5-testing install php php-devel php-pear php-pecl php-mcrypt php-xml php-xml php-imap php-soap php-mbstring php-mysql php-cli php-mysql<br />
</code><br />
3. drupal clean URL config (sample)<br />
there are many ways to turn on clean URL. Here's how I do it:</p>
<p>AllowOverride All<br />
Options Indexes FollowSymLinks MultiViews<br />
Order allow,deny<br />
Allow from all</p>
<p>RewriteEngine on<br />
RewriteBase /<br />
RewriteCond %{REQUEST_FILENAME} !-f<br />
RewriteCond %{REQUEST_FILENAME} !-d<br />
RewriteRule ^(.*)$ index.php?q=$1 [L,QSA]</p>
<p>Alias /drupal /var/www/drupal</p>
<p>4. PHP.ini</p>
<p>5. GD library<br />
<code><br />
yum --enablerepo=c5-testing install gd gd-devel php-gd<br />
</code></p>
<p>6. Install drupal</p>
