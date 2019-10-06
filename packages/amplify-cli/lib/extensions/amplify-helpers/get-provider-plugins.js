"use strict";
function getProviderPlugins(context) {
    var providers = {};
    context.runtime.plugins.forEach(function (plugin) {
        if (plugin.pluginType === 'provider') {
            providers[plugin.pluginName] = plugin.directory;
        }
    });
    return providers;
}
module.exports = {
    getProviderPlugins: getProviderPlugins,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-provider-plugins.js.map