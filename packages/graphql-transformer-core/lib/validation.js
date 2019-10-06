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
var language_1 = require("graphql/language");
var type_1 = require("graphql/type");
var validation_1 = require("graphql/validation");
var buildASTSchema_1 = require("graphql/utilities/buildASTSchema");
// Spec Section: "Subscriptions with Single Root Field"
var SingleFieldSubscriptions_1 = require("graphql/validation/rules/SingleFieldSubscriptions");
// Spec Section: "Fragment Spread Type Existence"
var KnownTypeNames_1 = require("graphql/validation/rules/KnownTypeNames");
// Spec Section: "Fragments on Composite Types"
var FragmentsOnCompositeTypes_1 = require("graphql/validation/rules/FragmentsOnCompositeTypes");
// Spec Section: "Variables are Input Types"
var VariablesAreInputTypes_1 = require("graphql/validation/rules/VariablesAreInputTypes");
// Spec Section: "Leaf Field Selections"
var ScalarLeafs_1 = require("graphql/validation/rules/ScalarLeafs");
// Spec Section: "Field Selections on Objects, Interfaces, and Unions Types"
var FieldsOnCorrectType_1 = require("graphql/validation/rules/FieldsOnCorrectType");
// Spec Section: "Directives Are Defined"
var KnownDirectives_1 = require("graphql/validation/rules/KnownDirectives");
// Spec Section: "Argument Names"
var KnownArgumentNames_1 = require("graphql/validation/rules/KnownArgumentNames");
// Spec Section: "Argument Uniqueness"
var UniqueArgumentNames_1 = require("graphql/validation/rules/UniqueArgumentNames");
// Spec Section: "Value Type Correctness"
var ValuesOfCorrectType_1 = require("graphql/validation/rules/ValuesOfCorrectType");
// Spec Section: "All Variable Usages Are Allowed"
var VariablesInAllowedPosition_1 = require("graphql/validation/rules/VariablesInAllowedPosition");
// Spec Section: "Field Selection Merging"
var OverlappingFieldsCanBeMerged_1 = require("graphql/validation/rules/OverlappingFieldsCanBeMerged");
// Spec Section: "Input Object Field Uniqueness"
var UniqueInputFieldNames_1 = require("graphql/validation/rules/UniqueInputFieldNames");
var ProvidedNonNullArguments_1 = require("graphql/validation/rules/ProvidedNonNullArguments");
/**
 * This set includes all validation rules defined by the GraphQL spec.
 *
 * The order of the rules in this list has been adjusted to lead to the
 * most clear output when encountering multiple validation errors.
 */
exports.specifiedRules = [
    SingleFieldSubscriptions_1.SingleFieldSubscriptions,
    KnownTypeNames_1.KnownTypeNames,
    FragmentsOnCompositeTypes_1.FragmentsOnCompositeTypes,
    VariablesAreInputTypes_1.VariablesAreInputTypes,
    ScalarLeafs_1.ScalarLeafs,
    FieldsOnCorrectType_1.FieldsOnCorrectType,
    KnownDirectives_1.KnownDirectives,
    KnownArgumentNames_1.KnownArgumentNames,
    UniqueArgumentNames_1.UniqueArgumentNames,
    ValuesOfCorrectType_1.ValuesOfCorrectType,
    VariablesInAllowedPosition_1.VariablesInAllowedPosition,
    OverlappingFieldsCanBeMerged_1.OverlappingFieldsCanBeMerged,
    UniqueInputFieldNames_1.UniqueInputFieldNames,
    ProvidedNonNullArguments_1.ProvidedNonNullArguments
];
var EXTRA_SCALARS_DOCUMENT = language_1.parse("\nscalar AWSDate\nscalar AWSTime\nscalar AWSDateTime\nscalar AWSTimestamp\nscalar AWSEmail\nscalar AWSJSON\nscalar AWSURL\nscalar AWSPhone\nscalar AWSIPAddress\nscalar BigInt\nscalar Double\n");
var EXTRA_DIRECTIVES_DOCUMENT = language_1.parse("\ndirective @aws_subscribe(mutations: [String!]!) on FIELD_DEFINITION\ndirective @aws_auth(cognito_groups: [String!]!) on FIELD_DEFINITION\ndirective @aws_api_key on FIELD_DEFINITION | OBJECT\ndirective @aws_iam on FIELD_DEFINITION | OBJECT\ndirective @aws_oidc on FIELD_DEFINITION | OBJECT\ndirective @aws_cognito_user_pools(cognito_groups: [String!]) on FIELD_DEFINITION | OBJECT\n\n# Allows transformer libraries to deprecate directive arguments.\ndirective @deprecated(reason: String!) on INPUT_FIELD_DEFINITION | ENUM\n");
function astBuilder(doc) {
    var nodeMap = doc.definitions
        .filter(function (def) { return def.kind !== language_1.Kind.SCHEMA_DEFINITION && Boolean(def.name); })
        .reduce(function (a, def) {
        var _a;
        return (__assign(__assign({}, a), (_a = {}, _a[def.name.value] = def, _a)));
    }, {});
    return new buildASTSchema_1.ASTDefinitionBuilder(nodeMap, {}, function (typeRef) {
        throw new Error("Type \"" + typeRef.name.value + "\" not found in document.");
    });
}
exports.astBuilder = astBuilder;
function validateModelSchema(doc) {
    var fullDocument = {
        kind: language_1.Kind.DOCUMENT,
        definitions: __spreadArrays(EXTRA_DIRECTIVES_DOCUMENT.definitions, doc.definitions, EXTRA_SCALARS_DOCUMENT.definitions)
    };
    var builder = astBuilder(fullDocument);
    var directives = fullDocument.definitions
        .filter(function (d) { return d.kind === language_1.Kind.DIRECTIVE_DEFINITION; })
        .map(function (d) {
        return builder.buildDirective(d);
    });
    var types = fullDocument.definitions
        .filter(function (d) { return d.kind !== language_1.Kind.DIRECTIVE_DEFINITION && d.kind !== language_1.Kind.SCHEMA_DEFINITION; })
        .map(function (d) { return builder.buildType(d); });
    var outputTypes = types.filter(function (t) { return type_1.isOutputType(t); });
    var fields = outputTypes.reduce(function (acc, t) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[t.name] = { type: t }, _a)));
    }, {});
    var schemaRecord = doc.definitions.find(function (d) { return d.kind === language_1.Kind.SCHEMA_DEFINITION; });
    var queryOp = schemaRecord ? schemaRecord.operationTypes.find(function (o) { return o.operation === 'query'; }) : undefined;
    var queryName = queryOp ? queryOp.type.name.value : 'Query';
    var existingQueryType = types.find(function (t) { return t.name === queryName; });
    var queryType = existingQueryType ?
        existingQueryType :
        new type_1.GraphQLObjectType({
            name: queryName,
            fields: fields
        });
    var schema = new type_1.GraphQLSchema({ query: queryType, types: types, directives: directives });
    return validation_1.validate(schema, fullDocument, exports.specifiedRules);
}
exports.validateModelSchema = validateModelSchema;
//# sourceMappingURL=validation.js.map