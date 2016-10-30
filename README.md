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

* [Ordered Sending](#ordered-sending)
* [Text Paging](#text-paging)
* [Chat ID Resolution](#chat-id-resolution)
* [Kick-without-Ban](#kick-without-ban)


<a name="ordered-sending"></a>
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

Fancied functions: `["sendMessage", "sendPhoto", "sendAudio",
"sendDocument", "sendSticker", "sendVideo", "sendVoice",
"sendLocation", "sendVenue", "sendGame"]`

An earlier discussion on this feature can be found [here][docs-queue-1].
See example at `example/queued-up.js`.

[docs-queue-1]:https://github.com/yagop/node-telegram-bot-api/issues/192


<a name="text-paging"></a>
### Text paging:

The `Tgfancy#sendMessage(chatId, message)` automatically pages messages,
that is, if `message` is longer than the maximum limit of 4096 characters,
the `message` is split into multiple parts. These parts are sent serially,
one after the other.

The page number, for example `[01/10]`, is prefixed to the text.

```js
// 'veryLongText' is a message that contains more than 4096 characters
// Usually, trying to send this message would result in the API returning
// an error.
bot.sendMessage(chatId, veryLongText)
    .then(function(messages) {
        // 'messages' is an Array containing Message objects from
        // the Telegram API, for each of the parts
        console.log("message has been sent in multiple pages");
    }).catch(function(error) {
        console.error(error);
    });
```

**Note:** We do **not** support sending messages that'd result into more
than 99 parts.

See example at `example/paging-text.js`.


<a name="chat-id-resolution"></a>
### chat ID resolution:

Usernames are automatically resolved to the target's corresponding
unique identifier. By default, this resolution uses the
[PWRTelegram API][pwr].

```js
bot.sendMessage("@gochomugo", "Message sent using username");
```

However, it is possible to define a custom function used to perform
these resolutions. The function **must** have the signature,
`resolveChatId(token, chatId, callback)`. The `callback` **must**
have the signature `callback(error, target)`, where `target` is
an object representing the target entity.

```js
const bot = new Tgfancy(token, {
    resolveChatId(token, chatId, callback) {
        // perform the resolution
        // ... snip ...
        return callback(null, user);
    },
});
```

Fancied functions: `["sendMessage", "forwardMessage",
"sendPhoto", "sendAudio", "sendDocument", "sendSticker",
"sendVideo", "sendVoice", "sendLocation", "sendVenue",
"sendGame", "sendChatAction", "kickChatMember",
"unbanChatMember", "getChat", "getChatAdministrators",
"getChatMembersCount", "getChatMember", "leaveChat"]`

See example at `example/resolve-chatid.js`.

[pwr]:http://pwrtelegram.xyz/


<a name="kick-without-name"></a>
### Kick-without-Ban:

You can kick a user **without** banning them, that is,
they will be able to rejoin the group using invite links, etc.

By default, Tgfancy kicks the user through `Tgfancy#kickChatMember()`
using the default API method `kickChatMember`. Passing `false`
as the last argument to `Tgfancy#kickChatMember()` will make
Tgfancy executes the API method `unbanChatMember()` right after
kicking the chat member, effectively kicking the user, without
banning them.

```js
// The last argument is called 'ban', is optional and
// defaults to 'true'. Passing 'false' causes Tgfancy execute
// 'unbanChatMember' right after kicking the user.
bot.kickChatMember(chatId, userId, false);
```

See example at `example/kick-only.js`.


## license:

**The MIT License (MIT)**

Copyright (c) 2016 GochoMugo (www.gmugo.in)


[api]: https://github.com/yagop/node-telegram-bot-api
[api-bot]: https://github.com/yagop/node-telegram-bot-api#telegrambot
