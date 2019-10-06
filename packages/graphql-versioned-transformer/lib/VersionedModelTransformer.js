"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_1 = require("graphql");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var VersionedModelTransformer = /** @class */ (function (_super) {
    __extends(VersionedModelTransformer, _super);
    function VersionedModelTransformer() {
        var _this = _super.call(this, 'VersionedModelTransformer', 
        // TODO: Allow version attribute selection. Could be `@version on FIELD_DEFINITION`
        graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["directive @versioned(versionField: String = \"version\", versionInput: String = \"expectedVersion\") on OBJECT"], ["directive @versioned(versionField: String = \"version\", versionInput: String = \"expectedVersion\") on OBJECT"])))) || this;
        /**
         * When a type is annotated with @versioned enable conflict resolution for the type.
         *
         * Usage:
         *
         * type Post @model @versioned(versionField: "version", versionInput: "expectedVersion") {
         *   id: ID!
         *   title: String
         *   version: Int!
         * }
         *
         * Enabling conflict resolution automatically manages a "version" attribute in
         * the @model type's DynamoDB table and injects a conditional expression into
         * the types mutations that actually perform the conflict resolutions by
         * checking the "version" attribute in the table with the "expectedVersion" passed
         * by the user.
         */
        _this.object = function (def, directive, ctx) {
            // @versioned may only be used on types that are also @model
            var modelDirective = def.directives.find(function (dir) { return dir.name.value === 'model'; });
            if (!modelDirective) {
                throw new graphql_transformer_core_1.InvalidDirectiveError('Types annotated with @versioned must also be annotated with @model.');
            }
            var isArg = function (s) { return function (arg) { return arg.name.value === s; }; };
            var getArg = function (arg, dflt) {
                var argument = directive.arguments.find(isArg(arg));
                return argument ? graphql_1.valueFromASTUntyped(argument.value) : dflt;
            };
            var versionField = getArg('versionField', "version");
            var versionInput = getArg('versionInput', "expectedVersion");
            var typeName = def.name.value;
            // Make the necessary changes to the context
            _this.augmentCreateMutation(ctx, typeName, versionField, versionInput);
            _this.augmentUpdateMutation(ctx, typeName, versionField, versionInput);
            _this.augmentDeleteMutation(ctx, typeName, versionField, versionInput);
            _this.stripCreateInputVersionedField(ctx, typeName, versionField);
            _this.addVersionedInputToDeleteInput(ctx, typeName, versionInput);
            _this.addVersionedInputToUpdateInput(ctx, typeName, versionInput);
            _this.enforceVersionedFieldOnType(ctx, typeName, versionField);
        };
        return _this;
    }
    /**
     * Set the "version"  to 1.
     * @param ctx
     * @param versionField
     * @param versionInput
     */
    VersionedModelTransformer.prototype.augmentCreateMutation = function (ctx, typeName, versionField, versionInput) {
        var snippet = graphql_mapping_template_1.printBlock("Setting \"" + versionField + "\" to 1")(graphql_mapping_template_1.qref("$ctx.args.input.put(\"" + versionField + "\", 1)"));
        var mutationResolverLogicalId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBCreateResolverResourceID(typeName);
        var resolver = ctx.getResource(mutationResolverLogicalId);
        if (resolver) {
            resolver.Properties.RequestMappingTemplate = snippet + '\n\n' + resolver.Properties.RequestMappingTemplate;
            ctx.setResource(mutationResolverLogicalId, resolver);
        }
    };
    /**
     * Prefix the update operation with a conditional expression that checks
     * the object versions.
     * @param ctx
     * @param versionField
     * @param versionInput
     */
    VersionedModelTransformer.prototype.augmentDeleteMutation = function (ctx, typeName, versionField, versionInput) {
        var _a, _b;
        var mutationResolverLogicalId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBDeleteResolverResourceID(typeName);
        var snippet = graphql_mapping_template_1.printBlock("Inject @versioned condition.")(graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition), graphql_mapping_template_1.obj({
                expression: graphql_mapping_template_1.str("#" + versionField + " = :" + versionInput),
                expressionValues: graphql_mapping_template_1.obj((_a = {},
                    _a[":" + versionInput] = graphql_mapping_template_1.raw("$util.dynamodb.toDynamoDB($ctx.args.input." + versionInput + ")"),
                    _a)),
                expressionNames: graphql_mapping_template_1.obj((_b = {},
                    _b["#" + versionField] = graphql_mapping_template_1.str("" + versionField),
                    _b))
            })),
            graphql_mapping_template_1.qref("$ctx.args.input.remove(\"" + versionInput + "\")")
        ]));
        var resolver = ctx.getResource(mutationResolverLogicalId);
        if (resolver) {
            resolver.Properties.RequestMappingTemplate = snippet + '\n\n' + resolver.Properties.RequestMappingTemplate;
            ctx.setResource(mutationResolverLogicalId, resolver);
        }
    };
    VersionedModelTransformer.prototype.augmentUpdateMutation = function (ctx, typeName, versionField, versionInput) {
        var _a, _b;
        var mutationResolverLogicalId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBUpdateResolverResourceID(typeName);
        var snippet = graphql_mapping_template_1.printBlock("Inject @versioned condition.")(graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition), graphql_mapping_template_1.obj({
                expression: graphql_mapping_template_1.str("#" + versionField + " = :" + versionInput),
                expressionValues: graphql_mapping_template_1.obj((_a = {},
                    _a[":" + versionInput] = graphql_mapping_template_1.raw("$util.dynamodb.toDynamoDB($ctx.args.input." + versionInput + ")"),
                    _a)),
                expressionNames: graphql_mapping_template_1.obj((_b = {},
                    _b["#" + versionField] = graphql_mapping_template_1.str("" + versionField),
                    _b))
            })),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('newVersion'), graphql_mapping_template_1.raw("$ctx.args.input." + versionInput + " + 1")),
            graphql_mapping_template_1.qref("$ctx.args.input.put(\"" + versionField + "\", $newVersion)"),
            graphql_mapping_template_1.qref("$ctx.args.input.remove(\"" + versionInput + "\")")
        ]));
        var resolver = ctx.getResource(mutationResolverLogicalId);
        if (resolver) {
            resolver.Properties.RequestMappingTemplate = snippet + '\n\n' + resolver.Properties.RequestMappingTemplate;
            ctx.setResource(mutationResolverLogicalId, resolver);
        }
    };
    VersionedModelTransformer.prototype.stripCreateInputVersionedField = function (ctx, typeName, versionField) {
        var createInputName = graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName(typeName);
        var input = ctx.getType(createInputName);
        if (input && input.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION) {
            var updatedFields = input.fields.filter(function (f) { return f.name.value !== versionField; });
            if (updatedFields.length === 0) {
                throw new graphql_transformer_core_1.InvalidDirectiveError("After stripping away version field \"" + versionField + "\",                     the create input for type \"" + typeName + "\" cannot be created                     with 0 fields. Add another field to type \"" + typeName + "\" to continue.");
            }
            var updatedInput = __assign(__assign({}, input), { fields: updatedFields });
            ctx.putType(updatedInput);
        }
    };
    VersionedModelTransformer.prototype.addVersionedInputToUpdateInput = function (ctx, typeName, versionInput) {
        return this.addVersionedInputToInput(ctx, graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName(typeName), versionInput);
    };
    VersionedModelTransformer.prototype.addVersionedInputToDeleteInput = function (ctx, typeName, versionInput) {
        return this.addVersionedInputToInput(ctx, graphql_transformer_common_1.ModelResourceIDs.ModelDeleteInputObjectName(typeName), versionInput);
    };
    VersionedModelTransformer.prototype.addVersionedInputToInput = function (ctx, inputName, versionInput) {
        var input = ctx.getType(inputName);
        if (input && input.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION) {
            var updatedFields = __spreadArrays(input.fields, [
                graphql_transformer_common_1.makeInputValueDefinition(versionInput, graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType("Int")))
            ]);
            var updatedInput = __assign(__assign({}, input), { fields: updatedFields });
            ctx.putType(updatedInput);
        }
    };
    VersionedModelTransformer.prototype.enforceVersionedFieldOnType = function (ctx, typeName, versionField) {
        var type = ctx.getType(typeName);
        if (type && type.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION) {
            var updatedFields = type.fields;
            var versionFieldImpl = type.fields.find(function (f) { return f.name.value === versionField; });
            var updatedField_1 = versionFieldImpl;
            if (versionFieldImpl) {
                var baseType = graphql_transformer_common_1.getBaseType(versionFieldImpl.type);
                if (baseType === 'Int' || baseType === 'BigInt') {
                    // ok.
                    if (versionFieldImpl.type.kind !== graphql_1.Kind.NON_NULL_TYPE) {
                        updatedField_1 = __assign(__assign({}, updatedField_1), { type: graphql_transformer_common_1.makeNonNullType(versionFieldImpl.type) });
                        updatedFields = updatedFields.map(function (f) { return f.name.value === versionField ? updatedField_1 : f; });
                    }
                }
                else {
                    throw new graphql_transformer_core_1.TransformerContractError("The versionField \"" + versionField + "\" is required to be of type \"Int\" or \"BigInt\".");
                }
            }
            else {
                updatedField_1 = graphql_transformer_common_1.makeField(versionField, [], graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType('Int')));
                updatedFields = __spreadArrays(updatedFields, [
                    updatedField_1
                ]);
            }
            var updatedType = __assign(__assign({}, type), { fields: updatedFields });
            ctx.putType(updatedType);
        }
    };
    return VersionedModelTransformer;
}(graphql_transformer_core_1.Transformer));
exports.VersionedModelTransformer = VersionedModelTransformer;
var templateObject_1;
//# sourceMappingURL=VersionedModelTransformer.js.map