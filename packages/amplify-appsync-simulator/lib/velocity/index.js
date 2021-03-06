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
var amplify_velocity_template_1 = require("amplify-velocity-template");
var type_definition_1 = require("../type-definition");
var util_1 = require("./util");
var mapper_1 = require("./value-mapper/mapper");
var VelocityTemplateParseError = /** @class */ (function (_super) {
    __extends(VelocityTemplateParseError, _super);
    function VelocityTemplateParseError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VelocityTemplateParseError;
}(Error));
var VelocityTemplate = /** @class */ (function () {
    function VelocityTemplate(template, simulatorContext) {
        this.simulatorContext = simulatorContext;
        try {
            var ast = amplify_velocity_template_1.parse(template.content.toString());
            this.compiler = new amplify_velocity_template_1.Compile(ast, {
                valueMapper: mapper_1.map,
                escape: false,
            });
            this.template = template;
        }
        catch (e) {
            var lineDetails = e.hash.line + ":" + e.hash.loc.first_column;
            var fileName = template.path ? template.path + ":" + lineDetails : lineDetails;
            var templateError = new VelocityTemplateParseError("Error:Parse error on " + fileName + " \n" + e.message);
            templateError.stack = e.stack;
            throw templateError;
        }
    }
    VelocityTemplate.prototype.render = function (ctxValues, requestContext, info) {
        var context = this.buildRenderContext(ctxValues, requestContext, info);
        var templateResult = this.compiler.render(context);
        var stash = context.ctx.stash.toJSON();
        try {
            var result = JSON.parse(templateResult);
            return { result: result, stash: stash, errors: context.util.errors };
        }
        catch (e) {
            var errorMessage = "Unable to convert " + templateResult + " to class com.amazonaws.deepdish.transform.model.lambda.LambdaVersionedConfig.";
            throw new util_1.TemplateSentError(errorMessage, 'MappingTemplate', null, null, info);
        }
    };
    VelocityTemplate.prototype.buildRenderContext = function (ctxValues, requestContext, info) {
        var source = ctxValues.source, argument = ctxValues.arguments, result = ctxValues.result, stash = ctxValues.stash, prevResult = ctxValues.prevResult, error = ctxValues.error;
        var _a = requestContext.jwt, issuer = _a.iss, sub = _a.sub, cognitoUserName = _a["cognito:username"], username = _a.username, request = requestContext.request;
        var util = util_1.create([], new Date(Date.now()), info);
        var args = mapper_1.map(argument);
        // Identity is null for API Key
        var identity = null;
        if (requestContext.requestAuthorizationMode === type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.OPENID_CONNECT) {
            identity = mapper_1.map({
                sub: sub,
                issuer: issuer,
                claims: requestContext.jwt,
            });
        }
        else if (requestContext.requestAuthorizationMode === type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS) {
            identity = mapper_1.map(__assign({ sub: sub,
                issuer: issuer, 'cognito:username': cognitoUserName, username: username || cognitoUserName, sourceIp: this.getRemoteIpAddress(requestContext.request), claims: requestContext.jwt }, (this.simulatorContext.appSyncConfig.defaultAuthenticationType.authenticationType ===
                type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS
                ? { defaultAuthStrategy: 'ALLOW' }
                : {})));
        }
        var vtlContext = {
            arguments: args,
            args: args,
            request: request ? { headers: request.headers } : {},
            identity: identity,
            stash: mapper_1.map(stash || {}),
            source: mapper_1.map(source),
            result: mapper_1.map(result),
            error: error,
        };
        if (prevResult) {
            vtlContext['prev'] = mapper_1.map({
                result: prevResult,
            });
        }
        return {
            util: util,
            utils: util,
            context: vtlContext,
            ctx: vtlContext,
        };
    };
    VelocityTemplate.prototype.getRemoteIpAddress = function (request) {
        if (request && request.connection && request.connection.remoteAddress) {
            if (request.connection.remoteAddress.startsWith('::ffff:')) {
                // IPv4 address in v6 format
                return [request.connection.remoteAddress.replace('::ffff:', '')];
            }
            return [request.connection.remoteAddress];
        }
        return ['0.0.0.0'];
    };
    return VelocityTemplate;
}());
exports.VelocityTemplate = VelocityTemplate;
//# sourceMappingURL=index.js.map