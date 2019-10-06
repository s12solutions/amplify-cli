"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var global_prefix_1 = __importDefault(require("global-prefix"));
function getGlobalNodeModuleDirPath() {
    var yarnPrefix = getYarnPrefix();
    if (__dirname.includes(yarnPrefix)) {
        return path_1.default.join(yarnPrefix, 'node_modules');
    }
    if (process.platform === 'win32') {
        return path_1.default.join(global_prefix_1.default, 'node_modules');
    }
    return path_1.default.join(global_prefix_1.default, 'lib', 'node_modules');
}
exports.getGlobalNodeModuleDirPath = getGlobalNodeModuleDirPath;
function getYarnPrefix() {
    var home = os_1.default.homedir();
    var yarnPrefix = path_1.default.join(home, '.config', 'yarn', 'global');
    if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
        yarnPrefix = path_1.default.join(process.env.LOCALAPPDATA, 'Yarn', 'config', 'global');
    }
    return yarnPrefix;
}
//# sourceMappingURL=../../src/lib/utils/global-prefix.js.map