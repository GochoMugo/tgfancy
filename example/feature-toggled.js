/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating disabling resolution of chat IDs.
 */
/* eslint-disable no-console */


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const bot = new Tgfancy(state.token, {
    tgfancy: {
        // disabling chat ID resolution
        chatIdResolution: false,
    },
});


bot.sendMessage(state.username, "resolved username to chat ID")
    .then(function() {
        console.log("Message sent to chat, after resolution of ID");
        console.log("THIS SHOULD NOT BE HAPPENING!!!");
        process.exit(1);
    }).catch(function(error) {
        // TODO: use the 'error_code' returned in the response from API
        //       i.e. error_code === 400
        if (error.message.indexOf("chat not found") !== -1) {
            console.log("Could not send message as the username was not resolved!");
            return;
        }
        console.error(error);
        process.exit(1);
    });
