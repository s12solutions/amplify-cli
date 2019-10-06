"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = __importDefault(require("util"));
var defaultIndentationStr = '  ';
function displaySimpleString(context, title, contents, indentation) {
    if (indentation === void 0) { indentation = 0; }
    var indentationStr = createIndentation(indentation);
    context.print.blue("" + indentationStr + title + ":");
    context.print.info("" + indentationStr + defaultIndentationStr + contents);
}
exports.displaySimpleString = displaySimpleString;
function displayStringArray(context, title, contents, indentation) {
    if (indentation === void 0) { indentation = 0; }
    var indentationStr = createIndentation(indentation);
    context.print.blue("" + indentationStr + title + ":");
    contents.forEach(function (strItem) {
        context.print.info("" + indentationStr + defaultIndentationStr + strItem);
    });
}
exports.displayStringArray = displayStringArray;
function displayPluginDirectories(context, pluginPlatform) {
    context.print.info('');
    displayStringArray(context, 'Directories where the CLI scans for plugins:', pluginPlatform.pluginDirectories);
    context.print.info('');
}
exports.displayPluginDirectories = displayPluginDirectories;
function displayPrefixes(context, pluginPlatform) {
    context.print.info('');
    displayStringArray(context, 'Plugin name prefixes for the CLI to search for:', pluginPlatform.pluginPrefixes);
    context.print.info('');
}
exports.displayPrefixes = displayPrefixes;
function displayScanInterval(context, pluginPlatform) {
    context.print.info('');
    displaySimpleString(context, 'Automatic plugin scan interval in seconds', pluginPlatform.maxScanIntervalInSeconds.toString());
    context.print.info('');
}
exports.displayScanInterval = displayScanInterval;
function displayConfiguration(context, pluginPlatform) {
    context.print.info('');
    displayStringArray(context, 'Directories for plugin scan', pluginPlatform.pluginDirectories);
    displayStringArray(context, 'Prefixes for plugin scan', pluginPlatform.pluginPrefixes);
    displaySimpleString(context, 'Automatic plugin scan interval in seconds', pluginPlatform.maxScanIntervalInSeconds.toString());
    context.print.info('');
}
exports.displayConfiguration = displayConfiguration;
function displayGeneralInfo(context, pluginPlatform) {
    context.print.info('');
    displayStringArray(context, 'Directories for plugin scan', pluginPlatform.pluginDirectories);
    displayStringArray(context, 'Prefixes for plugin scan', pluginPlatform.pluginPrefixes);
    displayStringArray(context, 'Manually added plugins', pluginPlatform.userAddedLocations);
    displaySimpleString(context, 'Automatic plugin scan interval in seconds', pluginPlatform.maxScanIntervalInSeconds.toString());
    displaySimpleString(context, 'Last scan time stamp', pluginPlatform.lastScanTime.toString());
    context.print.info('');
}
exports.displayGeneralInfo = displayGeneralInfo;
function displayPluginPlatform(context, pluginPlatform) {
    displayGeneralInfo(context, pluginPlatform);
    displayPluginCollection(context, pluginPlatform.plugins, 'active plugin');
    displayPluginCollection(context, pluginPlatform.excluded, 'excluded plugin');
}
exports.displayPluginPlatform = displayPluginPlatform;
function displayPluginCollection(context, pluginCollection, group) {
    if (group === void 0) { group = ''; }
    Object.keys(pluginCollection).forEach(function (key) {
        displayPluginInfoArray(context, pluginCollection[key], group);
    });
}
exports.displayPluginCollection = displayPluginCollection;
function displayPluginInfoArray(context, pluginInfoArray, group) {
    if (group === void 0) { group = ''; }
    pluginInfoArray.forEach(function (pluginInfo) {
        displayPluginInfo(context, pluginInfo, group);
    });
}
exports.displayPluginInfoArray = displayPluginInfoArray;
function displayPluginInfo(context, pluginInfo, group) {
    if (group === void 0) { group = ''; }
    var manifest = pluginInfo.manifest, packageName = pluginInfo.packageName, packageVersion = pluginInfo.packageVersion;
    var title = manifest.name + ": " + packageName + "@" + packageVersion;
    context.print.info('');
    if (group.length > 0) {
        context.print.red(group);
    }
    context.print.blue(title);
    context.print.info(util_1.default.inspect(pluginInfo, undefined, Infinity));
    context.print.info('');
}
exports.displayPluginInfo = displayPluginInfo;
function createIndentation(spaceCount) {
    if (spaceCount === 0) {
        return '';
    }
    var charArray = [' '];
    // tslint:disable-next-line
    while ((charArray.length * 2) <= spaceCount) {
        charArray = charArray.concat(charArray);
    }
    if (charArray.length < spaceCount) {
        charArray = charArray.concat(charArray.slice(0, spaceCount - charArray.length));
    }
    return charArray.join('');
}
exports.createIndentation = createIndentation;
//# sourceMappingURL=../../src/lib/plugin-helpers/display-plugin-platform.js.map