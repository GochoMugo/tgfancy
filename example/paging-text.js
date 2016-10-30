/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating paging of text in sendMessage().
 */
/* eslint-disable no-console */


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const bot = new Tgfancy(state.token);
const longText = Array(4096 * 3 + 1).join("#");


bot.sendMessage(state.userId, longText)
    .then(function(messages) {
        console.log("Long message has been set in %d 'pages'", messages.length);
    }).catch(function(error) {
        console.error("Error: %s\n%j", error, error);
    });
