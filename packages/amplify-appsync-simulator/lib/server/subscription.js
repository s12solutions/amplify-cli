"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var crypto = require("crypto");
var util_1 = require("util");
var http_1 = require("http");
var e2p = require("event-to-promise");
var portfinder = require("portfinder");
var mosca_1 = require("@conduitvc/mosca");
var ip_1 = require("ip");
var MINUTE = 1000 * 60;
var CONNECTION_TIME_OUT = 2 * MINUTE; // 2 mins
var TOPIC_EXPIRATION_TIMEOUT = 60 * MINUTE; // 60 mins
var BASE_PORT = 8900;
var MAX_PORT = 9999;
var log = console;
var SubscriptionServer = /** @class */ (function () {
    function SubscriptionServer(config, appSyncServerContext) {
        this.config = config;
        this.appSyncServerContext = appSyncServerContext;
        this.port = config.wsPort;
        this.webSocketServer = http_1.createServer();
        this.mqttServer = new mosca_1.Server({
            backend: { type: 'memory' },
            interfaces: [],
            logger: {
                level: process.env.DEBUG ? 'debug' : 'error',
            },
        });
        this.mqttServer.attachHttpServer(this.webSocketServer);
        this.registrations = new Map();
        this.iteratorTimeout = new Map();
        this.publishingTopics = new Set();
        this.mqttServer.on('clientConnected', this.afterClientConnect.bind(this));
        this.mqttServer.on('clientDisconnected', this.afterDisconnect.bind(this));
        this.mqttServer.on('subscribed', this.afterSubscription.bind(this));
        this.mqttServer.on('unsubscribed', this.afterUnsubscribe.bind(this));
    }
    SubscriptionServer.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, server;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
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
                        server = this.webSocketServer.listen(this.port);
                        return [4 /*yield*/, e2p(server, 'listening').then(function () {
                                var address = server.address();
                                _this.url = "ws://" + ip_1.address() + ":" + address.port + "/";
                                return server;
                            })];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    SubscriptionServer.prototype.stop = function () {
        if (this.webSocketServer) {
            this.webSocketServer.close();
            this.url = null;
            this.webSocketServer = null;
        }
    };
    SubscriptionServer.prototype.afterClientConnect = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var clientId, timeout;
            return __generator(this, function (_a) {
                clientId = client.id;
                log.info("client connected to subscription server (" + clientId + ")");
                timeout = this.iteratorTimeout.get(client.id);
                if (timeout) {
                    clearTimeout(timeout);
                }
                return [2 /*return*/];
            });
        });
    };
    SubscriptionServer.prototype.afterSubscription = function (topic, client) {
        return __awaiter(this, void 0, void 0, function () {
            var clientId, regs, reg, asyncIterator_1, asyncIterator, topicId, variables, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clientId = client.id;
                        log.info("client (" + clientId + ") subscribed to : " + topic);
                        regs = this.registrations.get(clientId);
                        if (!regs) {
                            log.error('No registration for clientId', clientId);
                            return [2 /*return*/];
                        }
                        reg = regs.find(function (_a) {
                            var topicId = _a.topicId;
                            return topicId === topic;
                        });
                        if (!reg) {
                            log.error("Not subscribed to subscriptionId: " + topic + " for clientId", clientId);
                            return [2 /*return*/];
                        }
                        if (!!reg.isRegistered) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.subscribeToGraphQL(reg.documentAST, reg.variables, reg.context)];
                    case 1:
                        asyncIterator_1 = _a.sent();
                        if (asyncIterator_1.errors) {
                            log.error('Error(s) subscribing via graphql', asyncIterator_1.errors);
                            return [2 /*return*/];
                        }
                        Object.assign(reg, {
                            asyncIterator: asyncIterator_1,
                            isRegistered: true,
                        });
                        _a.label = 2;
                    case 2:
                        asyncIterator = reg.asyncIterator, topicId = reg.topicId, variables = reg.variables;
                        log.info('clientConnect', { clientId: clientId, subscriptionId: topicId, variables: variables });
                        _a.label = 3;
                    case 3:
                        if (!true) return [3 /*break*/, 5];
                        return [4 /*yield*/, asyncIterator.next()];
                    case 4:
                        payload = (_a.sent()).value;
                        if (!this.shouldPublishSubscription(payload, variables)) {
                            console.info('skipping publish', { clientId: clientId, subscriptionId: topicId });
                            return [3 /*break*/, 3];
                        }
                        console.info('publish', util_1.inspect({ payload: payload, subscriptionId: topicId }, { depth: null }));
                        this.mqttServer.publish({
                            topic: topicId,
                            payload: JSON.stringify(payload),
                            qos: 0,
                            retain: false,
                        });
                        return [3 /*break*/, 3];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionServer.prototype.afterUnsubscribe = function (topic, client) {
        var clientId = client.id;
        console.info("client (" + clientId + ") unsubscribed to : " + topic);
        log.info("client (" + clientId + ") unsubscribed to : " + topic);
        var regs = this.registrations.get(clientId);
        if (!regs) {
            log.warn("Unsubscribe topic: " + topic + " from client with unknown id", clientId);
            return;
        }
        var reg = regs.find(function (_a) {
            var topicId = _a.topicId;
            return topicId === topic;
        });
        if (!reg) {
            log.warn("Unsubscribe unregistered subscription " + topic + " from client", clientId);
            return;
        }
        // turn off subscription, but keep registration so client
        // can resubscribe
        reg.asyncIterator.return();
        reg.isRegistered = false;
    };
    SubscriptionServer.prototype.afterDisconnect = function (client) {
        var clientId = client.id;
        log.info('clientDisconnect', { clientId: clientId });
        var reg = this.registrations.get(clientId);
        if (!reg) {
            log.warn('Disconnecting client with unknown id', clientId);
        }
    };
    SubscriptionServer.prototype.register = function (documentAST, variables, context) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, remoteAddress, clientId, subscriptionName, paramHash, topicId, registration, asyncIterator, currentRegistrations;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        connection = context.request.connection;
                        remoteAddress = connection.remoteAddress + ":" + connection.remotePort;
                        clientId = crypto
                            .createHash('MD5')
                            .update(remoteAddress)
                            .digest()
                            .toString('hex');
                        subscriptionName = documentAST.definitions[0].selectionSet.selections[0].name.value;
                        paramHash = variables && Object.keys(variables).length
                            ? crypto
                                .createHash('MD5')
                                .update(JSON.stringify(variables))
                                .digest()
                                .toString('hex')
                            : null;
                        topicId = [clientId, subscriptionName, paramHash].join('/');
                        log.info('register', { clientId: clientId, subscriptionId: topicId });
                        registration = {
                            context: context,
                            documentAST: documentAST,
                            variables: variables,
                            topicId: topicId,
                        };
                        return [4 /*yield*/, this.subscribeToGraphQL(documentAST, variables, context)];
                    case 1:
                        asyncIterator = _b.sent();
                        if (asyncIterator.errors) {
                            return [2 /*return*/, {
                                    errors: context.appsyncErrors || asyncIterator.errors,
                                    data: asyncIterator.data || null,
                                }];
                        }
                        Object.assign(registration, {
                            asyncIterator: asyncIterator,
                            isRegistered: true,
                        });
                        currentRegistrations = this.registrations.get(clientId) || [];
                        currentRegistrations.push(registration);
                        this.registrations.set(clientId, currentRegistrations);
                        // if client does not connect within this amount of time then end iterator.
                        this.iteratorTimeout.set(clientId, setTimeout(function () {
                            asyncIterator.return();
                            _this.iteratorTimeout.delete(clientId);
                        }, CONNECTION_TIME_OUT));
                        return [2 /*return*/, {
                                extensions: {
                                    subscription: {
                                        mqttConnections: [
                                            {
                                                url: this.url,
                                                topics: currentRegistrations.map(function (reg) { return reg.topicId; }),
                                                client: clientId,
                                            },
                                        ],
                                        newSubscriptions: (_a = {},
                                            _a[subscriptionName] = {
                                                topic: topicId,
                                                expireTime: Date.now() + TOPIC_EXPIRATION_TIMEOUT,
                                            },
                                            _a),
                                    },
                                },
                            }];
                }
            });
        });
    };
    SubscriptionServer.prototype.subscribeToGraphQL = function (document, variables, context) {
        return graphql_1.subscribe({
            schema: this.appSyncServerContext.schema,
            document: document,
            variableValues: variables,
            contextValue: context,
        });
    };
    SubscriptionServer.prototype.shouldPublishSubscription = function (payload, variables) {
        if (payload == null || (typeof payload === 'object' && payload.data == null)) {
            log.info('subscribe payload is null skipping publish', payload);
            return false;
        }
        var variableEntries = Object.entries(variables || {});
        if (!variableEntries.length) {
            return true;
        }
        var data = Object.entries(payload.data || {});
        var payloadData = data.length ? data[0].pop() : null;
        if (!payloadData) {
            return false;
        }
        // every variable key/value pair must match corresponding payload key/value pair
        var variableResult = variableEntries.every(function (_a) {
            var variableKey = _a[0], variableValue = _a[1];
            return payloadData[variableKey] === variableValue;
        });
        if (!variableResult) {
            console.info('subscribe payload did not match variables', util_1.inspect(payload));
            console.info('variables', util_1.inspect(variables));
            return false;
        }
        return true;
    };
    return SubscriptionServer;
}());
exports.SubscriptionServer = SubscriptionServer;
//# sourceMappingURL=subscription.js.map