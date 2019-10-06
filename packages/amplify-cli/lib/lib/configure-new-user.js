"use strict";
var inquirer = require('inquirer');
var sequential = require('promise-sequential');
var getProviderPlugins = require('../extensions/amplify-helpers/get-provider-plugins').getProviderPlugins;
function run(context) {
    var providerPlugins = getProviderPlugins(context);
    var providerPluginNames = Object.keys(providerPlugins);
    var providerSelection = {
        type: 'checkbox',
        name: 'selectedProviders',
        message: 'Select the backend providers.',
        choices: providerPluginNames,
    };
    var selectProviders = providerPluginNames.length === 1 ?
        Promise.resolve({ selectedProviders: providerPluginNames }) :
        inquirer.prompt(providerSelection);
    return selectProviders
        .then(function (answers) {
        var configTasks = [];
        answers.selectedProviders.forEach(function (providerKey) {
            var provider = require(providerPlugins[providerKey]);
            configTasks.push(function () { return provider.configureNewUser(context); });
        });
        return sequential(configTasks)
            .catch(function (err) {
            throw err;
        });
    });
}
module.exports = {
    run: run,
};
//# sourceMappingURL=../../src/lib/lib/configure-new-user.js.map