"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function twoPluginsAreTheSame(plugin0, plugin1) {
    if (plugin0.packageLocation === plugin1.packageLocation) {
        return true;
    }
    if (plugin0.packageName === plugin1.packageName &&
        plugin0.packageVersion === plugin1.packageVersion) {
        return true;
    }
    return false;
}
exports.twoPluginsAreTheSame = twoPluginsAreTheSame;
//# sourceMappingURL=../../src/lib/plugin-helpers/compare-plugins.js.map