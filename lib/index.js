/**
 * The MIT License (MIT)
 * Copyright (c) 2016 GochoMugo <mugo@forfuture.co.ke>
 *
 * tgfancy: A Fancy, Higher-Level Wrapper for Telegram Bot API
 */


// own modules
const client = require("./client");
const pkg = require("../package.json");


function exportConst(key, value) {
    Object.defineProperty(exports, key, {
        value,
    });
}


exports = module.exports = client;
exportConst("NAME", pkg.name);
exportConst("VERSION", pkg.version);
