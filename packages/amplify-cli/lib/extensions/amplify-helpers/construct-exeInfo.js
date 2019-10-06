"use strict";
var getProjectDetails = require('./get-project-details').getProjectDetails;
function constructExeInfo(context) {
    context.exeInfo = getProjectDetails();
    context.exeInfo.inputParams = {};
    Object.keys(context.parameters.options).forEach(function (key) {
        var normalizedKey = normalizeKey(key);
        context.exeInfo.inputParams[normalizedKey] = JSON.parse(context.parameters.options[key]);
    });
}
function normalizeKey(key) {
    if (key === 'y') {
        key = 'yes';
    }
    return key;
}
module.exports = {
    constructExeInfo: constructExeInfo,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/construct-exeInfo.js.map