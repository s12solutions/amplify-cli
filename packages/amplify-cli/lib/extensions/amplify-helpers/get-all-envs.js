"use strict";
var fs = require('fs-extra');
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function getAllEnvs() {
    var allEnvs = [];
    var teamProviderInfoFilePath = pathManager.getProviderInfoFilePath();
    if (fs.existsSync(teamProviderInfoFilePath)) {
        var envInfo = readJsonFile(teamProviderInfoFilePath);
        allEnvs = Object.keys(envInfo);
    }
    return allEnvs;
}
module.exports = {
    getAllEnvs: getAllEnvs,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-all-envs.js.map