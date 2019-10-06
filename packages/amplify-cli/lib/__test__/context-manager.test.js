"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var input_1 = __importDefault(require("../domain/input"));
var plugin_platform_1 = __importDefault(require("../domain/plugin-platform"));
var context_manager_1 = require("../context-manager");
test('constructContext', function () {
    var mockProcessArgv = [
        '/Users/userName/.nvm/versions/node/v8.11.4/bin/node',
        '/Users/userName/.nvm/versions/node/v8.11.4/bin/amplify',
        'status',
    ];
    var mockPluginPlatform = new plugin_platform_1.default();
    var mockInput = new input_1.default(mockProcessArgv);
    var context = context_manager_1.constructContext(mockPluginPlatform, mockInput);
    expect(context).toBeDefined();
    expect(context.amplify).toBeDefined();
    expect(context.pluginPlatform).toEqual(mockPluginPlatform);
    expect(context.input).toEqual(mockInput);
});
//# sourceMappingURL=../../src/lib/__test__/context-manager.test.js.map