"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_collection_1 = __importDefault(require("./plugin-collection"));
var constants_1 = __importDefault(require("./constants"));
var SECONDSINADAY = 86400;
var PluginPlatform = /** @class */ (function () {
    function PluginPlatform() {
        this.pluginDirectories = [
            constants_1.default.LocalNodeModules,
            constants_1.default.ParentDirectory,
            constants_1.default.GlobalNodeModules,
        ];
        this.pluginPrefixes = [
            constants_1.default.AmplifyPrefix,
        ];
        this.userAddedLocations = [];
        this.lastScanTime = new Date();
        this.maxScanIntervalInSeconds = SECONDSINADAY;
        this.plugins = new plugin_collection_1.default();
        this.excluded = new plugin_collection_1.default();
    }
    return PluginPlatform;
}());
exports.default = PluginPlatform;
//# sourceMappingURL=../../src/lib/domain/plugin-platform.js.map