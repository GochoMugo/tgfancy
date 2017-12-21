# tgfancy

> A Fancy, Higher-Level Wrapper for Telegram Bot API
>
> Built on top of [node-telegram-bot-api][api].
>
> :construction: **Work In Progress** :construction:

[![Version](https://img.shields.io/npm/v/tgfancy.svg)](https://www.npmjs.com/package/tgfancy)
 [![Supported Node.js Versions](https://img.shields.io/node/v/tgfancy.svg)](https://www.npmjs.com/package/tgfancy)
 [![Build Status](https://travis-ci.org/GochoMugo/tgfancy.svg?branch=master)](https://travis-ci.org/GochoMugo/tgfancy)
 [![Coverage Status](https://coveralls.io/repos/github/GochoMugo/tgfancy/badge.svg?branch=master)](https://coveralls.io/github/GochoMugo/tgfancy?branch=master)
 [![Dependency Status](https://gemnasium.com/GochoMugo/tgfancy.svg)](https://gemnasium.com/GochoMugo/tgfancy)


## installation:

```bash
$ npm install tgfancy --save
```


## sample usage:

```js
const Tgfancy = require("tgfancy");
const bot = new Tgfancy(token, {
    // all options to 'tgfancy' MUST be placed under the
    // 'tgfancy' key, as shown below
    tgfancy: {
        option: "value",
    },
});

bot.sendMessage(chatId, "text message");
```


## introduction:

**tgfancy is basically [node-telegram-bot-api][api] on steroids.**
Therefore, you **MUST** know how to work with [node-telegram-bot-api][api]
before using this wrapper. **tgfancy** is a **drop-in replacement**!

**tgfancy** provides **ALL** the methods exposed by [**TelegramBot**][api-bot]
from [node-telegram-bot-api][api]. This means that all the methods from
**TelegramBot** are available on **Tgfancy**. This also includes the
constructor.


## fanciness:

> Here comes the fanciness

**tgfancy** adds the following fanciness:

* [Ordered Sending](#ordered-sending)
* [Text Paging](#text-paging)
* [Chat ID Resolution](#chat-id-resolution)
* [Rate-Limiting](#ratelimiting)
* [Emojification](#emojification)
* [Fetching Updates via WebSocket](#websocket-updates)
* [Kick-without-Ban](#kick-without-ban)
* [Openshift WebHook](#openshift-webhook)

Have a look at the [API Reference][doc-api].

[doc-api]:https://github.com/GochoMugo/tgfancy/tree/master/doc/api.md


<a name="feature-options"></a>
### feature options:

Most of the features are **enabled by default**. Such a feature (enabled by
default) is similar to doing something like:

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        feature: true,  // 'true' to enable!
    },
});
```

Such a feature can be **disabled** like so:

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        feature: false, // 'false' to disable!
    },
});
```

If a feature allows more options, you may pass an object, instead of `true`,
like:

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        feature: {          // feature will be enabled!
            key: "value",   // feature option
        },
    },
});
```

See example at `example/feature-toggled.js`.


---


<a name="ordered-sending"></a>
### Ordered sending:

Using an internal queue, we can ensure messages are sent, *to a specific
chat*, in order without having to implement the
wait-for-response-to-send-next-message logic.

**Feature option:** `orderedSending` (see [above](#feature-options))

For example,

```js
bot.sendMessage(chatId, "first message");
bot.sendMessage(chatId, "second message");
```

With **tgfancy**, you are guaranteed that `"first message"` will be sent
**before** `"second message"`.

Fancied functions: `[
    "sendAudio",
    "sendDocument",
    "sendGame",
    "sendInvoice",
    "sendLocation",
    "sendMessage",
    "sendPhoto",
    "sendSticker",
    "sendVenue",
    "sendVideo",
    "sendVideoNote",
    "sendVoice",
]`

An earlier discussion on this feature can be found [here][docs-queue-1].
See example at `example/queued-up.js`.

[docs-queue-1]:https://github.com/yagop/node-telegram-bot-api/issues/192


---


<a name="text-paging"></a>
### Text paging:

The `Tgfancy#sendMessage(chatId, message)` automatically pages messages,
that is, if `message` is longer than the maximum limit of 4096 characters,
the `message` is split into multiple parts. These parts are sent serially,
one after the other.

The page number, for example `[01/10]`, is prefixed to the text.

**Feature option:** `textPaging` (see [above](#feature-options))

For example,

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


---


<a name="chat-id-resolution"></a>
### chat ID resolution:

Usernames are automatically resolved to the target's corresponding
unique identifier. By default, this resolution uses the
[PWRTelegram API][pwr].

**Feature option:** `chatIdResolution` (see [above](#feature-options))

For example,

```js
bot.sendMessage("@gochomugo", "Message sent using username");
```

However, it is possible to define a custom function used to perform
these resolutions. The function **must** have the signature,
`resolve(token, chatId, callback)`. The `callback` **must**
have the signature `callback(error, target)`, where `target` is
an object representing the target entity.

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        chatIdResolution: {
            resolve(token, chatId, callback) {
                // perform the resolution
                // ... snip ...
                return callback(null, user);
            },
        },
    },
});
```

Fancied functions: `[
    "deleteChatPhoto",
    "deleteChatStickerSet",
    "deleteMessage",
    "exportChatInviteLink",
    "forwardMessage",
    "getChat",
    "getChatAdministrators",
    "getChatMember",
    "getChatMembersCount",
    "getUserProfilePhotos",
    "kickChatMember",
    "leaveChat",
    "pinChatMessage",
    "promoteChatMember",
    "restrictChatMember",
    "sendAudio",
    "sendChatAction",
    "sendContact",
    "sendDocument",
    "sendGame",
    "sendInvoice",
    "sendLocation",
    "sendMediaGroup",
    "sendMessage",
    "sendPhoto",
    "sendSticker",
    "sendVenue",
    "sendVideo",
    "sendVideoNote",
    "sendVoice",
    "setChatDescription",
    "setChatPhoto",
    "setChatStickerSet",
    "setChatTitle",
    "setGameScore",
    "unbanChatMember",
    "unpinChatMessage",
]`

See example at `example/resolve-chatid.js`.

**Note:** The Chat ID is resolved **before** the request
is queued. Consider this, if order of messages gets messed
up, when using this resolution.

If you want to manually resolve a chat ID, take a look at
[Tgfancy#resolveChatId][tgfancy-resolvechatid]. For example,

```js
bot.resolveChatId(chatId)
    .then(function(result) {
        console.log(result);
    });
```


[pwr]:http://pwrtelegram.xyz/
[tgfancy-resolvechatid]:doc/api.md#Tgfancy+resolveChatId


---


<a name="ratelimiting"></a>
### Rate-Limiting:

Any request that encounters a `429` error i.e. rate-limiting error
will be retried after some time (as advised by the Telegram API or
1 minute by default).
The request will be retried for a number of times, until it succeeds or
the maximum number of retries has been reached

**Feature option:** `ratelimiting` (see [above](#feature-options))

For example,

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        // options for this fanciness
        ratelimiting: {
            // number of times to retry a request before giving up
            maxRetries: 10,         // default: 10
            // number of milliseconds to wait before retrying the
            // request (if API does not advise us otherwise!)
            timeout: 1000 * 60,     // default: 60000 (1 minute)
            // (optional) function invoked whenever this fanciness handles
            // any ratelimiting error.
            // this is useful for debugging and analysing your bot
            // behavior
            notify(methodName, ...args) {   // default: undefined
                // 'methodName' is the name of the invoked method
                // 'args' is an array of the arguments passed to the method
                // do something useful here
                // ...snip...
            },
            // maximum number of milliseconds to allow for waiting
            // in backoff-mode before retrying the request.
            // This is important to avoid situations where the server
            // can cause lengthy timeouts e.g. too long of a wait-time
            // that is causes adverse effects on efficiency and performance.
            maxBackoff: 1000 * 60 * 5,      // default: 5 minutes
        },
    },
});
```

Fancied functions: `[
    "addStickerToSet",
    "answerCallbackQuery",
    "answerInlineQuery",
    "answerPreCheckoutQuery",
    "answerShippingQuery",
    "createNewStickerSet",
    "deleteChatPhoto",
    "deleteChatStickerSet",
    "deleteMessage",
    "deleteStickerFromSet",
    "downloadFile",
    "editMessageCaption",
    "editMessageLiveLocation",
    "editMessageReplyMarkup",
    "editMessageText",
    "exportChatInviteLink",
    "forwardMessage",
    "getChat",
    "getChatAdministrators",
    "getChatMember",
    "getChatMembersCount",
    "getFile",
    "getFileLink",
    "getGameHighScores",
    "getStickerSet",
    "getUpdates",
    "getUserProfilePhotos",
    "kickChatMember",
    "leaveChat",
    "pinChatMessage",
    "promoteChatMember",
    "restrictChatMember",
    "sendAudio",
    "sendChatAction",
    "sendContact",
    "sendDocument",
    "sendGame",
    "sendInvoice",
    "sendLocation",
    "sendMediaGroup",
    "sendMessage",
    "sendPhoto",
    "sendSticker",
    "sendVenue",
    "sendVideo",
    "sendVideoNote",
    "sendVoice",
    "setChatDescription",
    "setChatPhoto",
    "setChatStickerSet",
    "setChatTitle",
    "setGameScore",
    "setStickerPositionInSet",
    "setWebHook",
    "stopMessageLiveLocation",
    "unbanChatMember",
    "unpinChatMessage",
    "uploadStickerFile",
]`

An earlier discussion on this feature can be found [here][docs-ratelimiting-1].
See example at `example/ratelimited.js`.

[docs-ratelimiting-1]:https://github.com/GochoMugo/tgfancy/issues/4


---


<a name="emojification"></a>
### Emojification:

Any Github-flavoured Markdown emoji, such as `:heart:` can be replaced
automatically with their corresponding Unicode values. By default,
uses the [node-emoji][emoji] library (Go give a star!).
**Disabled by default**.

**Feature option:** `emojification` (see [above](#feature-options))

For example,

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        emojification: true,
    },
});
bot.sendMessage(chatId, "Message text with :heart: emoji")
    .then(function(msg) {
        // 'msg' is the Message sent to the chat
        console.log(msg.text); // => "Message text with ❤️ emoji"
    });
```

However, it is possible to define a custom function used to perform
emojification. The function **must** have the signature,
`emojify(text)` and return the emojified text.

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        emojification: {
            emojify(text) {
                // emojify here
                // ... snip ...
                return emojifiedText;
            },
        },
    },
});
```

Fancied functions: `["sendMessage", "editMessageText"]`

See example at `example/emojified.js`.

[emoji]:https://github.com/omnidan/node-emoji#readme


---


<a name="websocket-updates"></a>
### Fetching Updates via WebSocket:

In addition to polling and web-hooks, this introduces another mechanism
for fetching your updates: **WebSocket**. While currently it is **not**
officially supported by Telegram, we have a *bridge* up and running
that you can connect to for this purpose. **Disabled by default**.

**Feature option:** `webSocket` (see [above](#feature-options))

For example,

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        webSocket: true,
    },
});
```

The current default bridge is at
*wss://telegram-websocket-bridge-qalwkrjzzs.now.sh* and is being run by
[@GingerPlusPlus][gingerplusplus].

You can specify more options as so:

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        webSocket: {
            // specify a custom URL for a different bridge
            url: "wss://telegram-websocket-bridge-qalwkrjzzs.now.sh",
            // immediately open the websocket
            autoOpen: true,
        },
    },
});
```

See example at `example/web-socket.js`.

[gingerplusplus]:https://github.com/GingerPlusPlus


---


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

**Feature option:** `kickWithoutBan` (see [above](#feature-options))

For example,

```js
// The last argument is called 'ban', is optional and
// defaults to 'true'. Passing 'false' causes Tgfancy execute
// 'unbanChatMember' right after kicking the user.
bot.kickChatMember(chatId, userId, false);
```

See example at `example/kick-only.js`.


---


<a name="openshift-webhook"></a>
### Openshift WebHook:

It is easier to set up webhook for your bot on [Openshift][openshift].
Enabling this feature allows **automatic detection if running on Openshift**
and setting up web-hook for the bot instance.

**Feature option:** `openshiftWebHook` (see [above](#feature-options))

For example,

```js
const bot = new Tgfancy(token, {
    tgfancy: {
        openshiftWebHook: true, // enable this feature
    },
});
```

Note that **polling and fetching updates via WebSocket are automatically disabled** if the web-hook is set.
This allows you to use polling or WebSocket locally, but use a web-hook on Openshift.
For example,

```js
const bot = new Tgfancy(token, {
    polling: true, // use polling unless disabled by Openshift-WebHook feature
    tgfancy: {
        openshiftWebHook: true,
    },
});
```

You may also define **default web-hook parameters** to be used,
if the bot is **not** running on Openshift. For example,

```js
const bot = new Tgfancy(token, {
    webHook: { /* your parameters here */ }, // used if NOT on Openshift
    tgfancy: {
        openshiftWebHook: true,
    },
});
```

[openshift]:https://openshift.com


---


## license:

**The MIT License (MIT)**

Copyright (c) 2016 GochoMugo (www.gmugo.in)


[api]: https://github.com/yagop/node-telegram-bot-api
[api-bot]: https://github.com/yagop/node-telegram-bot-api#telegrambot
