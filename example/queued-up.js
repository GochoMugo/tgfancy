/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating queueing of sending functions.
 */


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const bot = new Tgfancy(state.token);


function toLog(message) {
    return function() { console.log(message); };
};


bot.sendMessage(state.userId, "first message").then(toLog("first sent"));
bot.sendMessage(state.userId, "second message").then(toLog("second sent"));
setTimeout(function() {
    bot.sendMessage(state.userId, "third message").then(toLog("third sent"));
}, 2000);
