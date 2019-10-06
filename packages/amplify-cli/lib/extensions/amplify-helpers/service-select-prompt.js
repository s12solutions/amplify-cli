"use strict";
var inquirer = require('inquirer');
var getProjectConfig = require('./get-project-config').getProjectConfig;
var getProviderPlugins = require('./get-provider-plugins').getProviderPlugins;
function filterServicesByEnabledProviders(context, enabledProviders, supportedServices) {
    var providerPlugins = getProviderPlugins(context);
    var filteredServices = [];
    Object.keys(supportedServices).forEach(function (service) {
        if (enabledProviders.includes(supportedServices[service].provider)) {
            filteredServices.push({
                service: service,
                providerPlugin: providerPlugins[supportedServices[service].provider],
                providerName: supportedServices[service].provider,
                alias: supportedServices[service].alias,
            });
        }
    });
    return filteredServices;
}
function serviceQuestionWalkthrough(context, supportedServices, category) {
    var options = [];
    for (var i = 0; i < supportedServices.length; i += 1) {
        var optionName = supportedServices[i].alias || supportedServices[i].providerName + ":" + supportedServices[i].service;
        options.push({
            name: optionName,
            value: {
                provider: supportedServices[i].providerPlugin,
                service: supportedServices[i].service,
                providerName: supportedServices[i].providerName,
            },
        });
    }
    if (options.length === 0) {
        context.print.error("No services defined by configured providers for category: " + category);
        process.exit(1);
    }
    if (options.length === 1) {
        // No need to ask questions
        context.print.info("Using service: " + options[0].value.service + ", provided by: " + options[0].value.providerName);
        return new Promise(function (resolve) {
            resolve(options[0].value);
        });
    }
    var question = [{
            name: 'service',
            message: 'Please select from one of the below mentioned services',
            type: 'list',
            choices: options,
        }];
    return inquirer.prompt(question)
        .then(function (answer) { return answer.service; });
}
function serviceSelectionPrompt(context, category, supportedServices) {
    var providers = getProjectConfig().providers;
    supportedServices = filterServicesByEnabledProviders(context, providers, supportedServices);
    return serviceQuestionWalkthrough(context, supportedServices, category);
}
module.exports = {
    serviceSelectionPrompt: serviceSelectionPrompt,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/service-select-prompt.js.map