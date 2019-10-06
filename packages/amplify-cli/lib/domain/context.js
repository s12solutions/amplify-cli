"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var amplify_toolkit_1 = __importDefault(require("./amplify-toolkit"));
var Context = /** @class */ (function () {
    function Context(pluginPlatform, input) {
        this.pluginPlatform = pluginPlatform;
        this.input = input;
        this.amplify = new amplify_toolkit_1.default();
    }
    return Context;
}());
exports.default = Context;
//# sourceMappingURL=../../src/lib/domain/context.js.map