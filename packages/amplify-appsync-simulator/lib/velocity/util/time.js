"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dateformat = require("dateformat");
exports.time = function (now) { return ({
    nowISO8601: function () {
        return now.toISOString();
    },
    nowEpochSeconds: function () {
        return parseInt((now.valueOf() / 1000).toString(), 10);
    },
    nowEpochMilliSeconds: function () {
        return now.valueOf();
    },
    nowFormatted: function (format, timezone) {
        if (timezone === void 0) { timezone = null; }
        if (timezone)
            throw new Error('no support for setting timezone!');
        return dateformat(now, format);
    },
    parseFormattedToEpochMilliSeconds: function () {
        throw new Error('not implemented');
    },
    parseISO8601ToEpochMilliSeconds: function () {
        throw new Error('not implemented');
    },
    epochMilliSecondsToSeconds: function () {
        throw new Error('not implemented');
    },
    epochMilliSecondsToISO8601: function () {
        throw new Error('not implemented');
    },
    epochMilliSecondsToFormatted: function () {
        throw new Error('not implemented');
    },
}); };
//# sourceMappingURL=time.js.map