"use strict";
var fs = require('fs');
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function getEnvDetails() {
    var envProviderFilePath = pathManager.getProviderInfoFilePath();
    var envProviderInfo = {};
    if (fs.existsSync(envProviderFilePath)) {
        envProviderInfo = readJsonFile(envProviderFilePath);
    }
    return envProviderInfo;
}
module.exports = {
    getEnvDetails: getEnvDetails,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-env-details.js.map