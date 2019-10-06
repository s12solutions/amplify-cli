"use strict";
var fs = require('fs-extra');
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function updateProjectConfig(projectPath, label, data) {
    var projectConfig;
    var projectConfigFilePath = pathManager.getProjectConfigFilePath(projectPath);
    if (fs.existsSync(projectConfigFilePath)) {
        projectConfig = readJsonFile(projectConfigFilePath);
    }
    else {
        projectConfig = {};
    }
    projectConfig[label] = data;
    var jsonString = JSON.stringify(projectConfig, null, 4);
    fs.writeFileSync(projectConfigFilePath, jsonString, 'utf8');
}
module.exports = {
    updateProjectConfig: updateProjectConfig,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/update-project-config.js.map