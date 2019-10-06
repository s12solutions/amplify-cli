"use strict";
function getPlugin(context, pluginName) {
    var result;
    var plugins = context.runtime.plugins;
    for (var i = 0; i < plugins.length; i++) {
        if (plugins[i].name === pluginName) {
            result = plugins[i].directory;
            break;
        }
    }
    return result;
}
module.exports = {
    getPlugin: getPlugin,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-plugin.js.map