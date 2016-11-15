/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * Tests.
 */
/* eslint-disable no-console */


// npm-installed modules
const should = require("should");


// own modules
const TelegramBot = require("node-telegram-bot-api");
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
const client = new Tgfancy(token, {
    tgfancy: {
        resolveChatId,
    },
});
const timeout = 15 * 1000; // 15 secs


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


describe.skip("Kick-without-Ban");
