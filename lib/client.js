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
 */


// npm-installed modules
const Debug = require("debug");
const Promise = require("bluebird");
const TelegramBot = require("node-telegram-bot-api");


// module variables
const debug = Debug("tgfancy:client");
// WARNING: these functions MUST accept 'chatId' as their first argument
const queuedSendFns = ["sendMessage", "sendPhoto", "sendAudio",
    "sendDocument", "sendSticker", "sendVideo", "sendVoice",
    "sendLocation", "sendVenue", "sendGame"];


exports = module.exports = class Tgfancy {
    constructor(token, options) {
        const self = this;
        this._telegram = new TelegramBot(token, options);

        // Multiple internal queues are used to ensure *this* client
        // sends the messages, to a specific chat, in order
        this._sendQueues = {};
        this._sending = {};

        // Some functions are wrapped around to provide queueing of
        // multiple messages in a bid to ensure order
        queuedSendFns.forEach(function(methodName) {
            const method = self._telegram[methodName].bind(self._telegram);
            self[methodName] = self._sendQueueWrap(method).bind(self);
        });

        // By default, all the public methods of TelegramBot should be
        // made available on Tgfancy.
        // But we allow Tgfancy to override TelegramBot methods to
        // add more fanciness!
        Object.getOwnPropertyNames(TelegramBot.prototype).forEach(function(methodName) {
            const method = self._telegram[methodName];

            if (typeof method !== "function" ||
                self[methodName])
                return;

            self[methodName] = method.bind(self._telegram);
        });

        // some patching to ensure stuff works out of the box ;-)
        this._sendQueueTrigger = this._sendQueueTrigger.bind(this);
    }

    /**
     * Return a function wrapping around the supplied 'method' that
     * uses queueing to send the message.
     *
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
     * @param  {String} chatId
     */
    _sendQueueTrigger(chatId) {
        const self = this;
        const queue = this._sendQueues[chatId];
        const sending = this._sending[chatId];

        // if we are already processing the queue, or
        // the queue is empty, bolt!
        if (sending || !queue) return;

        this._sending[chatId] = true;
        delete this._sendQueues[chatId];

        debug("processing %d requests in send-queue for chat %d", queue.length, chatId);
        Promise.mapSeries(queue, function(request) {
            return request.method(...request.args)
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
};
