"use strict";

const WS = require("ws");

const DEFAULT_BRIDGE_URL = "wss://telegram-websocket-bridge-qalwkrjzzs.now.sh";

module.exports = (token, options, callback) => {
    options.url = options.url || DEFAULT_BRIDGE_URL;

    const ws = new WS(`${options.url}/${token}`);
    ws.on("message", json => {
        const obj = JSON.parse(json);
        callback(obj);
    });

    return ws;
};
