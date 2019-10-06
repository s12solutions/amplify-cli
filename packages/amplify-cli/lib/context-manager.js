"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = __importDefault(require("./domain/context"));
var context_extensions_1 = require("./context-extensions");
function constructContext(pluginPlatform, input) {
    var context = new context_1.default(pluginPlatform, input);
    context_extensions_1.attachExtentions(context);
    return context;
}
exports.constructContext = constructContext;
function persistContext(context) {
    // write to the backend and current backend
    // and get the frontend plugin to write to the config files.
}
exports.persistContext = persistContext;
//# sourceMappingURL=../src/lib/context-manager.js.map