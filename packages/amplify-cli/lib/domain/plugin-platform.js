"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_collection_1 = require("./plugin-collection");
const constants_1 = require("./constants");
const SECONDSINADAY = 86400;
class PluginPlatform {
    constructor() {
        this.pluginDirectories = [constants_1.constants.LocalNodeModules, constants_1.constants.ParentDirectory, constants_1.constants.GlobalNodeModules];
        this.pluginPrefixes = [constants_1.constants.AmplifyPrefix];
        this.userAddedLocations = [];
        this.lastScanTime = new Date();
        this.maxScanIntervalInSeconds = SECONDSINADAY;
        this.plugins = new plugin_collection_1.PluginCollection();
        this.excluded = new plugin_collection_1.PluginCollection();
    }
}
exports.PluginPlatform = PluginPlatform;
//# sourceMappingURL=../../src/lib/domain/plugin-platform.js.map