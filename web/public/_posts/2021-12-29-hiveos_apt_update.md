---
layout: post
title: hiveos更新
date: 2021-12-29 23:19:41.000000000 +08:00
type: post
published: true
status: publish
categories:
- IT
tags: hiveos
author: mingster
---

# hiveos更新

```
nohup bash -c 'apt update; export DEBIAN_FRONTEND=noninteractive; apt-get -y --only-upgrade install hive; hello restartminer; screen -S agent -X quit; agent-screen' > /tmp/nohup.log 2>&1 &
```


## Drivers update
```
nvidia-driver-update
```

## Self update
```
selfupgrade
```


# References:

* [Selfupgrade](https://hiveos.farm/troubleshooting-selfupgrade/)
* [Drivers update](https://hiveos.farm/guides-driver_upd/)
* [Linux commands](https://hiveos.farm/guides-linux/)
