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
const request = require("request");
const should = require("should");


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


// construct the client. This is useful when we need
// to re-create the client, particularly when testing openshift webhook
// This allows us to re-use one token for all of our tests.
function createClient(options) {
    const opts = _.defaultsDeep({}, options, {
        tgfancy: {
            emojification: true,
            resolveChatId,
        },
    });
    return new Tgfancy(token, opts);
}


// We are using a custom resolver function, since we are testing
// that the method invokes resolver function, before sending the
// message. We do not care how the resolver function works!
function resolveChatId(token, username, done) {
    return done(null, {
        id: userid,
        username: username.slice(1),
        // ... other props missing
    });
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


describe("sanity check dictates", function() {
    function checkOrder(fns) {
        const sorted = fns.slice().sort();
        for (let i = 0; i < sorted.length; i++) {
            should(sorted[i]).eql(fns[i]);
        }
    }
    it("emojifiedFns are alphabetically ordered", function() {
        const fns = Tgfancy.internals.emojifiedFns.map(function(fn) {
            return fn[0];
        });
        checkOrder(fns);
    });
    it("queuedSendFns are alphabetically ordered", function() {
        const fns = Tgfancy.internals.queuedSendFns;
        checkOrder(fns);
    });
    it("resolveChatIdFns are alphabetically ordered", function() {
        const fns = Tgfancy.internals.resolveChatIdFns.map(function(fn) {
            return fn[0];
        });
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


describe("Chat-ID Resolution (using Tgfancy#sendMessage())", function() {
    this.timeout(timeout);
    it("resolves username", function() {
        return client.sendMessage(username, "message")
            .then(function(message) {
                should(message.chat.id).eql(userid);
            });
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


describe("Openshift Webhook", function() {
    let ip, port;

    before(function() {
        // this is a dummy URL that does NOT even know wtf is happening
        process.env.OPENSHIFT_APP_UUID = 12345;
        process.env.OPENSHIFT_APP_DNS = "http://gmugo.in/owh";
        process.env.OPENSHIFT_NODEJS_IP = ip = "127.0.0.1";
        process.env.OPENSHIFT_NODEJS_PORT = port = 9678;
        client = createClient({
            polling: true,
            tgfancy: {
                // enable the openshift-webhook fanciness
                openshiftWebHook: true,
            },
        });
    });
    after(function() {
        delete process.env.OPENSHIFT_APP_UUID;
        delete process.env.OPENSHIFT_APP_DNS;
        delete process.env.OPENSHIFT_NODEJS_IP;
        delete process.env.OPENSHIFT_NODEJS_PORT;
        client = createClient();
    });
    function triggerWebhook() {
        request.post({
            url: `http://${ip}:${port}/bot${token}`,
            body: {
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
            },
            json: true,
        }, function(error) {
            should(error).not.be.ok();
        });
    }

    it("receives message", function(done) {
        client.once("message", function() {
            return done();
        });
        process.nextTick(triggerWebhook);
    });
    it("disables polling", function() {
        should(client.options.polling).not.be.ok();
    });
});


describe.skip("Kick-without-Ban");
