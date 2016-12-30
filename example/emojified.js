/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating emojification of text
 */
/* eslint-disable no-console */



// built-in modules
const assert = require("assert");


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const bot = new Tgfancy(state.token, {
    tgfancy: {
        emojification: true,
    },
});
const emoji = ":heart:";


bot.sendMessage(state.userId, "emojify " + emoji)
    .then(function(msg) {
        assert.ok(msg.text.indexOf(emoji) === -1);
        console.log("Message sent to chat, after emojification");
    }).catch(function(error) {
        console.error(error);
        process.exit(1);
    });
