"use strict";
const fs = require('fs-extra');
const pathManager = require('./path-manager');
const { readJsonFile } = require('./read-json-file');
function getAllEnvs() {
    let allEnvs = [];
    const teamProviderInfoFilePath = pathManager.getProviderInfoFilePath();
    if (fs.existsSync(teamProviderInfoFilePath)) {
        const envInfo = readJsonFile(teamProviderInfoFilePath);
        allEnvs = Object.keys(envInfo);
    }
    return allEnvs;
}
module.exports = {
    getAllEnvs,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-all-envs.js.map