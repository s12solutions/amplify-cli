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
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var cloudform_types_1 = require("cloudform-types");
var lambdaArns_1 = require("./lambdaArns");
var FUNCTION_DIRECTIVE_STACK = 'FunctionDirectiveStack';
var FunctionTransformer = /** @class */ (function (_super) {
    __extends(FunctionTransformer, _super);
    function FunctionTransformer() {
        var _this = _super.call(this, 'FunctionTransformer', graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["directive @function(name: String!, region: String) on FIELD_DEFINITION"], ["directive @function(name: String!, region: String) on FIELD_DEFINITION"])))) || this;
        /**
         * Add the required resources to invoke a lambda function for this field.
         */
        _this.field = function (parent, definition, directive, ctx) {
            var _a = graphql_transformer_core_1.getDirectiveArguments(directive), name = _a.name, region = _a.region;
            if (!name) {
                throw new graphql_transformer_core_1.TransformerContractError("Must supply a 'name' to @function.");
            }
            // Add the iam role if it does not exist.
            var iamRoleKey = graphql_transformer_common_1.FunctionResourceIDs.FunctionIAMRoleID(name, region);
            if (!ctx.getResource(iamRoleKey)) {
                ctx.setResource(iamRoleKey, _this.role(name, region));
                ctx.mapResourceToStack(FUNCTION_DIRECTIVE_STACK, iamRoleKey);
            }
            // Add the data source if it does not exist.
            var lambdaDataSourceKey = graphql_transformer_common_1.FunctionResourceIDs.FunctionDataSourceID(name, region);
            if (!ctx.getResource(lambdaDataSourceKey)) {
                ctx.setResource(lambdaDataSourceKey, _this.datasource(name, region));
                ctx.mapResourceToStack(FUNCTION_DIRECTIVE_STACK, lambdaDataSourceKey);
            }
            // Add function that invokes the lambda function
            var functionConfigurationKey = graphql_transformer_common_1.FunctionResourceIDs.FunctionAppSyncFunctionConfigurationID(name, region);
            if (!ctx.getResource(functionConfigurationKey)) {
                ctx.setResource(functionConfigurationKey, _this.function(name, region));
                ctx.mapResourceToStack(FUNCTION_DIRECTIVE_STACK, functionConfigurationKey);
            }
            // Add resolver that invokes our function
            var typeName = parent.name.value;
            var fieldName = definition.name.value;
            var resolverKey = graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID(typeName, fieldName);
            var resolver = ctx.getResource(resolverKey);
            if (!resolver) {
                ctx.setResource(resolverKey, _this.resolver(typeName, fieldName, name, region));
                ctx.mapResourceToStack(FUNCTION_DIRECTIVE_STACK, resolverKey);
            }
            else if (resolver.Properties.Kind === 'PIPELINE') {
                ctx.setResource(resolverKey, _this.appendFunctionToResolver(resolver, graphql_transformer_common_1.FunctionResourceIDs.FunctionAppSyncFunctionConfigurationID(name, region)));
            }
        };
        /**
         * Create a role that allows our AppSync API to talk to our Lambda function.
         */
        _this.role = function (name, region) {
            return new cloudform_types_1.IAM.Role({
                RoleName: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join('-', [
                    graphql_transformer_common_1.FunctionResourceIDs.FunctionIAMRoleID(name, region).slice(0, 26),
                    cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
                    cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env) // 10
                ]), cloudform_types_1.Fn.Join('-', [
                    graphql_transformer_common_1.FunctionResourceIDs.FunctionIAMRoleID(name, region).slice(0, 37),
                    cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
                ])),
                AssumeRolePolicyDocument: {
                    Version: "2012-10-17",
                    Statement: [{
                            Effect: "Allow",
                            Principal: {
                                Service: "appsync.amazonaws.com"
                            },
                            Action: "sts:AssumeRole"
                        }]
                },
                Policies: [{
                        PolicyName: "InvokeLambdaFunction",
                        PolicyDocument: {
                            Version: "2012-10-17",
                            Statement: [{
                                    Effect: "Allow",
                                    Action: [
                                        "lambda:InvokeFunction"
                                    ],
                                    Resource: lambdaArns_1.lambdaArnResource(name, region)
                                }]
                        }
                    }]
            });
        };
        /**
         * Creates a lambda data source that registers the lambda function and associated role.
         */
        _this.datasource = function (name, region) {
            return new cloudform_types_1.AppSync.DataSource({
                ApiId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId),
                Name: graphql_transformer_common_1.FunctionResourceIDs.FunctionDataSourceID(name, region),
                Type: "AWS_LAMBDA",
                ServiceRoleArn: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.FunctionResourceIDs.FunctionIAMRoleID(name, region), "Arn"),
                LambdaConfig: {
                    LambdaFunctionArn: lambdaArns_1.lambdaArnResource(name, region)
                }
            }).dependsOn(graphql_transformer_common_1.FunctionResourceIDs.FunctionIAMRoleID(name, region));
        };
        /**
         * Create a new pipeline function that calls out to the lambda function and returns the value.
         */
        _this.function = function (name, region) {
            return new cloudform_types_1.AppSync.FunctionConfiguration({
                ApiId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId),
                Name: graphql_transformer_common_1.FunctionResourceIDs.FunctionAppSyncFunctionConfigurationID(name, region),
                DataSourceName: graphql_transformer_common_1.FunctionResourceIDs.FunctionDataSourceID(name, region),
                FunctionVersion: "2018-05-29",
                RequestMappingTemplate: graphql_mapping_template_1.printBlock("Invoke AWS Lambda data source: " + graphql_transformer_common_1.FunctionResourceIDs.FunctionDataSourceID(name, region))(graphql_mapping_template_1.obj({
                    version: graphql_mapping_template_1.str('2018-05-29'),
                    operation: graphql_mapping_template_1.str('Invoke'),
                    payload: graphql_mapping_template_1.obj({
                        typeName: graphql_mapping_template_1.str('$ctx.stash.get("typeName")'),
                        fieldName: graphql_mapping_template_1.str('$ctx.stash.get("fieldName")'),
                        arguments: graphql_mapping_template_1.ref('util.toJson($ctx.arguments)'),
                        identity: graphql_mapping_template_1.ref('util.toJson($ctx.identity)'),
                        source: graphql_mapping_template_1.ref('util.toJson($ctx.source)'),
                        request: graphql_mapping_template_1.ref('util.toJson($ctx.request)'),
                        prev: graphql_mapping_template_1.ref('util.toJson($ctx.prev)'),
                    })
                })),
                ResponseMappingTemplate: graphql_mapping_template_1.printBlock('Handle error or return result')(graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ctx.error'), graphql_mapping_template_1.raw('$util.error($ctx.error.message, $ctx.error.type)')),
                    graphql_mapping_template_1.raw('$util.toJson($ctx.result)')
                ]))
            }).dependsOn(graphql_transformer_common_1.FunctionResourceIDs.FunctionDataSourceID(name, region));
        };
        /**
         * Create a resolver of one that calls the "function" function.
         */
        _this.resolver = function (type, field, name, region) {
            return new cloudform_types_1.AppSync.Resolver({
                ApiId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId),
                TypeName: type,
                FieldName: field,
                Kind: 'PIPELINE',
                PipelineConfig: {
                    Functions: [
                        cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.FunctionResourceIDs.FunctionAppSyncFunctionConfigurationID(name, region), "FunctionId")
                    ]
                },
                RequestMappingTemplate: graphql_mapping_template_1.printBlock('Stash resolver specific context.')(graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.qref("$ctx.stash.put(\"typeName\", \"" + type + "\")"),
                    graphql_mapping_template_1.qref("$ctx.stash.put(\"fieldName\", \"" + field + "\")"),
                    graphql_mapping_template_1.obj({})
                ])),
                ResponseMappingTemplate: '$util.toJson($ctx.prev.result)'
            }).dependsOn(graphql_transformer_common_1.FunctionResourceIDs.FunctionAppSyncFunctionConfigurationID(name, region));
        };
        return _this;
    }
    FunctionTransformer.prototype.appendFunctionToResolver = function (resolver, functionId) {
        if (resolver.Properties.PipelineConfig &&
            resolver.Properties.PipelineConfig.Functions &&
            Array.isArray(resolver.Properties.PipelineConfig.Functions)) {
            resolver.Properties.PipelineConfig.Functions.push(cloudform_types_1.Fn.GetAtt(functionId, "FunctionId"));
        }
        return resolver;
    };
    return FunctionTransformer;
}(graphql_transformer_core_1.Transformer));
exports.default = FunctionTransformer;
var templateObject_1;
//# sourceMappingURL=FunctionTransformer.js.map