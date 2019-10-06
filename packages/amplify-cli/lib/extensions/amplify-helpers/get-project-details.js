"use strict";
var fs = require('fs-extra');
var pathManager = require('./path-manager');
var getEnvInfo = require('./get-env-info').getEnvInfo;
var readJsonFile = require('./read-json-file').readJsonFile;
function getProjectDetails() {
    var projectConfigFilePath = pathManager.getProjectConfigFilePath();
    var projectConfig = readJsonFile(projectConfigFilePath);
    var amplifyMeta = {};
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    if (fs.existsSync(amplifyMetaFilePath)) {
        amplifyMeta = readJsonFile(amplifyMetaFilePath);
    }
    var localEnvInfo = getEnvInfo();
    var teamProviderInfo = {};
    var teamProviderFilePath = pathManager.getProviderInfoFilePath();
    if (fs.existsSync(teamProviderFilePath)) {
        teamProviderInfo = readJsonFile(teamProviderFilePath);
    }
    return {
        projectConfig: projectConfig,
        amplifyMeta: amplifyMeta,
        localEnvInfo: localEnvInfo,
        teamProviderInfo: teamProviderInfo,
    };
}
module.exports = {
    getProjectDetails: getProjectDetails,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-project-details.js.map