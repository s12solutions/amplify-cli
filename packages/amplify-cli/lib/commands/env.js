"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var path = require('path');
var featureName = 'env';
module.exports = {
    name: featureName,
    run: function (context) { return __awaiter(void 0, void 0, void 0, function () {
        var subCommands, subcommand, commandModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subCommands = context.input.subCommands;
                    subcommand = 'help';
                    if (subCommands && subCommands.length > 0) {
                        /* eslint-disable */
                        subcommand = subCommands[0];
                        /* eslint-enable */
                    }
                    shiftParams(context);
                    if (!(subcommand === 'help')) return [3 /*break*/, 1];
                    displayHelp(context);
                    return [3 /*break*/, 3];
                case 1:
                    commandModule = void 0;
                    try {
                        commandModule = require(path.normalize(path.join(__dirname, 'env', subcommand)));
                    }
                    catch (e) {
                        displayHelp(context);
                    }
                    if (!commandModule) return [3 /*break*/, 3];
                    return [4 /*yield*/, commandModule.run(context)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); },
};
function shiftParams(context) {
    delete context.parameters.first;
    delete context.parameters.second;
    delete context.parameters.third;
    var subCommands = context.input.subCommands;
    /* eslint-disable */
    if (subCommands && subCommands.length > 1) {
        if (subCommands.length > 1) {
            context.parameters.first = (subCommands)[1];
        }
        if (subCommands.length > 2) {
            context.parameters.second = (subCommands)[2];
        }
        if (subCommands.length > 3) {
            context.parameters.third = (subCommands)[3];
        }
    }
    /* eslint-enable */
}
function displayHelp(context) {
    var header = "amplify " + featureName + " <subcommands>";
    var commands = [
        {
            name: 'add',
            description: 'Adds a new environment to your Amplify Project',
        },
        {
            name: 'pull [--restore]',
            description: 'Pulls your environment with the current cloud environment. Use the restore flag to overwrite your local backend configs with that of the cloud.',
        },
        {
            name: 'checkout <env-name> [--restore]',
            description: 'Moves your environment to the environment specified in the command. Use the restore flag to overwrite your local backend configs with the backend configs of the environment specified.',
        },
        {
            name: 'list [--details] [--json]',
            description: 'Displays a list of all the environments in your Amplify project',
        },
        {
            name: 'get --name <env-name> [--json]',
            description: 'Displays the details of the environment specified in the command',
        },
        {
            name: 'import --name <env-name> --config <provider-configs> [--awsInfo <aws-configs>]',
            description: 'Imports an already existing Amplify project environment stack to your local backend',
        },
        {
            name: 'remove <env-name>',
            description: 'Removes an environment from the Amplify project',
        },
    ];
    context.amplify.showHelp(header, commands);
    context.print.info('');
}
//# sourceMappingURL=../../src/lib/commands/env.js.map