# API Reference

<a name="Tgfancy"></a>

## Tgfancy
Tgfancy

**Kind**: global class  

* [Tgfancy](#Tgfancy)
    * [new Tgfancy(token, [options])](#new_Tgfancy_new)
    * [.resolveChatId(chatId)](#Tgfancy+resolveChatId) ⇒ <code>Promise</code>
    * [.openWebSocket()](#Tgfancy+openWebSocket) ⇒ <code>Promise</code>
    * [.closeWebSocket()](#Tgfancy+closeWebSocket) ⇒ <code>Promise</code>
    * [.hasOpenWebSocket()](#Tgfancy+hasOpenWebSocket) ⇒ <code>Boolean</code>
    * [.kickChatMember(chatId, userId, [ban])](#Tgfancy+kickChatMember) ⇒ <code>Promise</code>

<a name="new_Tgfancy_new"></a>

### new Tgfancy(token, [options])
Construct a new client.
'token' and 'options' are passed to TelegramBot.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| token | <code>String</code> |  |  |
| [options] | <code>Options</code> |  |  |
| [options.chatIdResolution] | <code>Boolean</code> &#124; <code>Object</code> | <code>true</code> |  |
| [options.chatIdResolution.resolve] | <code>function</code> |  |  |
| [options.emojification] | <code>Boolean</code> &#124; <code>Object</code> |  |  |
| [options.emojify] | <code>function</code> |  |  |
| [options.kickWithoutBan] | <code>Boolean</code> | <code>true</code> |  |
| [options.openshiftWebHook] | <code>Boolean</code> |  |  |
| [options.orderedSending] | <code>Boolean</code> | <code>true</code> |  |
| [options.ratelimiting] | <code>Boolean</code> &#124; <code>Object</code> | <code>true</code> |  |
| [options.ratelimiting.maxRetries] | <code>Number</code> |  |  |
| [options.ratelimiting.timeout] | <code>Number</code> |  |  |
| [options.ratelimiting.notify] | <code>function</code> |  |  |
| [options.ratelimiting.maxBackoff] | <code>Number</code> |  | Maximum number of ms to be in back-off mode |
| [options.textPaging] | <code>Boolean</code> | <code>true</code> |  |
| [options.webSocket] | <code>Boolean</code> &#124; <code>Object</code> |  |  |
| [options.webSocket.url] | <code>String</code> |  |  |
| [options.webSocket.autoOpen] | <code>Boolean</code> | <code>true</code> |  |

<a name="Tgfancy+resolveChatId"></a>

### tgfancy.resolveChatId(chatId) ⇒ <code>Promise</code>
Resolve chat ID to a User or Chat object.

**Kind**: instance method of <code>[Tgfancy](#Tgfancy)</code>  
**See**: https://github.com/kamikazechaser/tg-resolve  

| Param | Type | Description |
| --- | --- | --- |
| chatId | <code>String</code> | ID of chat |

<a name="Tgfancy+openWebSocket"></a>

### tgfancy.openWebSocket() ⇒ <code>Promise</code>
Open a WebSocket for fetching updates from the bridge.
Multiple invocations do nothing if websocket is already open.

**Kind**: instance method of <code>[Tgfancy](#Tgfancy)</code>  
<a name="Tgfancy+closeWebSocket"></a>

### tgfancy.closeWebSocket() ⇒ <code>Promise</code>
Close the websocket.
Multiple invocations do nothing if websocket is already closed.

**Kind**: instance method of <code>[Tgfancy](#Tgfancy)</code>  
<a name="Tgfancy+hasOpenWebSocket"></a>

### tgfancy.hasOpenWebSocket() ⇒ <code>Boolean</code>
Return `true` if we have an open websocket. Otherwise, `false`.

**Kind**: instance method of <code>[Tgfancy](#Tgfancy)</code>  
<a name="Tgfancy+kickChatMember"></a>

### tgfancy.kickChatMember(chatId, userId, [ban]) ⇒ <code>Promise</code>
Kick chat member.

**Kind**: instance method of <code>[Tgfancy](#Tgfancy)</code>  

| Param | Type | Default |
| --- | --- | --- |
| chatId | <code>String</code> &#124; <code>Number</code> |  | 
| userId | <code>String</code> &#124; <code>Number</code> |  | 
| [ban] | <code>Boolean</code> | <code>true</code> | 

