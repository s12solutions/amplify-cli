"use strict";
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function getProjectConfig() {
    var projectConfigFilePath = pathManager.getProjectConfigFilePath();
    var projectConfig = readJsonFile(projectConfigFilePath);
    return projectConfig;
}
module.exports = {
    getProjectConfig: getProjectConfig,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-project-config.js.map