/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating queueing of sending functions.
 */


// own modules
const Tgfancy = require("..");


// module variables
const token = process.env.TELEGRAM_TOKEN;
const userId = process.env.TELEGRAM_ME;
let bot;


if (!token) {
    console.error("Error: Telegram token is missing");
    process.exit(1);
}
if (!userId) {
    console.error("Error: Telegram User ID is missing");
    process.exit(1);
}


function toLog(message) { return function() { console.log(message); };  };

bot = new Tgfancy(token);
bot.sendMessage(userId, "first message").then(toLog("first sent"));
bot.sendMessage(userId, "second message").then(toLog("second sent"));
setTimeout(function() {
    bot.sendMessage(userId, "third message").then(toLog("third sent"));
}, 2000);
