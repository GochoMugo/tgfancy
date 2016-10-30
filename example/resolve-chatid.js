/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating resolving chat IDs, in this case,
 * our username.
 */
/* eslint-disable no-console */


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const bot = new Tgfancy(state.token);


bot.sendMessage(state.username, "resolved username to chat ID")
    .then(function() {
        console.log("Message sent to chat, after resolution of ID");
    }).catch(function(error) {
        console.error(error);
    });
