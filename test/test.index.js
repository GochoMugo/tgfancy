/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * Tests.
 */
/* eslint-disable no-console */


// npm-installed modules
const _ = require("lodash");
const emoji = require("node-emoji");
const TelegramBot = require("node-telegram-bot-api");
const should = require("should");
const ws = require("ws");


// own modules
const Tgfancy = require("..");


// module variables
const pkg = require("../package.json");
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    console.error("Error: Telegram token is required");
    process.exit(1);
}
const username = process.env.TELEGRAM_USERNAME;
if (!username) {
    console.error("Error: Telegram username is required");
    process.exit(1);
}
const userid = parseInt(process.env.TELEGRAM_USERID, 10);
if (!userid) {
    console.error("Error: Telegram user ID is required");
    process.exit(1);
}
const timeout = 15 * 1000; // 15 secs
let client = createClient();
const update = {
    "update_id": 666,
    message: {
        "message_id": 666,
        date: Date.now(),
        chat: {
            id: 666,
            type: "private",
        },
        text: "Trigger!",
    },
};
let portindex = 9678;


// construct the client. This is useful when we need
// to re-create the client.
// This allows us to re-use one token for all of our tests.
function createClient(options) {
    const opts = _.defaultsDeep({}, options, {
        tgfancy: {
            emojification: true,
        },
    });
    return new Tgfancy(token, opts);
}


describe("module.exports", function() {
    it("exposes a function", function() {
        should(Tgfancy).be.a.Function();
    });
    it("exposes the NAME and VERSION", function() {
        should(Tgfancy.NAME).eql(pkg.name);
        should(Tgfancy.VERSION).eql(pkg.version);
    });
});


describe("sanity check: alphabetically-ordered, methods/functions", function() {
    function areMethods(fns) {
        fns.forEach(function(fn) {
            should(Tgfancy.prototype[fn]).be.a.Function();
        });
    }
    function checkOrder(fns) {
        const sorted = fns.slice().sort();
        for (let i = 0; i < sorted.length; i++) {
            should(sorted[i]).eql(fns[i]);
        }
    }
    it("emojifiedFns", function() {
        const fns = Tgfancy.internals.emojifiedFns.map(function(fn) {
            return fn[0];
        });
        areMethods(fns);
        checkOrder(fns);
    });
    it("queuedSendFns", function() {
        const fns = Tgfancy.internals.queuedSendFns;
        areMethods(fns);
        checkOrder(fns);
    });
    it("ratelimitedFns", function() {
        const fns = Tgfancy.internals.ratelimitedFns;
        areMethods(fns);
        checkOrder(fns);
    });
});


describe("tgfancy", function() {
    it("is an instance of Tgfancy", function() {
        should(client).be.an.instanceof(Tgfancy);
    });
    it("is a sub-class of TelegramBot", function() {
        should(client).be.an.instanceof(TelegramBot);
    });
    it(".token is the token registered during construction", function() {
        should(client.token).eql(token);
    });
    it(".options is an object with the options being used", function() {
        should(client.options).be.an.Object();
    });
});


describe("Text Paging (using Tgfancy#sendMessage())", function() {
    this.timeout(timeout * 2);
    it("pages long message", function() {
        const length = 5500;
        const longText = Array(length + 1).join("#");
        return client.sendMessage(userid, longText)
            .then(function(messages) {
                should(messages).be.an.Array();
                should(messages.length).eql(2);
                should(messages[0].text).containEql("[1/2]");
                should(messages[1].text).containEql("[2/2]");
                let mergedText = messages[0].text + messages[1].text;
                mergedText = mergedText.replace(/[^#]/g, "");
                should(mergedText.length).eql(length);
            });
    });
});


describe("Queued-methods (using Tgfancy#sendMessage())", function() {
    this.timeout(timeout * 10);
    it("queues requests", function(done) {
        const noiseLevel = 5;
        const replies = [];
        for (let index = 1; index <= noiseLevel; index++) {
            client.sendMessage(userid, index.toString())
                .then(function(message) {
                    replies.push(message.text);
                    if (message.text === noiseLevel.toString()) {
                        checkOrder();
                    }
                }).catch(done);
        }
        function checkOrder() {
            let reply = 1;
            replies.forEach(function(r) {
                should(parseInt(r, 10)).eql(reply);
                reply++;
            });
            return done();
        }
    });
});


describe("Emojification", function() {
    this.timeout(timeout);
    it("replaces GFM emoji in text", function() {
        const emojistring = ":heart:";
        const emojicode = emoji.get("heart");
        return client.sendMessage(userid, "emoji " + emojistring)
            .then(function(msg) {
                should(msg.text).containEql(emojicode);
                should(msg.text).not.containEql(emojistring);
            });
    });
});


describe("WebSocket", function() {
    let wss;
    const port = portindex++;
    const url = `ws://127.0.0.1:${port}`;
    before(function(done) {
        wss = new ws.Server({ port });
        wss.on("connection", function connection(ws, upgradeReq) {
            should(upgradeReq.url).containEql(token);
            let interval = setInterval(function() {
                ws.send(JSON.stringify(update));
            }, 1000);
            ws.on("close", function() {
                clearInterval(interval);
            });
        });
        wss.on("listening", done);
    });
    after(function(done) {
        wss.close(done);
    });
    it("receives updates", function(done) {
        const bot = new Tgfancy(token, {
            tgfancy: {
                webSocket: { url },
            },
        });
        bot.once("message", function(msg) {
            should(msg).be.an.Object();
            return done();
        });
    });

    describe("#openWebSocket", function() {
        it("opens the websocket", function(done) {
            const bot = new Tgfancy(token, {
                tgfancy: {
                    webSocket: { url, autoOpen: false },
                },
            });
            bot.once("message", function() {
                bot.closeWebSocket();
                return done();
            });
            bot.openWebSocket();
        });
        it("returns error if polling is being used already", function() {
            this.timeout(10 * 1000);
            const bot = new Tgfancy(token, { polling: { timeout: 0, autoStart: false } });
            return bot.startPolling().then(function() {
                return bot.openWebSocket().catch(function(err) {
                    should(err.message).containEql("mutually exclusive");
                    return bot.stopPolling();
                });
            });
        });
        it("returns error if webhook is being used already", function() {
            const bot = new Tgfancy(token);
            return bot.openWebHook().then(function() {
                return bot.openWebSocket().catch(function(err) {
                    should(err.message).containEql("mutually exclusive");
                    return bot.closeWebHook();
                });
            });
        });
    });
    describe("#closeWebSocket", function() {
        it("closes websocket", function(done) {
            this.timeout(10 * 1000);
            const bot = new Tgfancy(token, {
                tgfancy: { webSocket: { url } },
            });
            let messages = 0;
            bot.on("message", function() { messages++; });
            bot.once("message", function() {
                return bot.closeWebSocket()
                    .then(function() {
                        messages = 0;
                        setTimeout(function() {
                            should.equal(messages, 0);
                            return done();
                        }, 5000);
                    })
                    .catch(function(err) { should(err).not.be.ok(); });
            });
        });
    });
    describe("#hasOpenWebsocket", function() {
        const bot = new Tgfancy(token, {
            tgfancy: { webSocket: { url, autoOpen: false } },
        });
        before(function() {
            return bot.openWebSocket();
        });
        it("returns 'true' if websocket is open", function() {
            should(bot.hasOpenWebSocket()).eql(true);
        });
        it("returns 'false' if websocket is closed", function() {
            return bot.closeWebSocket().then(() => {
                should(bot.hasOpenWebSocket()).eql(false);
            });
        });
    });
});


/**
 * NOTE:
 * we are NOT running tests for rate-limiting currently,
 * as it is quite intensive.
 * We should look for a better way to test rate-limiting.
 * Until then, we should be switching between
 * 'describe.skip' and 'describe.only' on our local machines
 * when necessary. Live by faith! ;-)
 */
describe.skip("Ratelimiting", function() {
    this.timeout(timeout * 10);
    it("handles rate-limiting", function(done) {
        const longText = Array(4096 * 9 + 1).join("#");
        let interval = null;
        const client = createClient({
            tgfancy: {
                orderedSending: false,
                ratelimiting: {
                    maxRetries: 1,
                    timeout: 100,
                    notify() {
                        clearInterval(interval);
                        interval = null;
                        return done();
                    },
                },
            },
        });
        interval = setInterval(function() {
            client.sendMessage(userid, longText)
                .catch(function(error) {
                    if (!interval) return;
                    should(error.message).not.containEql("429");
                });
        }, 40);
    });
    it("respects the maxBackoff");
});
