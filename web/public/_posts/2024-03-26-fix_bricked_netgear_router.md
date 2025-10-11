# Fix bricked Netgear router from macos

1. install [nmrpflash - Netgear Unbrick Utility](https://github.com/jclehner/nmrpflash)

``` bash
brew install nmrpflash
```

1. download Netgear firmware

1. upload the stock firmware

``` bash
nmrpflash -i en0 -f R7000-V1.0.11.216_10.2.122.chk
```
