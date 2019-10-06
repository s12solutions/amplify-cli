"use strict";
function getCategoryPlugins(context) {
    var categoryPlugins = [];
    context.runtime.plugins.forEach(function (plugin) {
        if (plugin.pluginType === 'category') {
            categoryPlugins.push(plugin.pluginName);
        }
    });
    return categoryPlugins;
}
function listCategories(context) {
    var categoryPlugins = getCategoryPlugins(context);
    var table = context.print.table;
    var tableOptions = [['Category']];
    for (var i = 0; i < categoryPlugins.length; i += 1) {
        tableOptions.push([categoryPlugins[i]]);
    }
    table(tableOptions, { format: 'markdown' });
}
module.exports = {
    listCategories: listCategories,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/list-categories.js.map