"use strict";
var fs = require('fs-extra');
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function updateBackendConfigAfterResourceAdd(category, resourceName, options) {
    var backendConfigFilePath = pathManager.getBackendConfigFilePath();
    var backendConfig = readJsonFile(backendConfigFilePath);
    if (!backendConfig[category]) {
        backendConfig[category] = {};
    }
    if (!backendConfig[category][resourceName]) {
        backendConfig[category][resourceName] = {};
        backendConfig[category][resourceName] = options;
        var jsonString = JSON.stringify(backendConfig, null, '\t');
        fs.writeFileSync(backendConfigFilePath, jsonString, 'utf8');
    }
}
function updateBackendConfigDependsOn(category, resourceName, attribute, value) {
    var backendConfigFilePath = pathManager.getBackendConfigFilePath();
    var backendConfig = readJsonFile(backendConfigFilePath);
    if (!backendConfig[category]) {
        backendConfig[category] = {};
        backendConfig[category][resourceName] = {};
    }
    else if (!backendConfig[category][resourceName]) {
        backendConfig[category][resourceName] = {};
    }
    backendConfig[category][resourceName][attribute] = value;
    var jsonString = JSON.stringify(backendConfig, null, 4);
    fs.writeFileSync(backendConfigFilePath, jsonString, 'utf8');
}
function updateBackendConfigAfterResourceRemove(category, resourceName) {
    var backendConfigFilePath = pathManager.getBackendConfigFilePath();
    var backendConfig = readJsonFile(backendConfigFilePath);
    if (backendConfig[category]
        && backendConfig[category][resourceName] !== undefined) {
        delete backendConfig[category][resourceName];
    }
    var jsonString = JSON.stringify(backendConfig, null, '\t');
    fs.writeFileSync(backendConfigFilePath, jsonString, 'utf8');
}
module.exports = {
    updateBackendConfigAfterResourceAdd: updateBackendConfigAfterResourceAdd,
    updateBackendConfigAfterResourceRemove: updateBackendConfigAfterResourceRemove,
    updateBackendConfigDependsOn: updateBackendConfigDependsOn,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/update-backend-config.js.map