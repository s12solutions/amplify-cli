"use strict";
function getCategoryPlugins(context) {
    var categoryPlugins = {};
    context.runtime.plugins.forEach(function (plugin) {
        if (plugin.pluginType === 'category') {
            categoryPlugins[plugin.pluginName] = plugin.directory;
        }
    });
    return categoryPlugins;
}
module.exports = {
    getCategoryPlugins: getCategoryPlugins,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-category-plugins.js.map