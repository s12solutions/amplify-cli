"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cloudform_types_1 = require("cloudform-types");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var ResourceFactory = /** @class */ (function () {
    function ResourceFactory() {
    }
    ResourceFactory.prototype.makeParams = function () {
        return {};
    };
    /**
     * Creates the barebones template for an application.
     */
    ResourceFactory.prototype.initTemplate = function () {
        return {
            Parameters: this.makeParams(),
            Resources: {},
            Outputs: {}
        };
    };
    ResourceFactory.prototype.makeHttpDataSource = function (baseURL) {
        return new cloudform_types_1.AppSync.DataSource({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            Name: graphql_transformer_common_1.HttpResourceIDs.HttpDataSourceID(baseURL),
            Type: 'HTTP',
            HttpConfig: {
                Endpoint: this.replaceEnv(baseURL)
            }
        });
    };
    ResourceFactory.prototype.referencesEnv = function (value) {
        return value.match(/(\${env})/) !== null;
    };
    ResourceFactory.prototype.replaceEnv = function (value) {
        if (!this.referencesEnv(value)) {
            return value;
        }
        return cloudform_types_1.Fn.Sub(value, {
            env: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env)
        });
    };
    ResourceFactory.prototype.makeVtlStringArray = function (inputArray) {
        var returnArray = "[";
        inputArray.forEach(function (e) { return returnArray += "'" + e + "', "; });
        return returnArray.slice(0, -2) + "]";
    };
    ResourceFactory.prototype.makeNonNullChecks = function (nonNullArgs) {
        return graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.comment("START: Manually checking that all non-null arguments are provided either in the query or the body"),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.or(nonNullArgs.map(function (arg) { return graphql_mapping_template_1.parens(graphql_mapping_template_1.and([graphql_mapping_template_1.raw("!$ctx.args.body." + arg), graphql_mapping_template_1.raw("!$ctx.args.query." + arg)])); })), graphql_mapping_template_1.ref('util.error("An argument you marked as Non-Null is not present ' +
                'in the query nor the body of your request."))')),
            graphql_mapping_template_1.comment("END: Manually checking that all non-null arguments are provided either in the query or the body"),
        ]);
    };
    /**
     * Create a resolver that makes a GET request. It assumes the endpoint expects query parameters in the exact
     * shape of the input arguments to the http directive. Returns the result in JSON format, or an error if the status code
     * is not 200
     * @param type
     */
    ResourceFactory.prototype.makeGetResolver = function (baseURL, path, type, field, headers) {
        var parsedHeaders = headers.map(function (header) { return graphql_mapping_template_1.qref("$headers.put(\"" + header.key + "\", \"" + header.value + "\")"); });
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.HttpResourceIDs.HttpDataSourceID(baseURL), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: this.replaceEnv(graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(__spreadArrays([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('headers'), graphql_mapping_template_1.ref('utils.http.copyHeaders($ctx.request.headers)')),
                graphql_mapping_template_1.qref('$headers.put("accept-encoding", "application/json")')
            ], parsedHeaders, [
                graphql_mapping_template_1.HttpMappingTemplate.getRequest({
                    resourcePath: path,
                    params: graphql_mapping_template_1.obj({
                        query: graphql_mapping_template_1.ref('util.toJson($ctx.args.query)'),
                        headers: graphql_mapping_template_1.ref('util.toJson($headers)')
                    })
                }),
            ])))),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('ctx.result.headers.get("Content-Type").toLowerCase().contains("xml")'), graphql_mapping_template_1.ref('utils.xml.toJsonString($ctx.result.body)'), graphql_mapping_template_1.ref('ctx.result.body')), graphql_mapping_template_1.ref('util.qr($util.appendError($ctx.result.body, $ctx.result.statusCode))')))
        }); //.dependsOn(ResourceConstants.RESOURCES.GraphQLSchemaLogicalID)
    };
    /**
     * Create a resolver that makes a POST request. It allows the user to provide arguments as either query
     * parameters or in the body of the request.
     * request. Returns the result in JSON format, or an error if the status code is not 200.
     * Forwards the headers from the request, adding that the content type is JSON.
     * @param type
     */
    ResourceFactory.prototype.makePostResolver = function (baseURL, path, type, field, nonNullArgs, headers) {
        var parsedHeaders = headers.map(function (header) { return graphql_mapping_template_1.qref("$headers.put(\"" + header.key + "\", \"" + header.value + "\")"); });
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.HttpResourceIDs.HttpDataSourceID(baseURL), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: this.replaceEnv(graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(__spreadArrays([
                nonNullArgs.length > 0 ? this.makeNonNullChecks(nonNullArgs) : null,
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('headers'), graphql_mapping_template_1.ref('utils.http.copyHeaders($ctx.request.headers)')),
                graphql_mapping_template_1.qref('$headers.put("Content-Type", "application/json")'),
                graphql_mapping_template_1.qref('$headers.put("accept-encoding", "application/json")')
            ], parsedHeaders, [
                graphql_mapping_template_1.HttpMappingTemplate.postRequest({
                    resourcePath: path,
                    params: graphql_mapping_template_1.obj({
                        body: graphql_mapping_template_1.ref('util.toJson($ctx.args.body)'),
                        query: graphql_mapping_template_1.ref('util.toJson($ctx.args.query)'),
                        headers: graphql_mapping_template_1.ref('util.toJson($headers)')
                    })
                }),
            ])))),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200 || $ctx.result.statusCode == 201'), 
            // check if the content type returned is XML, and convert to JSON if so
            graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('ctx.result.headers.get("Content-Type").toLowerCase().contains("xml")'), graphql_mapping_template_1.ref('utils.xml.toJsonString($ctx.result.body)'), graphql_mapping_template_1.ref('ctx.result.body')), graphql_mapping_template_1.ref('util.qr($util.appendError($ctx.result.body, $ctx.result.statusCode))')))
        }); //.dependsOn(ResourceConstants.RESOURCES.GraphQLSchemaLogicalID)
    };
    /**
     * Create a resolver that makes a PUT request. It allows the user to provide arguments as either query
     * parameters or in the body of the request.
     * Returns the result in JSON format, or an error if the status code is not 200.
     * Forwards the headers from the request, adding that the content type is JSON.
     * @param type
     */
    ResourceFactory.prototype.makePutResolver = function (baseURL, path, type, field, nonNullArgs, headers) {
        var parsedHeaders = headers.map(function (header) { return graphql_mapping_template_1.qref("$headers.put(\"" + header.key + "\", \"" + header.value + "\")"); });
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.HttpResourceIDs.HttpDataSourceID(baseURL), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: this.replaceEnv(graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(__spreadArrays([
                nonNullArgs.length > 0 ? this.makeNonNullChecks(nonNullArgs) : null,
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('headers'), graphql_mapping_template_1.ref('utils.http.copyHeaders($ctx.request.headers)')),
                graphql_mapping_template_1.qref('$headers.put("Content-Type", "application/json")'),
                graphql_mapping_template_1.qref('$headers.put("accept-encoding", "application/json")')
            ], parsedHeaders, [
                graphql_mapping_template_1.HttpMappingTemplate.putRequest({
                    resourcePath: path,
                    params: graphql_mapping_template_1.obj({
                        body: graphql_mapping_template_1.ref('util.toJson($ctx.args.body)'),
                        query: graphql_mapping_template_1.ref('util.toJson($ctx.args.query)'),
                        headers: graphql_mapping_template_1.ref('util.toJson($headers)')
                    })
                }),
            ])))),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200 || $ctx.result.statusCode == 201'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('ctx.result.headers.get("Content-Type").toLowerCase().contains("xml")'), graphql_mapping_template_1.ref('utils.xml.toJsonString($ctx.result.body)'), graphql_mapping_template_1.ref('ctx.result.body')), graphql_mapping_template_1.ref('util.qr($util.appendError($ctx.result.body, $ctx.result.statusCode))')))
        }); //.dependsOn(ResourceConstants.RESOURCES.GraphQLSchemaLogicalID)
    };
    /**
     * Create a resolver that makes a DELETE request.
     * @param type
     */
    ResourceFactory.prototype.makeDeleteResolver = function (baseURL, path, type, field, headers) {
        var parsedHeaders = headers.map(function (header) { return graphql_mapping_template_1.qref("$headers.put(\"" + header.key + "\", \"" + header.value + "\")"); });
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.HttpResourceIDs.HttpDataSourceID(baseURL), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: this.replaceEnv(graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(__spreadArrays([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('headers'), graphql_mapping_template_1.ref('utils.http.copyHeaders($ctx.request.headers)')),
                graphql_mapping_template_1.qref('$headers.put("accept-encoding", "application/json")')
            ], parsedHeaders, [
                graphql_mapping_template_1.HttpMappingTemplate.deleteRequest({
                    resourcePath: path,
                    params: graphql_mapping_template_1.obj({
                        headers: graphql_mapping_template_1.ref('util.toJson($headers)')
                    })
                }),
            ])))),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('ctx.result.headers.get("Content-Type").toLowerCase().contains("xml")'), graphql_mapping_template_1.ref('utils.xml.toJsonString($ctx.result.body)'), graphql_mapping_template_1.ref('ctx.result.body')), graphql_mapping_template_1.ref('util.qr($util.appendError($ctx.result.body, $ctx.result.statusCode))')))
        }); //.dependsOn(ResourceConstants.RESOURCES.GraphQLSchemaLogicalID)
    };
    /**
     * Create a resolver that makes a PUT request. It allows the user to provide arguments as either query
     * parameters or in the body of the request.
     * Returns the result in JSON format, or an error if the status code is not 200.
     * Forwards the headers from the request, adding that the content type is JSON.
     * @param type
     */
    ResourceFactory.prototype.makePatchResolver = function (baseURL, path, type, field, nonNullArgs, headers) {
        var parsedHeaders = headers.map(function (header) { return graphql_mapping_template_1.qref("$headers.put(\"" + header.key + "\", \"" + header.value + "\")"); });
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.HttpResourceIDs.HttpDataSourceID(baseURL), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: this.replaceEnv(graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(__spreadArrays([
                nonNullArgs.length > 0 ? this.makeNonNullChecks(nonNullArgs) : null,
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('headers'), graphql_mapping_template_1.ref('utils.http.copyHeaders($ctx.request.headers)')),
                graphql_mapping_template_1.qref('$headers.put("Content-Type", "application/json")'),
                graphql_mapping_template_1.qref('$headers.put("accept-encoding", "application/json")')
            ], parsedHeaders, [
                graphql_mapping_template_1.HttpMappingTemplate.patchRequest({
                    resourcePath: path,
                    params: graphql_mapping_template_1.obj({
                        body: graphql_mapping_template_1.ref('util.toJson($ctx.args.body)'),
                        query: graphql_mapping_template_1.ref('util.toJson($ctx.args.query)'),
                        headers: graphql_mapping_template_1.ref('util.toJson($headers)')
                    })
                }),
            ])))),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200 || $ctx.result.statusCode == 201'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('ctx.result.headers.get("Content-Type").toLowerCase().contains("xml")'), graphql_mapping_template_1.ref('utils.xml.toJsonString($ctx.result.body)'), graphql_mapping_template_1.ref('ctx.result.body')), graphql_mapping_template_1.ref('util.qr($util.appendError($ctx.result.body, $ctx.result.statusCode))')))
        }); //.dependsOn(ResourceConstants.RESOURCES.GraphQLSchemaLogicalID)
    };
    return ResourceFactory;
}());
exports.ResourceFactory = ResourceFactory;
//# sourceMappingURL=resources.js.map