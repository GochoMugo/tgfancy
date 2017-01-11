/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating rate-limiting.
 */
/* eslint-disable no-console */


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const bot = new Tgfancy(state.token, {
    tgfancy: {
        ratelimiting: {
            notify(methodName) {
                console.log("Handling rate-limiting error from %s", methodName);
                console.log("Exiting without waiting...");
                process.exit();
            },
        },
    },
});
const longText = Array(4096 * 9 + 1).join("#");


setInterval(function() {
    bot.sendMessage(state.userId, longText)
        .catch(function(error) {
            console.error(error);
            process.exit(1);
        });
}, 5);
