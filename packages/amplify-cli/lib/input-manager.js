"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// normalize command line arguments, allow verb / noun place switch
var input_1 = __importDefault(require("./domain/input"));
var constants_1 = __importDefault(require("./domain/constants"));
var plugin_manager_1 = require("./plugin-manager");
var input_verification_result_1 = __importDefault(require("./domain/input-verification-result"));
var constants_2 = __importDefault(require("./domain/constants"));
function getCommandLineInput(pluginPlatform) {
    var result = new input_1.default(process.argv);
    /* tslint:disable */
    if (result.argv && result.argv.length > 2) {
        var index = 2;
        // pick up plugin name, allow plugin name to be in the 2nd or 3rd position
        var pluginNames = plugin_manager_1.getAllPluginNames(pluginPlatform);
        if (pluginNames.has(result.argv[2])) {
            result.plugin = result.argv[2];
            index = 3;
        }
        else if (result.argv.length > 3 && pluginNames.has(result.argv[3])) {
            result.plugin = result.argv[3];
            result.argv[3] = result.argv[2];
            result.argv[2] = result.plugin;
            index = 3;
        }
        // pick up command
        if (result.argv.length > index && !/^-/.test(result.argv[index])) {
            result.command = result.argv[index];
            index += 1;
        }
        // pick up subcommands
        while (result.argv.length > index && !/^-/.test(result.argv[index])) {
            result.subCommands = result.subCommands || new Array();
            result.subCommands.push(result.argv[index]);
            index += 1;
        }
        // pick up options
        while (result.argv.length > index) {
            result.options = result.options || {};
            if (/^-/.test(result.argv[index])) {
                var key = result.argv[index].replace(/^-+/, '');
                index += 1;
                if (result.argv.length > index && !/^-/.test(result.argv[index])) {
                    result.options[key] = result.argv[index];
                    index += 1;
                }
                else {
                    result.options[key] = true;
                }
            }
            else {
                var key = result.argv[index];
                index += 1;
                result.options[key] = true;
            }
        }
    }
    /* tslint:enable */
    return result;
}
exports.getCommandLineInput = getCommandLineInput;
function normailizeInput(input) {
    // -v --version => version command
    // -h --help => help command
    // -y --yes => yes option
    if (input.options) {
        if (input.options[constants_1.default.VERSION] || input.options[constants_1.default.VERSION_SHORT]) {
            input.options[constants_1.default.VERSION] = true;
            delete input.options[constants_1.default.VERSION_SHORT];
        }
        if (input.options[constants_1.default.HELP] || input.options[constants_1.default.HELP_SHORT]) {
            input.options[constants_1.default.HELP] = true;
            delete input.options[constants_1.default.HELP_SHORT];
        }
        if (input.options[constants_1.default.YES] || input.options[constants_1.default.YES_SHORT]) {
            input.options[constants_1.default.YES] = true;
            delete input.options[constants_1.default.YES_SHORT];
        }
    }
    input.command = input.command || constants_1.default.PLUGIN_DEFAULT_COMMAND;
    return input;
}
function verifyInput(pluginPlatform, input) {
    var result = new input_verification_result_1.default();
    input.plugin = input.plugin || constants_2.default.CORE;
    normailizeInput(input);
    var pluginCandidates = plugin_manager_1.getPluginsWithName(pluginPlatform, input.plugin);
    if (pluginCandidates.length > 0) {
        for (var i = 0; i < pluginCandidates.length; i++) {
            var _a = pluginCandidates[i].manifest, name_1 = _a.name, commands = _a.commands, commandAliases = _a.commandAliases;
            if ((commands && commands.includes(constants_1.default.HELP)) ||
                (commandAliases && Object.keys(commandAliases).includes(constants_1.default.HELP))) {
                result.helpCommandAvailable = true;
            }
            if ((commands && commands.includes(input.command))) {
                result.verified = true;
                break;
            }
            if (commandAliases && Object.keys(commandAliases).includes(input.command)) {
                input.command = commandAliases[input.command];
                result.verified = true;
                break;
            }
            if (input.command === constants_1.default.PLUGIN_DEFAULT_COMMAND) {
                if (commands && commands.includes(name_1)) {
                    input.command = name_1;
                    result.verified = true;
                    break;
                }
                if (input.options && input.options[constants_1.default.VERSION] &&
                    commands && commands.includes(constants_1.default.VERSION)) {
                    input.command = constants_1.default.VERSION;
                    result.verified = true;
                    break;
                }
                if (input.options && input.options[constants_1.default.HELP] &&
                    commands && commands.includes(constants_1.default.HELP)) {
                    input.command = constants_1.default.HELP;
                    result.verified = true;
                    break;
                }
                // as a fall back, use the help command
                if (commands && commands.includes(constants_1.default.HELP)) {
                    input.command = constants_1.default.HELP;
                    result.verified = true;
                    break;
                }
            }
        }
        if (!result.verified) {
            var commandString = input.plugin === constants_2.default.CORE ? '' : input.plugin;
            if (input.command !== constants_1.default.PLUGIN_DEFAULT_COMMAND) {
                commandString += ' ' + input.command;
            }
            if (input.subCommands) {
                commandString += ' ' + input.subCommands.join(' ');
            }
            result.message = "The Amplify CLI can NOT find command: " + commandString;
        }
    }
    else {
        result.verified = false;
        result.message = "The Amplify CLI can NOT find any plugin with name: " + input.plugin;
    }
    return result;
}
exports.verifyInput = verifyInput;
//# sourceMappingURL=../src/lib/input-manager.js.map