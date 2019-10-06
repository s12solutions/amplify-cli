"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_common_1 = require("graphql-transformer-common");
function updateCreateInputWithConnectionField(input, connectionFieldName, nonNull) {
    if (nonNull === void 0) { nonNull = false; }
    var keyFieldExists = Boolean(input.fields.find(function (f) { return f.name.value === connectionFieldName; }));
    // If the key field already exists then do not change the input.
    // The @connection field will validate that the key field is valid.
    if (keyFieldExists) {
        return input;
    }
    var updatedFields = __spreadArrays(input.fields, [
        graphql_transformer_common_1.makeInputValueDefinition(connectionFieldName, nonNull ? graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType('ID')) : graphql_transformer_common_1.makeNamedType('ID'))
    ]);
    return __assign(__assign({}, input), { fields: updatedFields });
}
exports.updateCreateInputWithConnectionField = updateCreateInputWithConnectionField;
function updateUpdateInputWithConnectionField(input, connectionFieldName) {
    var keyFieldExists = Boolean(input.fields.find(function (f) { return f.name.value === connectionFieldName; }));
    // If the key field already exists then do not change the input.
    // The @connection field will validate that the key field is valid.
    if (keyFieldExists) {
        return input;
    }
    var updatedFields = __spreadArrays(input.fields, [
        graphql_transformer_common_1.makeInputValueDefinition(connectionFieldName, graphql_transformer_common_1.makeNamedType('ID'))
    ]);
    return __assign(__assign({}, input), { fields: updatedFields });
}
exports.updateUpdateInputWithConnectionField = updateUpdateInputWithConnectionField;
//# sourceMappingURL=definitions.js.map