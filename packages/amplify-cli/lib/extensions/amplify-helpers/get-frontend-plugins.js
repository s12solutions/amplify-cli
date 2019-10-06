"use strict";
function getFrontendPlugins(context) {
    var frontendPlugins = {};
    context.runtime.plugins.forEach(function (plugin) {
        if (plugin.pluginType === 'frontend') {
            frontendPlugins[plugin.pluginName] = plugin.directory;
        }
    });
    return frontendPlugins;
}
module.exports = {
    getFrontendPlugins: getFrontendPlugins,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-frontend-plugins.js.map