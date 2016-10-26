# tgfancy

> A Fancy, Higher-Level Wrapper for Telegram Bot API
>
> Built on top of [node-telegram-bot-api][api].
>
> :construction: **Work In Progress** :construction:

[![Version](https://img.shields.io/npm/v/tgfancy.svg)](https://www.npmjs.com/package/tgfancy)
<!-- [![Build Status](https://travis-ci.org/GochoMugo/tgfancy.svg?branch=master)](https://travis-ci.org/GochoMugo/tgfancy)
 [![Coverage Status](https://coveralls.io/repos/GochoMugo/tgfancy/badge.svg?branch=master)](https://coveralls.io/r/GochoMugo/tgfancy?branch=master)
 [![Dependency Status](https://gemnasium.com/GochoMugo/tgfancy.svg)](https://gemnasium.com/GochoMugo/tgfancy)
-->


## installation:

```bash
$ npm install tgfancy --save
```


## sample usage:

```js
const Tgfancy = require("tgfancy");
const bot = new Tgfancy(token);

bot.sendMessage(chatId, "text message");
```


## introduction:

**tgfancy is basically [node-telegram-bot-api][api] on steriods.**
Therefore, you **MUST** know how to work with [node-telegram-bot-api][api]
before using this wrapper. **tgfancy** is a **drop-in replacement**!

**tgfancy** provides **ALL** the methods exposed by [**TelegramBot**][api-bot]
from [node-telegram-bot-api][api]. This means that all the methods from
**TelegramBot** are available on **Tgfancy**. This also includes the
constructor.


## fanciness:

> Here comes the fanciness

### Ordered sending:

Using an internal queue, we can ensure messages are sent, *to a specific
chat*, in order without having to implement the
wait-for-response-to-send-next-message logic.

For example,

```js
bot.sendMessage(chatId, "first message");
bot.sendMessage(chatId, "second message");
```

With **tgfancy**, you are guaranteed that `"first message"` will be sent
**before** `"second message"`.

Fancied functions: `sendMessage`, `sendPhoto`, `sendAudio`, `sendDocument`,
`sendSticker`, `sendVideo`, `sendVoice`, `sendLocation`, `sendVenue`,
`sendGame`.

An earlier discussion on this feature can be found [here][docs-queue-1].

[docs-queue-1]:https://github.com/yagop/node-telegram-bot-api/issues/192


## license:

**The MIT License (MIT)**

Copyright (c) 2016 GochoMugo (www.gmugo.in)


[api]: https://github.com/yagop/node-telegram-bot-api
[api-bot]: https://github.com/yagop/node-telegram-bot-api#telegrambot
