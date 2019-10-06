"use strict";
function getPluginInstance(context, pluginName) {
    var result;
    var pluginInfo;
    if (context.pluginPlatform.plugins[pluginName] &&
        context.pluginPlatform.plugins[pluginName].length > 0) {
        /* eslint-disable */
        pluginInfo = context.pluginPlatform.plugins[pluginName][0];
        /* eslint-enable */
    }
    if (pluginInfo) {
        result = require(pluginInfo.packageLocation);
    }
    return result;
}
module.exports = {
    getPluginInstance: getPluginInstance,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-plugin-instance.js.map