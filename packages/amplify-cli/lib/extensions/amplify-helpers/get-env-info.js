"use strict";
var fs = require('fs');
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function getEnvInfo() {
    var envFilePath = pathManager.getLocalEnvFilePath();
    var envInfo = {};
    if (fs.existsSync(envFilePath)) {
        envInfo = readJsonFile(envFilePath);
    }
    else {
        // EnvInfo is required by all the callers so we can safely throw here
        throw new Error('Current environment cannot be determined\nUse \'amplify init\' in the root of your app directory to initialize your project with Amplify');
    }
    return envInfo;
}
module.exports = {
    getEnvInfo: getEnvInfo,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-env-info.js.map