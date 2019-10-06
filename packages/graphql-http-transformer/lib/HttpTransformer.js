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
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_1 = require("graphql");
var resources_1 = require("./resources");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_common_2 = require("graphql-transformer-common");
var definitions_1 = require("./definitions");
var HTTP_STACK_NAME = 'HttpStack';
/**
 * The @http transform.
 *
 * This transform attaches http resolvers to any fields with the @http directive.
 * Works with GET, POST, PUT, DELETE requests.
 */
var HttpTransformer = /** @class */ (function (_super) {
    __extends(HttpTransformer, _super);
    function HttpTransformer() {
        var _this = _super.call(this, 'HttpTransformer', graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            directive @http(\n                method: HttpMethod = GET,\n                url: String!,\n                headers: [HttpHeader] = []\n            ) on FIELD_DEFINITION\n            enum HttpMethod {\n                GET\n                POST\n                PUT\n                DELETE\n                PATCH\n            }\n            input HttpHeader {\n                key: String,\n                value: String\n            }\n            "], ["\n            directive @http(\n                method: HttpMethod = GET,\n                url: String!,\n                headers: [HttpHeader] = []\n            ) on FIELD_DEFINITION\n            enum HttpMethod {\n                GET\n                POST\n                PUT\n                DELETE\n                PATCH\n            }\n            input HttpHeader {\n                key: String,\n                value: String\n            }\n            "])))) || this;
        _this.before = function (ctx) {
            var directiveList = [];
            // gather all the http directives
            for (var _i = 0, _a = ctx.inputDocument.definitions; _i < _a.length; _i++) {
                var def = _a[_i];
                if (def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION) {
                    for (var _b = 0, _c = def.fields; _b < _c.length; _b++) {
                        var field = _c[_b];
                        var httpDirective = field.directives.find(function (dir) { return dir.name.value === 'http'; });
                        if (httpDirective) {
                            directiveList.push(httpDirective);
                        }
                    }
                }
            }
            // create all the datasources we will need for this schema
            directiveList.forEach(function (value) {
                var url = graphql_transformer_common_1.getDirectiveArgument(value)("url");
                // require a protocol in the url
                var protocolMatcher = /^http(s)?:\/\//;
                if (!protocolMatcher.test(url)) {
                    throw new graphql_transformer_core_1.TransformerContractError("@http directive at location " + value.loc.start + " " +
                        "requires a url parameter that begins with http:// or https://.");
                }
                // extract just the base url with protocol
                var baseURL = url.replace(HttpTransformer.urlRegex, '$1');
                var dataSourceID = graphql_transformer_common_2.HttpResourceIDs.HttpDataSourceID(baseURL);
                // only create one DataSource per base URL
                if (!ctx.getResource(dataSourceID)) {
                    ctx.mapResourceToStack(HTTP_STACK_NAME, dataSourceID);
                    ctx.setResource(dataSourceID, _this.resources.makeHttpDataSource(baseURL));
                }
            });
        };
        /**
         * Create and configure the HTTP resolver for this field
         */
        _this.field = function (parent, field, directive, ctx) {
            ctx.mapResourceToStack(HTTP_STACK_NAME, graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parent.name.value, field.name.value));
            var url = graphql_transformer_common_1.getDirectiveArgument(directive)("url");
            var baseURL = url.replace(HttpTransformer.urlRegex, '$1');
            // split the url into pieces, and get the path part off the end
            var path = url.split(/(http(s)?:\/\/|www\.)|(\/.*)/g).slice(-2, -1)[0];
            // extract any URL parameters from the path
            var urlParams = path.match(/:\w+/g);
            var queryBodyArgsArray = field.arguments;
            var newFieldArgsArray = [];
            if (urlParams) {
                urlParams = urlParams.map(function (p) { return p.replace(':', ''); });
                // if there are URL parameters, remove them from the array we'll use
                // to create the query and body types
                queryBodyArgsArray = field.arguments
                    .filter(function (e) { return (graphql_transformer_common_1.isScalar(e.type) &&
                    !urlParams.includes(e.name.value)); });
                // replace each URL parameter with $ctx.args.params.parameter_name for use in resolver template
                path = path.replace(/:\w+/g, function (str) {
                    return "${ctx.args.params." + str.replace(':', '') + "}";
                });
                var urlParamInputObject = definitions_1.makeUrlParamInputObject(parent, field, urlParams);
                ctx.addInput(urlParamInputObject);
                newFieldArgsArray.push(definitions_1.makeHttpArgument('params', urlParamInputObject, true));
            }
            var method = graphql_transformer_common_1.getDirectiveArgument(directive)("method");
            if (!method) {
                method = 'GET';
            }
            var headers = graphql_transformer_common_1.getDirectiveArgument(directive)("headers");
            if (!headers || !Array.isArray(headers)) {
                headers = [];
            }
            if (queryBodyArgsArray.length > 0) {
                // for GET requests, leave the nullability of the query parameters unchanged -
                // but for PUT, POST and PATCH, unwrap any non-nulls
                var queryInputObject = definitions_1.makeHttpQueryInputObject(parent, field, queryBodyArgsArray, method === 'GET' ? false : true);
                var bodyInputObject = definitions_1.makeHttpBodyInputObject(parent, field, queryBodyArgsArray, true);
                // if any of the arguments for the query are non-null,
                // make the newly generated type wrapper non-null too (only really applies for GET requests)
                var makeNonNull = queryInputObject.fields
                    .filter(function (a) { return a.type.kind === graphql_1.Kind.NON_NULL_TYPE; }).length > 0 ? true : false;
                ctx.addInput(queryInputObject);
                newFieldArgsArray.push(definitions_1.makeHttpArgument('query', queryInputObject, makeNonNull));
                if (method !== 'GET' && method !== 'DELETE') {
                    ctx.addInput(bodyInputObject);
                    newFieldArgsArray.push(definitions_1.makeHttpArgument('body', bodyInputObject, makeNonNull));
                }
            }
            // build the payload
            switch (method) {
                case 'GET':
                    var getResourceID = graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parent.name.value, field.name.value);
                    if (!ctx.getResource(getResourceID)) {
                        var getResolver = _this.resources.makeGetResolver(baseURL, path, parent.name.value, field.name.value, headers);
                        ctx.setResource(getResourceID, getResolver);
                    }
                    break;
                case 'POST':
                    var postResourceID = graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parent.name.value, field.name.value);
                    if (!ctx.getResource(postResourceID)) {
                        var postResolver = _this.resources.makePostResolver(baseURL, path, parent.name.value, field.name.value, queryBodyArgsArray
                            .filter(function (a) { return a.type.kind === graphql_1.Kind.NON_NULL_TYPE; })
                            .map(function (a) { return a.name.value; }), headers);
                        ctx.setResource(postResourceID, postResolver);
                    }
                    break;
                case 'PUT':
                    var putResourceID = graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parent.name.value, field.name.value);
                    if (!ctx.getResource(putResourceID)) {
                        var putResolver = _this.resources.makePutResolver(baseURL, path, parent.name.value, field.name.value, queryBodyArgsArray
                            .filter(function (a) { return a.type.kind === graphql_1.Kind.NON_NULL_TYPE; })
                            .map(function (a) { return a.name.value; }), headers);
                        ctx.setResource(putResourceID, putResolver);
                    }
                    break;
                case 'DELETE':
                    var deleteResourceID = graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parent.name.value, field.name.value);
                    if (!ctx.getResource(deleteResourceID)) {
                        var deleteResolver = _this.resources.makeDeleteResolver(baseURL, path, parent.name.value, field.name.value, headers);
                        ctx.setResource(deleteResourceID, deleteResolver);
                    }
                    break;
                case 'PATCH':
                    var patchResourceID = graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parent.name.value, field.name.value);
                    if (!ctx.getResource(patchResourceID)) {
                        var patchResolver = _this.resources.makePatchResolver(baseURL, path, parent.name.value, field.name.value, queryBodyArgsArray
                            .filter(function (a) { return a.type.kind === graphql_1.Kind.NON_NULL_TYPE; })
                            .map(function (a) { return a.name.value; }), headers);
                        ctx.setResource(patchResourceID, patchResolver);
                    }
                    break;
                default:
                // nothing
            }
            // now update the field if necessary with the new arguments
            if (newFieldArgsArray.length > 0) {
                var updatedField = __assign(__assign({}, field), { arguments: newFieldArgsArray });
                var mostRecentParent = ctx.getType(parent.name.value);
                var updatedFieldsInParent = mostRecentParent.fields.filter(function (f) { return f.name.value !== field.name.value; });
                updatedFieldsInParent.push(updatedField);
                var updatedParentType = __assign(__assign({}, mostRecentParent), { fields: updatedFieldsInParent });
                ctx.putType(updatedParentType);
            }
        };
        _this.resources = new resources_1.ResourceFactory();
        return _this;
    }
    HttpTransformer.urlRegex = /(http(s)?:\/\/)|(\/.*)/g;
    return HttpTransformer;
}(graphql_transformer_core_1.Transformer));
exports.HttpTransformer = HttpTransformer;
var templateObject_1;
//# sourceMappingURL=HttpTransformer.js.map