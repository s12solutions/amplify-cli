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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors = require("cors");
var e2p = require("event-to-promise");
var express = require("express");
var graphql_1 = require("graphql");
var ip_1 = require("ip");
var jwtDecode = require("jwt-decode");
var path_1 = require("path");
var portfinder = require("portfinder");
var type_definition_1 = require("../type-definition");
var expose_graphql_errors_1 = require("../utils/expose-graphql-errors");
var BASE_PORT = 8900;
var MAX_PORT = 9999;
var STATIC_ROOT = path_1.join(__dirname, '..', '..', 'public');
var OperationServer = /** @class */ (function () {
    function OperationServer(config, simulatorContext, subscriptionServer) {
        this.config = config;
        this.simulatorContext = simulatorContext;
        this.subscriptionServer = subscriptionServer;
        this.port = config.port;
        this.app = express();
        this.app.use(express.json());
        this.app.use(cors());
        this.app.post('/graphql', this.handleRequest.bind(this));
        this.app.get('/api-config', this.handleAPIInfoRequest.bind(this));
        this.app.use('/', express.static(STATIC_ROOT));
        this.server = null;
    }
    OperationServer.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.server) {
                            throw new Error('Server is already running');
                        }
                        if (!!this.port) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, portfinder.getPortPromise({
                                startPort: BASE_PORT,
                                stopPort: MAX_PORT,
                            })];
                    case 1:
                        _a.port = _b.sent();
                        _b.label = 2;
                    case 2:
                        this.server = this.app.listen(this.port);
                        return [4 /*yield*/, e2p(this.server, 'listening').then(function () {
                                _this.connection = _this.server.address();
                                _this.url = "http://" + ip_1.address() + ":" + _this.connection.port;
                                return _this.server;
                            })];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    OperationServer.prototype.stop = function () {
        if (this.server) {
            this.server.close();
            this.server = null;
            this.connection = null;
        }
    };
    OperationServer.prototype.handleAPIInfoRequest = function (request, response) {
        return response.send(this.simulatorContext.appSyncConfig);
    };
    OperationServer.prototype.handleRequest = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, requestAuthorizationMode, _a, _b, variables, query, operationName, doc, validationErrors, queryType, authorization, jwt, context, _c, results, errors, result, errors_1, subscription, e_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        headers = request.headers;
                        requestAuthorizationMode = void 0;
                        try {
                            requestAuthorizationMode = this.checkAuthorization(request);
                        }
                        catch (e) {
                            return [2 /*return*/, response.status(401).send({
                                    errors: [
                                        {
                                            errorType: 'UnauthorizedException',
                                            message: e.message,
                                        },
                                    ],
                                })];
                        }
                        _a = request.body, _b = _a.variables, variables = _b === void 0 ? {} : _b, query = _a.query, operationName = _a.operationName;
                        doc = graphql_1.parse(query);
                        if (!this.simulatorContext.schema) {
                            return [2 /*return*/, response.send({
                                    data: null,
                                    error: 'No schema available',
                                })];
                        }
                        validationErrors = graphql_1.validate(this.simulatorContext.schema, doc, graphql_1.specifiedRules);
                        if (validationErrors.length) {
                            return [2 /*return*/, response.send({
                                    errors: validationErrors,
                                })];
                        }
                        queryType = doc.definitions[0].operation;
                        authorization = headers.Authorization || headers.authorization;
                        jwt = authorization ? jwtDecode(authorization) : {};
                        context = { jwt: jwt, requestAuthorizationMode: requestAuthorizationMode, request: request, appsyncErrors: [] };
                        _c = queryType;
                        switch (_c) {
                            case 'query': return [3 /*break*/, 1];
                            case 'mutation': return [3 /*break*/, 1];
                            case 'subscription': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 6];
                    case 1: return [4 /*yield*/, graphql_1.execute(this.simulatorContext.schema, doc, null, context, variables, operationName)];
                    case 2:
                        results = _d.sent();
                        errors = __spreadArrays((results.errors || []), context.appsyncErrors);
                        if (errors.length > 0) {
                            results.errors = expose_graphql_errors_1.exposeGraphQLErrors(errors);
                        }
                        return [2 /*return*/, response.send(__assign({ data: null }, results))];
                    case 3: return [4 /*yield*/, graphql_1.execute(this.simulatorContext.schema, doc, null, context, variables, operationName)];
                    case 4:
                        result = _d.sent();
                        if (context.appsyncErrors.length) {
                            errors_1 = expose_graphql_errors_1.exposeGraphQLErrors(context.appsyncErrors);
                            return [2 /*return*/, response.send({
                                    errors: errors_1,
                                })];
                        }
                        return [4 /*yield*/, this.subscriptionServer.register(doc, variables, context)];
                    case 5:
                        subscription = _d.sent();
                        return [2 /*return*/, response.send(__assign(__assign({}, subscription), result))];
                    case 6: throw new Error("unknown operation type: " + queryType);
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        e_1 = _d.sent();
                        console.log('Error while executing GraphQL statement', e_1);
                        return [2 /*return*/, response.send({
                                errorMessage: e_1.message,
                            })];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    OperationServer.prototype.checkAuthorization = function (request) {
        var appSyncConfig = this.simulatorContext.appSyncConfig;
        var headers = request.headers;
        var apiKey = headers['x-api-key'];
        var authorization = headers.Authorization || headers.authorization;
        var jwtToken = authorization ? jwtDecode(authorization) : null;
        var allowedAuthTypes = this.getAllowedAuthTypes();
        if (apiKey && allowedAuthTypes.includes(type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.API_KEY)) {
            if (appSyncConfig.apiKey === apiKey) {
                return type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.API_KEY;
            }
            throw new Error('UnauthorizedException');
        }
        else if (jwtToken) {
            if (this.isCognitoUserPoolToken(jwtToken)) {
                return type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS;
            }
            else if (this.isOidcToken(jwtToken)) {
                return type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.OPENID_CONNECT;
            }
            throw new Error('UnauthorizedException');
        }
        else {
            throw new Error('Missing authorization header');
        }
    };
    OperationServer.prototype.getAllowedAuthTypes = function () {
        var appSyncConfig = this.simulatorContext.appSyncConfig;
        var allAuthTypes = __spreadArrays([
            appSyncConfig.defaultAuthenticationType
        ], appSyncConfig.additionalAuthenticationProviders);
        return allAuthTypes.map(function (c) { return c.authenticationType; }).filter(function (c) { return c; });
    };
    OperationServer.prototype.isCognitoUserPoolToken = function (token) {
        var cupToken = false;
        var allowedAuthTypes = this.getAllowedAuthTypes();
        if (allowedAuthTypes.includes(type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS) &&
            token.iss.startsWith('https://cognito-idp.')) {
            cupToken = true;
        }
        return cupToken;
    };
    OperationServer.prototype.isOidcToken = function (token) {
        var oidcToken = false;
        var allowedAuthTypes = this.getAllowedAuthTypes();
        var appSyncConfig = this.simulatorContext.appSyncConfig;
        var allAuthTypes = __spreadArrays([
            appSyncConfig.defaultAuthenticationType
        ], appSyncConfig.additionalAuthenticationProviders);
        var oidcIssuers = allAuthTypes
            .filter(function (authType) {
            return authType.authenticationType === type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.OPENID_CONNECT;
        })
            .map(function (auth) {
            return auth.openIDConnectConfig.Issuer;
        });
        if (allowedAuthTypes.includes(type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.OPENID_CONNECT)) {
            if (oidcIssuers.length && oidcIssuers.includes(token.iss)) {
                oidcToken = true;
            }
        }
        return oidcToken;
    };
    return OperationServer;
}());
exports.OperationServer = OperationServer;
//# sourceMappingURL=operations.js.map