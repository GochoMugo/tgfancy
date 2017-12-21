/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * The client with the fancy boobs and ass!
 *
 * Notes:
 * -----
 * 1. Use of queue to send messages was first proposed at
 *    https://github.com/yagop/node-telegram-bot-api/issues/192#issuecomment-249488807
 * 2. Kick-without-Ban was suggested to me by @kamikazechaser
 * 3. Openshift Webhook was inspired by the example at https://github.com/yagop/node-telegram-bot-api/blob/master/examples/openShiftWebHook.js
 * 4. The Telegram WebSocket Updates bridge is being run by @GingerPlusPlus
 */


// npm-installed modules
const _ = require("lodash");
const Debug = require("debug");
const emoji = require("node-emoji");
const Promise = require("bluebird");
const TelegramBot = require("node-telegram-bot-api");
const tgresolve = require("tg-resolve");
const WebSocket = require("ws");


// module variables
const debug = Debug("tgfancy:client");
// Maximum length of a Message's text
const MAX_MSG_TXT_LEN = 4096;
// URL to our default Telegram WebSocket Updates bridge
const WEBSOCKET_URL = "wss://telegram-websocket-bridge-qalwkrjzzs.now.sh";
const emojifiedFns = [
    ["editMessageText", { position: 0 }],
    ["sendMessage", { position: 1 }],
];
const ratelimitedFns = [
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
];
// Note: If 'positions' of the chat IDs is NOT provided,
// it is assumed to be the first argument
const resolveChatIdFns = [
    ["deleteChatPhoto"],
    ["deleteChatStickerSet"],
    ["deleteMessage"],
    ["exportChatInviteLink"],
    ["forwardMessage"],
    ["getChat"],
    ["getChatAdministrators"],
    ["getChatMember", { positions: [0, 1] }],
    ["getChatMembersCount"],
    ["getGameHighScores"],
    ["getUserProfilePhotos"],
    ["kickChatMember", { positions: [0, 1] }],
    ["leaveChat"],
    ["pinChatMessage"],
    ["promoteChatMember", { positions: [0, 1] }],
    ["restrictChatMember", { positions: [0, 1] }],
    ["sendAudio"],
    ["sendChatAction"],
    ["sendContact"],
    ["sendDocument"],
    ["sendGame"],
    ["sendInvoice"],
    ["sendLocation"],
    ["sendMediaGroup"],
    ["sendMessage"],
    ["sendPhoto"],
    ["sendSticker"],
    ["sendVenue"],
    ["sendVideo"],
    ["sendVideoNote"],
    ["sendVoice"],
    ["setChatDescription"],
    ["setChatPhoto"],
    ["setChatStickerSet"],
    ["setChatTitle"],
    ["setGameScore"],
    ["unbanChatMember", { positions: [0, 1] }],
    ["unpinChatMessage"],
];
// NOTE: we are assuming that a valid chat ID is passed as
// the first argument
const queuedSendFns = [
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
];
const defaults = {
    chatIdResolution: {
        _default: true,
        resolve: tgresolve,
    },
    emojification: {
        emojify: emoji.emojify,
    },
    kickWithoutBan: true,
    openshiftWebHook: false,
    orderedSending: true,
    ratelimiting: {
        _default: true,
        maxRetries: 10,
        timeout: 1000 * 60, // 1 minute
        notify: undefined,
        maxBackoff: 1000 * 60 * 5, // 5 minutes
    },
    textPaging: true,
    webSocket: {
        url: WEBSOCKET_URL,
        autoOpen: true,
    },
};


class Tgfancy extends TelegramBot {
    /**
     * Construct a new client.
     * 'token' and 'options' are passed to TelegramBot.
     *
     * @class Tgfancy
     * @constructor
     * @param  {String} token
     * @param  {Options} [options]
     * @param  {Boolean|Object} [options.chatIdResolution=true]
     * @param  {Function} [options.chatIdResolution.resolve]
     * @param  {Boolean|Object} [options.emojification]
     * @param  {Function} [options.emojify]
     * @param  {Boolean} [options.kickWithoutBan=true]
     * @param  {Boolean} [options.openshiftWebHook]
     * @param  {Boolean} [options.orderedSending=true]
     * @param  {Boolean|Object} [options.ratelimiting=true]
     * @param  {Number} [options.ratelimiting.maxRetries]
     * @param  {Number} [options.ratelimiting.timeout]
     * @param  {Function} [options.ratelimiting.notify]
     * @param  {Number} [options.ratelimiting.maxBackoff] Maximum number of ms to be in back-off mode
     * @param  {Boolean} [options.textPaging=true]
     * @param  {Boolean|Object} [options.webSocket]
     * @param  {String} [options.webSocket.url]
     * @param  {Boolean} [options.webSocket.autoOpen=true]
     */
    constructor(token, options={}) {
        options.tgfancy = options.tgfancy || {}; // NOTE: mutation to original options object
        function boolOrObject(key) {
            const value = options.tgfancy[key];
            if (value) return { _active: true }; // 'true' or '{...}'
            if (typeof value === "undefined" && defaults[key]._default) return { _active: true };
            return { _active: false };
        }
        const opts = _.defaultsDeep({
            _openshift: false,
            _openshiftDomain: undefined,
            token,
            // options that allow either a 'boolean' or an 'object'
            chatIdResolution: boolOrObject("chatIdResolution"),
            emojification: boolOrObject("emojification"),
            ratelimiting: boolOrObject("ratelimiting"),
            webSocket: boolOrObject("webSocket"),
        }, options.tgfancy, defaults);

        // setting up Openshift webhook, if we are actually
        // on Openshift. We are using an informational environment
        // variable to check if we are on Openshift.
        // See https://developers.openshift.com/managing-your-applications/environment-variables.html#informational-variables
        // and https://developers.openshift.com/languages/nodejs/environment-variables.html
        if (opts.openshiftWebHook && process.env.OPENSHIFT_APP_UUID) {
            opts._openshift = true;
            opts._openshiftDomain = `${process.env.OPENSHIFT_APP_DNS}:443/bot${token}`;
            options.webHook = { // NOTE: mutation to original options object
                host: process.env.OPENSHIFT_NODEJS_IP,
                port: process.env.OPENSHIFT_NODEJS_PORT,
            };
            // since we are using a web hook, we do not need polling and websocket
            delete options.polling;
            delete options.webSocket;
        }

        super(token, options);
        /*
         * Because JS has NO true classes, we need to rename our options
         * from 'options', since it would override the instance variable
         * in the super class (from within it! Yeah! Ikr! Fuck that!)
         */
        this.tgfancy = opts;
        const self = this;

        // Working around rate-limits
        if (this.tgfancy.ratelimiting._active) {
            ratelimitedFns.forEach(function(methodName) {
                self[methodName] = self._ratelimit(self[methodName]);
            });
        }

        // The TelegramBot#sendMessage() performs paging of
        // the text across 4096th-char boundaries
        if (this.tgfancy.textPaging) {
            this.sendMessage = this._pageText(this.sendMessage);
        }

        // Some functions require their text arguments be emojified.
        // This should be done BEFORE paging the text to ensure paging
        // boundaries are NOT disturbed!
        if (this.tgfancy.emojification._active) {
            emojifiedFns.forEach(function(methodDesc) {
                const methodName = methodDesc[0];
                self[methodName] = self._emojify(self[methodName], methodDesc[1]);
            });
        }

        // Some functions are wrapped around to provide queueing of
        // multiple messages in a bid to ensure order
        if (this.tgfancy.orderedSending) {
            // Multiple internal queues are used to ensure *this* client
            // sends the messages, to a specific chat, in order
            this._sendQueues = {};
            this._sending = {};

            // some patching to ensure stuff works out of the box ;-)
            this._sendQueueTrigger = this._sendQueueTrigger.bind(this);

            queuedSendFns.forEach(function(methodName) {
                self[methodName] = self._sendQueueWrap(self[methodName]);
            });
        }

        // Some functions are wrapped around to resolve usernames
        // to valid chat IDs. We need to resolve the chat ID
        // BEFORE queueing the function, so that the method uses
        // the same internal send-queue, through the resolved
        // chat ID.
        if (this.tgfancy.chatIdResolution._active) {
            this.tgfancy.chatIdResolution.resolve = Promise.promisify(this.tgfancy.chatIdResolution.resolve);
            resolveChatIdFns.forEach(function(methodDesc) {
                const methodName = methodDesc[0];
                self[methodName] = self._resolveChatId(self[methodName], methodDesc[1]);
            });
        }

        // setting up listening to updates via websocket
        if (this.tgfancy.webSocket._active) {
            this._ws = null;
            if (this.tgfancy.webSocket.autoOpen) this.openWebSocket();
        }

        // We are now performing 'on ready' actions.
        // Let's set the correct webhook when on Openshift
        if (this.tgfancy._openshift) {
            this.setWebHook(this.tgfancy._openshiftDomain);
        }
    }

    /**
     * Return a function that works around rate-limits enforced
     * by Telegram servers.
     *
     * @private
     * @param  {Function} method
     * @return {Function}
     * @see https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
     */
    _ratelimit(method) {
        const self = this;

        return function(...args) {
            let retry = 0;
            function exec(resolve, reject) {
                method.call(self, ...args)
                    .then(resolve)
                    .catch(function(error) {
                        if (!error.response || error.response.statusCode !== 429) {
                            return reject(error);
                        }
                        retry++;
                        const opts = self.tgfancy.ratelimiting;
                        if (retry > opts.maxRetries) {
                            return reject(error);
                        }
                        const body = error.response.body;
                        const params = body ? body.parameters : undefined;
                        const timeout = params && params["retry_after"] ? (1000 * params["retry_after"]) : opts.timeout;
                        if (timeout > opts.maxBackoff) {
                            error = new Error("timeout above maxBackoff");
                            error.timeout = timeout;
                            return reject(error);
                        }
                        if (opts.notify) {
                            opts.notify(method.name, ...args);
                        }
                        setTimeout(function() {
                            exec(resolve, reject);
                        }, timeout);
                    });
            }
            return new Promise(function(resolve, reject) {
                exec(resolve, reject);
            });
        };
    }

    /**
     * Return a function wrapping around the supplied 'method' that
     * uses queueing to send the message.
     *
     * @private
     * @param  {Function} method Context-bound function
     * @return {Function} The function maintains the same signature as 'method'
     */
    _sendQueueWrap(method) {
        const self = this;

        return function(...args) {
            let resolve, reject;
            const promise = new Promise(function(promiseResolve, promiseReject) {
                resolve = promiseResolve;
                reject = promiseReject;
            });
            const chatId = args[0];
            let queue = self._sendQueues[chatId];

            if (!queue) {
                queue = self._sendQueues[chatId] = [];
            }

            debug("queueing message to chat %s", chatId);
            queue.push({ method, args, resolve, reject });
            process.nextTick(function() {
                return self._sendQueueTrigger(chatId);
            });
            return promise;
        };
    }

    /**
     * Trigger processing of the send-queue for a particular chat.
     * This is invoked internally to handle queue processing.
     *
     * @private
     * @param  {String} chatId
     */
    _sendQueueTrigger(chatId) {
        const self = this;
        const queue = this._sendQueues[chatId];
        const sending = this._sending[chatId];

        // if we are already processing the queue, or
        // there is no queue, bolt!
        if (sending || !queue) return;

        this._sending[chatId] = true;
        delete this._sendQueues[chatId];

        debug("processing %d requests in send-queue for chat %s", queue.length, chatId);
        Promise.mapSeries(queue, function(request) {
            return request.method.apply(self, request.args)
                .then(request.resolve)
                .catch(request.reject);
        }).then(function() {
            debug("processing queue complete");
            delete self._sending[chatId];
            // trigger queue processing, as more requests might have been
            // queued up while we were busy above
            self._sendQueueTrigger(chatId);
        });
    }

    /**
     * Return a function that wraps around 'sendMessage', to
     * add paging fanciness.
     *
     * @private
     * @param  {Function} sendMessage
     * @return {Function} sendMessage(chatId, message, form)
     */
    _pageText(sendMessage) {
        const self = this;

        return function(chatId, message, form={}) {
            if (message.length < MAX_MSG_TXT_LEN) {
                return sendMessage.call(self, chatId, message, form);
            }

            let index = 0;
            let parts = [];
            // we are reserving 8 characters for adding the page number in
            // the following format: [01/10]
            let reserveSpace = 8;
            let shortTextLength = MAX_MSG_TXT_LEN - reserveSpace;
            let shortText;

            while ((shortText = message.substr(index, shortTextLength))) {
                parts.push(shortText);
                index += shortTextLength;
            }

            // The reserve space limits us to accommodate for not more
            // than 99 pages. We signal an error to the user.
            if (parts.length > 99) {
                debug("Tgfancy#sendMessage: Paging resulted into more than 99 pages");
                return new Promise(function(resolve, reject) {
                    const error = new Error("Paging resulted into more than the maximum number of parts allowed");
                    error.parts = parts;
                    return reject(error);
                });
            }

            parts = parts.map(function(part, i) {
                return `[${i+1}/${parts.length}] ${part}`;
            });

            debug("sending message in %d pages", parts.length);
            return Promise.mapSeries(parts, function(part) {
                return sendMessage.call(self, chatId, part, form);
            });
        };
    }

    /**
     * Return a function wrapping around 'method' that resolves
     * usernames to valid chat IDs.
     *
     * @private
     * @param  {Function} method
     * @return {Function} wrapped 'method'
     */
    _resolveChatId(method, options={}) {
        const self = this;
        const opts = Object.assign({
            positions: [0],
        }, options);

        return function() {
            const args = arguments;
            const positions = [];
            const usernames = [];

            opts.positions.forEach(function(position) {
                positions.push(position);
                usernames.push(args[position]);
            });

            return Promise.mapSeries(usernames, function(username) {
                if (typeof username === "number" || username[0] !== "@") {
                    return Promise.resolve(username);
                }
                debug("resolving username '%s'", username);
                return self.resolveChatId(username)
                    .then(function(result) { return result.id; });
            }).then(function(chatIds) {
                positions.forEach(function(position) {
                    args[position] = chatIds.shift();
                });
                return method.call(self, ...args);
            });
        };
    }

    /**
     * Resolve chat ID to a User or Chat object.
     *
     * @param  {String} chatId ID of chat
     * @return {Promise}
     * @see https://github.com/kamikazechaser/tg-resolve
     */
    resolveChatId(chatId) {
        return this.tgfancy.chatIdResolution.resolve(this.token, chatId);
    }

    /**
     * Emojify text to be sent.
     *
     * @private
     * @param  {Function} method
     * @param  {Object} methodDesc
     * @param  {Number} methodDesc.position Position of 'text' argument
     * @return {Function}
     */
    _emojify(method, methodDesc) {
        const self = this;

        return function() {
            const args = arguments;
            const text = args[methodDesc.position];
            const emojifiedText = self.tgfancy.emojification.emojify(text);
            args[methodDesc.position] = emojifiedText;
            return method.call(self, ...args);
        };
    }

    /**
     * Open a WebSocket for fetching updates from the bridge.
     * Multiple invocations do nothing if websocket is already open.
     *
     * @return {Promise}
     */
    openWebSocket() {
        if (this._ws) {
            return Promise.resolve();
        }
        if (this.isPolling() || this.hasOpenWebHook()) {
            return Promise.reject(new Error("WebSocket, Polling and WebHook are all mutually exclusive"));
        }
        debug("setting up websocket updates: %s", this.tgfancy.webSocket.url);
        this._ws = new WebSocket(`${this.tgfancy.webSocket.url}/${this.tgfancy.token}`);
        this._ws.on("message", (data) => {
            try {
                this.processUpdate(JSON.parse(data));
            } catch (ex) {
                // TODO: handle exception properly
            }
        });
        return new Promise((resolve) => {
            this._ws.on("open", () => {
                resolve();
            });
        });
    }

    /**
     * Close the websocket.
     * Multiple invocations do nothing if websocket is already closed.
     *
     * @return {Promise}
     */
    closeWebSocket() {
        if (!this._ws) {
            return Promise.resolve();
        }
        debug("closing websocket");
        return new Promise((resolve) => {
            this._ws.once("close", () => {
                this._ws = null;
                resolve();
            });
            this._ws.close();
        });
    }

    /**
     * Return `true` if we have an open websocket. Otherwise, `false`.
     *
     * @return {Boolean}
     */
    hasOpenWebSocket() {
        return !!this._ws;
    }

    /**
     * Kick chat member.
     *
     * @param  {String|Number} chatId
     * @param  {String|Number} userId
     * @param  {Boolean} [ban=true]
     * @return {Promise}
     */
    kickChatMember(chatId, userId, ban=true) {
        const self = this;
        const kickChatMember = super.kickChatMember;

        if (ban || !this.tgfancy.kickWithoutBan) {
            debug("kicking and banning user '%s' in chat %s", userId, chatId);
            return kickChatMember.call(self, chatId, userId);
        }

        return new Promise(function(resolve, reject) {
            debug("kicking user '%s' in chat %s", userId, chatId);
            return kickChatMember.call(self, chatId, userId)
                .then(function(kickResponse) {
                    debug("unbanning user '%s' in chat %s", userId, chatId);
                    return self.unbanChatMember(chatId, userId)
                        .then(function(unbanResponse) {
                            return resolve([kickResponse, unbanResponse]);
                        }).catch(reject);
                })
                .catch(reject);
        });
    }
}


// export the class
exports = module.exports = Tgfancy;


// If we are running tests, we expose some of the internals
// to allow sanity checks
if (process.env.NODE_ENV === "testing") {
    exports.internals = {
        emojifiedFns,
        queuedSendFns,
        ratelimitedFns,
        resolveChatIdFns,
    };
}
