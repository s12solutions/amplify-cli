"use strict";
var fs = require('fs-extra');
var path = require('path');
var os = require('os');
var ini = require('ini');
var which = require('which');
function getGlobalNodeModuleDirPath() {
    var yarnPrefix = getYarnPrefix();
    if (__dirname.includes(yarnPrefix)) {
        return path.join(yarnPrefix, 'node_modules');
    }
    if (process.platform === 'win32') {
        return path.join(getNpmPrefix(), 'node_modules');
    }
    return path.join(getNpmPrefix(), 'lib', 'node_modules');
}
function getYarnPrefix() {
    var home = os.homedir();
    var yarnPrefix = path.join(home, '.config', 'yarn', 'global');
    if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
        yarnPrefix = path.join(process.env.LOCALAPPDATA, 'Yarn', 'config', 'global');
    }
    return yarnPrefix;
}
function getNpmPrefix() {
    var prefix;
    if (process.env.PREFIX) {
        prefix = process.env.PREFIX;
    }
    else {
        var home = os.homedir();
        if (home) {
            var userConfig = path.resolve(home, '.npmrc');
            prefix = tryConfigPath(userConfig);
        }
        if (!prefix) {
            var npm = tryNpmPath();
            if (npm) {
                var builtinConfig = path.resolve(npm, '..', '..', 'npmrc');
                prefix = tryConfigPath(builtinConfig);
                if (prefix) {
                    var globalConfig = path.resolve(prefix, 'etc', 'npmrc');
                    prefix = tryConfigPath(globalConfig) || prefix;
                }
            }
            if (!prefix) {
                prefix = fallback();
            }
        }
    }
    if (prefix) {
        return expand(prefix);
    }
}
function fallback() {
    var result;
    if (/^win/.test(process.platform)) {
        result = process.env.APPDATA
            ? path.join(process.env.APPDATA, 'npm')
            : path.dirname(process.execPath);
    }
    else {
        result = path.dirname(path.dirname(process.execPath));
        if (process.env.DESTDIR) {
            result = path.join(process.env.DESTDIR, result);
        }
    }
    return result;
}
function tryNpmPath() {
    var result;
    try {
        result = fs.realpathSync(which.sync('npm'));
    }
    catch (err) {
        result = undefined;
    }
    return result;
}
function tryConfigPath(configPath) {
    var result;
    try {
        var data = fs.readFileSync(configPath, 'utf-8');
        var config = ini.parse(data);
        if (config.prefix) {
            result = config.prefix;
        }
    }
    catch (err) {
        result = undefined;
    }
    return result;
}
function expand(filePath) {
    var home = os.homedir();
    if (filePath.charCodeAt(0) === 126 /* ~ */) {
        if (filePath.charCodeAt(1) === 43 /* + */) {
            return path.join(process.cwd(), filePath.slice(2));
        }
        return home ? path.join(home, filePath.slice(1)) : filePath;
    }
    return filePath;
}
module.exports = { getGlobalNodeModuleDirPath: getGlobalNodeModuleDirPath };
//# sourceMappingURL=../../src/lib/lib/global-prefix.js.map