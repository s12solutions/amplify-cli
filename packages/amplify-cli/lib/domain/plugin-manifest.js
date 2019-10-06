"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PluginManifest = /** @class */ (function () {
    function PluginManifest(name, type, aliases, commands, commandAliases, eventHandlers) {
        this.name = name;
        this.type = type;
        this.aliases = aliases;
        this.commands = commands;
        this.commandAliases = commandAliases;
        this.eventHandlers = eventHandlers;
    }
    return PluginManifest;
}());
exports.default = PluginManifest;
//# sourceMappingURL=../../src/lib/domain/plugin-manifest.js.map