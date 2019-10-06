"use strict";
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function getResourceOutputs(amplifyMeta) {
    if (!amplifyMeta) {
        var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
        amplifyMeta = readJsonFile(amplifyMetaFilePath);
    }
    // Build the provider object
    var outputsByProvider = {};
    var outputsByCategory = {};
    var outputsForFrontend = {
        metadata: {},
        serviceResourceMapping: {},
    };
    if (amplifyMeta.providers) {
        Object.keys(amplifyMeta.providers).forEach(function (provider) {
            outputsByProvider[provider] = {};
            outputsByProvider[provider].metadata = amplifyMeta.providers[provider] || {};
            outputsByProvider[provider].serviceResourceMapping = {};
        });
    }
    if (amplifyMeta) {
        Object.keys(amplifyMeta).forEach(function (category) {
            var categoryMeta = amplifyMeta[category];
            Object.keys(categoryMeta).forEach(function (resourceName) {
                var resourceMeta = categoryMeta[resourceName];
                if (resourceMeta.output && resourceMeta.lastPushTimeStamp) {
                    var providerPlugin = resourceMeta.providerPlugin;
                    if (!outputsByProvider[providerPlugin]) {
                        outputsByProvider[providerPlugin] = {
                            metadata: {},
                            serviceResourceMapping: {},
                        };
                    }
                    if (!outputsByProvider[providerPlugin].serviceResourceMapping[resourceMeta.service]) {
                        outputsByProvider[providerPlugin].serviceResourceMapping[resourceMeta.service] = [];
                    }
                    /*eslint-disable*/
                    outputsByProvider[providerPlugin].serviceResourceMapping[resourceMeta.service].push(resourceMeta);
                    /* eslint-enable */
                    if (!outputsByCategory[category]) {
                        outputsByCategory[category] = {};
                    }
                    if (resourceMeta.service) {
                        resourceMeta.output.service = resourceMeta.service;
                    }
                    outputsByCategory[category][resourceName] = resourceMeta.output;
                    // for frontend configuration file generation
                    if (!outputsForFrontend.serviceResourceMapping[resourceMeta.service]) {
                        outputsForFrontend.serviceResourceMapping[resourceMeta.service] = [];
                    }
                    resourceMeta.resourceName = resourceName;
                    outputsForFrontend.serviceResourceMapping[resourceMeta.service].push(resourceMeta);
                }
            });
        });
    }
    if (outputsByProvider.awscloudformation) {
        outputsForFrontend.metadata = outputsByProvider.awscloudformation.metadata;
    }
    if (amplifyMeta && amplifyMeta.testMode) {
        outputsForFrontend.testMode = true;
    }
    return { outputsByProvider: outputsByProvider, outputsByCategory: outputsByCategory, outputsForFrontend: outputsForFrontend };
}
module.exports = {
    getResourceOutputs: getResourceOutputs,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-resource-outputs.js.map