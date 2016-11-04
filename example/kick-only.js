/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * An example demonstrating just kicking a user, without
 * banning them.
 */
/* eslint-disable no-console */


// own modules
const Tgfancy = require("..");
const state = require("./init");


// module variables
const args = process.argv.slice(2);
const bot = new Tgfancy(state.token);
const userId =  args.shift();
const groupId = args.shift() || process.env.TELEGRAM_GROUPID;


// ensure all the parameters have been provided
if (!groupId || !userId) {
    console.error("Error: missing parameters");
    console.log([
        "\nusage: userId [groupId]",
        "\n\tuserId: ID of user to kick",
        "\tgroupId: ID of group to use; May be omitted if",
        "\t\tenv. var. TELEGRAM_GROUPID is defined",
    ].join("\n"));
    process.exit(1);
}


// we pass 'false' as the last parameter to signify
// that we do not want to ban the user
bot.kickChatMember(groupId, userId, false)
    .then(function(messages) { // eslint-disable-line no-unused-vars
        // 'messages' is an Array of the Message entities
        // returned by the Telegram API, after kicking and
        // unbanning user.
        console.log("User kicked but not banned.");
    }).catch(function(error) {
        console.error(error);
        process.exit(1);
    });
