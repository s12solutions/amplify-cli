"use strict";
var print = require('./print');
var figlet = require('figlet');
var cliConstants = require('./constants');
function showHelp(header, commands) {
    figlet.text(cliConstants.BrandName, {
        font: 'ANSI Shadow',
    }, function (err, data) {
        if (!err) {
            print.info(data);
        }
        print.info(header);
        print.info('');
        var tableOptions = [];
        for (var i = 0; i < commands.length; i += 1) {
            tableOptions.push([commands[i].name, commands[i].description]);
        }
        var table = print.table;
        table(tableOptions, { format: 'default' });
    });
}
module.exports = {
    showHelp: showHelp,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/show-help.js.map