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
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const pluginName = 'mock';
function executeAmplifyCommand(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let commandPath = path.normalize(path.join(__dirname, '../commands'));
        commandPath = path.join(commandPath, pluginName, context.input.command);
        const commandModule = require(commandPath);
        yield commandModule.run(context);
    });
}
exports.executeAmplifyCommand = executeAmplifyCommand;
function handleAmplifyEvent(context, args) {
    return __awaiter(this, void 0, void 0, function* () {
        context.print.info(`${pluginName} handleAmplifyEvent to be implemented`);
        context.print.info(`Received event args ${args}`);
    });
}
exports.handleAmplifyEvent = handleAmplifyEvent;
//# sourceMappingURL=amplify-plugin-index.js.map