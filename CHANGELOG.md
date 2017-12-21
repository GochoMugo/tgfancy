# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).


## Unreleased



## 0.13.0 - 2017-12-21

Added:

* Add option `ratelimiting.maxBackoff`
* Add support for **node-telegram-bot-api@v0.30.0**
* Dependencies updated


## 0.12.0 - 2017-10-22

Added:

* Added method `Tgfancy#resolveChatId()`
* Add support for **node-telegram-bot-api@v0.29.0**
* Dependencies updated


## 0.11.0 - 2017-08-15

Added:

* Support NTBA 0.28.0
* Dependencies updated


## 0.10.0 - 2017-05-06

Changed:

* Rate-limiting logic updated to use update NTBA API, i.e. `error.response`
  object.
* Dependencies updated


## 0.9.0 - 2017-02-16

Added:

* Added method `Tgfancy#hasOpenWebSocket()`


## 0.8.0 - 2017-01-21

Added:

* New fanciness: websocket updates

Changed:

* Redesign feature options


## 0.7.0 - 2016-12-30

Added:

* Add and modify functions requiring chat ID resolution
* New fanciness: emojification, ratelimiting


## 0.6.0 - 2016-11-15

Added:

* Automatically disable polling if setting webhook on Openshift


## 0.5.0 - 2016-11-15

Added:

* New fanciness: Openshift WebHook


## 0.4.0 - 2016-11-10

Added:

* Toggling features

Changed:

* All options to **tgfancy** **MUST** be placed under the `tgfancy` key.


## 0.3.0 - 2016-11-05

Added:

* Resolve all chat IDs in method's arguments
* Make package smaller by adding more rules to `.npmignore`


## 0.2.1 - 2016-11-04

Changed:

* Tgfancy is a proper sub-class of TelegramBot
* Dependencies updated


## 0.2.0 - 2016-11-03

Added:

* Tests and CI have been added


Changed:

* Drop support for Node.js v4


## 0.1.1 - 2016-10-30

Fixed:

* Add missing dependency, 'tg-resolve'


## 0.1.0 - 2016-10-30

Added:

* Text paging, in `Tgfancy#sendMessage()`
* Chat ID resolution
* Kick-without-Ban


## 0.0.0 - 2016-10-26

**Out in the Wild**
