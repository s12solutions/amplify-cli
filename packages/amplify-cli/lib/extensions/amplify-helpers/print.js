"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var colors = require('colors/safe');
var CLITable = require('cli-table3');
colors.setTheme({
    highlight: 'cyan',
    info: 'reset',
    warning: 'yellow',
    success: 'green',
    error: 'red',
    line: 'grey',
    muted: 'grey',
});
function info(message) {
    console.log(colors.info(message));
}
function warning(message) {
    console.log(colors.warning(message));
}
function error(message) {
    console.log(colors.error(message));
}
function success(message) {
    console.log(colors.success(message));
}
function debug(message, title) {
    if (title === void 0) { title = 'DEBUG'; }
    var topLine = "vvv -----[ " + title + " ]----- vvv";
    var botLine = "^^^ -----[ " + title + " ]----- ^^^";
    console.log(colors.rainbow(topLine));
    console.log(message);
    console.log(colors.rainbow(botLine));
}
function table(data, options) {
    if (options === void 0) { options = {}; }
    var t;
    switch (options.format) {
        case 'markdown': {
            var header = data.shift();
            t = new CLITable({
                head: header,
                chars: CLI_TABLE_MARKDOWN,
            });
            t.push.apply(t, data);
            t.unshift(columnHeaderDivider(t));
            break;
        }
        case 'lean': {
            t = new CLITable();
            t.push.apply(t, data);
            break;
        }
        default: {
            t = new CLITable({
                chars: CLI_TABLE_COMPACT,
            });
            t.push.apply(t, data);
        }
    }
    console.log(t.toString());
}
function columnHeaderDivider(cliTable) {
    return findWidths(cliTable).map(function (w) { return Array(w).join('-'); });
}
function findWidths(cliTable) {
    return [(cliTable).options.head]
        .concat(getRows(cliTable))
        .reduce(function (colWidths, row) { return row.map(function (str, i) { return Math.max(("" + str).length + 1, colWidths[i] || 1); }); }, []);
}
function getRows(cliTable) {
    var list = new Array(cliTable.length);
    for (var i = 0; i < cliTable.length; i++) {
        list[i] = cliTable[i];
    }
    return list;
}
var CLI_TABLE_COMPACT = {
    top: '',
    'top-mid': '',
    'top-left': '',
    'top-right': '',
    bottom: '',
    'bottom-mid': '',
    'bottom-left': '',
    'bottom-right': '',
    left: ' ',
    'left-mid': '',
    mid: '',
    'mid-mid': '',
    right: '',
    'right-mid': '',
    middle: ' ',
};
var CLI_TABLE_MARKDOWN = __assign(__assign({}, CLI_TABLE_COMPACT), { left: '|', right: '|', middle: '|' });
module.exports = {
    info: info,
    warning: warning,
    error: error,
    success: success,
    table: table,
    debug: debug,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/print.js.map