"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./polyfills/Object.assign");
var TransformerContext_1 = require("./TransformerContext");
exports.TransformerContext = TransformerContext_1.default;
var Transformer_1 = require("./Transformer");
exports.Transformer = Transformer_1.default;
var GraphQLTransform_1 = require("./GraphQLTransform");
var collectDirectives_1 = require("./collectDirectives");
exports.collectDirectiveNames = collectDirectives_1.collectDirectiveNames;
exports.collectDirectivesByTypeNames = collectDirectives_1.collectDirectivesByTypeNames;
var stripDirectives_1 = require("./stripDirectives");
exports.stripDirectives = stripDirectives_1.stripDirectives;
var amplifyUtils_1 = require("./util/amplifyUtils");
exports.buildAPIProject = amplifyUtils_1.buildProject;
exports.uploadAPIProject = amplifyUtils_1.uploadDeployment;
exports.migrateAPIProject = amplifyUtils_1.migrateAPIProject;
exports.revertAPIMigration = amplifyUtils_1.revertAPIMigration;
var transformConfig_1 = require("./util/transformConfig");
exports.readProjectSchema = transformConfig_1.readSchema;
exports.readProjectConfiguration = transformConfig_1.loadProject;
exports.readTransformerConfiguration = transformConfig_1.loadConfig;
exports.writeTransformerConfiguration = transformConfig_1.writeConfig;
__export(require("./errors"));
__export(require("./util"));
exports.default = GraphQLTransform_1.default;
//# sourceMappingURL=index.js.map