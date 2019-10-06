"use strict";
var fs = require('fs');
var pathManager = require('./path-manager');
var getEnvInfo = require('./get-env-info').getEnvInfo;
var readJsonFile = require('./read-json-file').readJsonFile;
var CATEGORIES = 'categories';
function isMigrationContext(context) {
    return 'migrationInfo' in context;
}
function getCurrentEnvName(context) {
    if (isMigrationContext(context)) {
        return context.migrationInfo.localEnvInfo.envName;
    }
    return getEnvInfo().envName;
}
function loadAllResourceParameters(context) {
    try {
        if (isMigrationContext(context)) {
            return context.migrationInfo.teamProviderInfo;
        }
        var teamProviderInfoFilePath = pathManager.getProviderInfoFilePath();
        if (fs.existsSync(teamProviderInfoFilePath)) {
            return readJsonFile(teamProviderInfoFilePath);
        }
    }
    catch (e) {
        return {};
    }
}
function getOrCreateSubObject(data, keys) {
    var currentObj = data;
    keys.forEach(function (key) {
        if (!(key in currentObj)) {
            currentObj[key] = {};
        }
        currentObj = currentObj[key];
    });
    return currentObj;
}
function removeObjectRecursively(obj, keys) {
    if (keys.length > 1) {
        var currentKey = keys[0], rest = keys.slice(1);
        if (currentKey in obj) {
            removeObjectRecursively(obj[currentKey], rest);
            if (!Object.keys(obj[currentKey]).length) {
                delete obj[currentKey];
            }
        }
    }
    else {
        var currentKey = keys[0];
        if (currentKey in obj) {
            delete obj[currentKey];
        }
    }
}
function saveAllResourceParams(context, data) {
    if (isMigrationContext(context))
        return; // no need to serialize team provider
    var teamProviderInfoFilePath = pathManager.getProviderInfoFilePath();
    fs.writeFileSync(teamProviderInfoFilePath, JSON.stringify(data, null, 4));
}
function saveEnvResourceParameters(context, category, resource, parameters) {
    var allParams = loadAllResourceParameters(context);
    var currentEnv = getCurrentEnvName(context);
    var resources = getOrCreateSubObject(allParams, [currentEnv, CATEGORIES, category]);
    resources[resource] = parameters;
    saveAllResourceParams(context, allParams);
}
function loadEnvResourceParameters(context, category, resource) {
    var allParams = loadAllResourceParameters(context);
    try {
        var currentEnv = getCurrentEnvName(context);
        return getOrCreateSubObject(allParams, [currentEnv, CATEGORIES, category, resource]);
    }
    catch (e) {
        return {};
    }
}
function removeResourceParameters(context, category, resource) {
    var allParams = loadAllResourceParameters(context);
    var currentEnv = getCurrentEnvName(context);
    removeObjectRecursively(allParams, [currentEnv, CATEGORIES, category, resource]);
    saveAllResourceParams(context, allParams);
}
module.exports = {
    loadEnvResourceParameters: loadEnvResourceParameters,
    saveEnvResourceParameters: saveEnvResourceParameters,
    removeResourceParameters: removeResourceParameters,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/envResourceParams.js.map