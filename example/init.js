/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * Handles loading necessary configurations and other relevant configuration
 * details.
 */


// module variables
const token = process.env.TELEGRAM_TOKEN;
const userId = process.env.TELEGRAM_USERID;
const username = process.env.TELEGRAM_USERNAME;


if (!token) {
    console.error("Error: Telegram token is missing");
    process.exit(1);
}
if (!userId) {
    console.error("Error: Telegram User ID is missing");
    process.exit(1);
}
if (!username) {
    console.error("Error: Telegram username is missing");
    process.exit(1);
}


// defining and exporting the state that will be available to all
// examples, when they are being run
exports = module.exports = { token, userId, username };
