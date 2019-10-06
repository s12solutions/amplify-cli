"use strict";
var ora = require('ora');
var getProviderPlugins = require('./get-provider-plugins').getProviderPlugins;
var spinner = ora('Building resources. This may take a few minutes...');
function buildResources(context, category, resourceName) {
    return context.amplify.confirmPrompt.run('Are you sure you want to continue building the resources?')
        .then(function (answer) {
        if (answer) {
            var providerPlugins_1 = getProviderPlugins(context);
            var providerPromises_1 = [];
            Object.keys(providerPlugins_1).forEach(function (provider) {
                var pluginModule = require(providerPlugins_1[provider]);
                providerPromises_1.push(pluginModule.buildResources(context, category, resourceName));
            });
            spinner.start();
            return Promise.all(providerPromises_1);
        }
    })
        .then(function () { return spinner.succeed('All resources are built.'); })
        .catch(function (err) {
        console.log(err);
        spinner.fail('An error occurred when building the resources.');
        throw err;
    });
}
module.exports = {
    buildResources: buildResources,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/build-resources.js.map