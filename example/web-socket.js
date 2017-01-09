/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating use of websocket to fetch telegram
 * updates.
 */
/* eslint-disable no-console */


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const bot = new Tgfancy(state.token, {
    tgfancy: {
        webSocket: true,
    },
});


bot.on("text", function(msg) {
    console.log(`>>> ${msg.from.first_name}: ${msg.text}`);
    const text = msg.text.split("").reverse().join("");
    bot.sendMessage(msg.chat.id, text).then(() => {
        console.log(`<<< bot: ${text}`);
    });
});
console.log("<<< bot: Send a text message to your bot");
