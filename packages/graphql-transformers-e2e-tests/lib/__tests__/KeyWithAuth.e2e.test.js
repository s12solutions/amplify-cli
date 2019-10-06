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
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var graphql_key_transformer_1 = require("graphql-key-transformer");
var fs = require("fs");
var CloudFormationClient_1 = require("../CloudFormationClient");
var CognitoClient = require("aws-sdk/clients/cognitoidentityserviceprovider");
var S3 = require("aws-sdk/clients/s3");
var GraphQLClient_1 = require("../GraphQLClient");
var S3Client_1 = require("../S3Client");
var path = require("path");
var deployNestedStacks_1 = require("../deployNestedStacks");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var cognitoUtils_1 = require("../cognitoUtils");
// to deal with bug in cognito-identity-js
global.fetch = require("node-fetch");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "KeyWithAuth-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-key-with-auth-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/key_auth_transform_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var GRAPHQL_ENDPOINT = undefined;
/**
 * Client 1 is logged in and is a member of the Admin group.
 */
var GRAPHQL_CLIENT_1 = undefined;
/**
 * Client 1 is logged in and is a member of the Admin group via an access token.
 */
var GRAPHQL_CLIENT_1_ACCESS = undefined;
/**
 * Client 2 is logged in and is a member of the Devs group.
 */
var GRAPHQL_CLIENT_2 = undefined;
/**
 * Client 3 is logged in and has no group memberships.
 */
var GRAPHQL_CLIENT_3 = undefined;
var USER_POOL_ID = undefined;
var USERNAME1 = 'user1@test.com';
var USERNAME2 = 'user2@test.com';
var USERNAME3 = 'user3@test.com';
var TMP_PASSWORD = 'Password123!';
var REAL_PASSWORD = 'Password1234!';
var ADMIN_GROUP_NAME = 'Admin';
var DEVS_GROUP_NAME = 'Devs';
var PARTICIPANT_GROUP_NAME = 'Participant';
var WATCHER_GROUP_NAME = 'Watcher';
var cognitoClient = new CognitoClient({ apiVersion: '2016-04-19', region: 'us-west-2' });
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
function deleteDirectory(directory) {
    var files = fs.readdirSync(directory);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var contentPath = path.join(directory, file);
        if (fs.lstatSync(contentPath).isDirectory()) {
            deleteDirectory(contentPath);
            fs.rmdirSync(contentPath);
        }
        else {
            fs.unlinkSync(contentPath);
        }
    }
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, e_1, userPoolResponse, userPoolClientResponse, userPoolClientId, out, finishedStack, getApiEndpoint, getApiKey, apiKey, authRes, authRes2, authRes3, authResAfterGroup, idToken, accessToken, authRes2AfterGroup, idToken2, idToken3, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Order\n        @model\n        @key(fields: [\"customerEmail\", \"orderId\"])\n        @key(name: \"GSI\", fields: [\"orderId\"], queryField: \"ordersByOrderId\")\n        @auth(rules: [{ allow: owner, ownerField: \"customerEmail\" }, { allow: groups, groups: [\"Admin\"] }])\n    {\n        customerEmail: String!\n        createdAt: String\n        orderId: String!\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_key_transformer_1.default(),
                        new graphql_auth_transformer_1.default({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: "AMAZON_COGNITO_USER_POOLS"
                                },
                                additionalAuthenticationProviders: []
                            }
                        })
                    ]
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, awsS3Client.createBucket({ Bucket: BUCKET_NAME }).promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.error("Failed to create bucket: " + e_1);
                return [3 /*break*/, 4];
            case 4: return [4 /*yield*/, cognitoUtils_1.createUserPool(cognitoClient, "UserPool" + STACK_NAME)];
            case 5:
                userPoolResponse = _a.sent();
                USER_POOL_ID = userPoolResponse.UserPool.Id;
                return [4 /*yield*/, cognitoUtils_1.createUserPoolClient(cognitoClient, USER_POOL_ID, "UserPool" + STACK_NAME)];
            case 6:
                userPoolClientResponse = _a.sent();
                userPoolClientId = userPoolClientResponse.UserPoolClient.ClientId;
                _a.label = 7;
            case 7:
                _a.trys.push([7, 23, , 24]);
                out = transformer.transform(validSchema);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { AuthCognitoUserPoolId: USER_POOL_ID }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)];
            case 8:
                finishedStack = _a.sent();
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                GRAPHQL_ENDPOINT = getApiEndpoint(finishedStack.Outputs);
                console.log("Using graphql url: " + GRAPHQL_ENDPOINT);
                apiKey = getApiKey(finishedStack.Outputs);
                console.log("API KEY: " + apiKey);
                expect(apiKey).not.toBeTruthy();
                // Verify we have all the details
                expect(GRAPHQL_ENDPOINT).toBeTruthy();
                expect(USER_POOL_ID).toBeTruthy();
                expect(userPoolClientId).toBeTruthy();
                // Configure Amplify, create users, and sign in.
                cognitoUtils_1.configureAmplify(USER_POOL_ID, userPoolClientId);
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 9:
                authRes = _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 10:
                authRes2 = _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME3, TMP_PASSWORD, REAL_PASSWORD)];
            case 11:
                authRes3 = _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, ADMIN_GROUP_NAME)];
            case 12:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, PARTICIPANT_GROUP_NAME)];
            case 13:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, WATCHER_GROUP_NAME)];
            case 14:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, DEVS_GROUP_NAME)];
            case 15:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(ADMIN_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 16:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(PARTICIPANT_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 17:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(WATCHER_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 18:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(DEVS_GROUP_NAME, USERNAME2, USER_POOL_ID)];
            case 19:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 20:
                authResAfterGroup = _a.sent();
                idToken = authResAfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_1 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken });
                accessToken = authResAfterGroup.getAccessToken().getJwtToken();
                GRAPHQL_CLIENT_1_ACCESS = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: accessToken });
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 21:
                authRes2AfterGroup = _a.sent();
                idToken2 = authRes2AfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_2 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken2 });
                idToken3 = authRes3.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_3 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken3 });
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, 5000); })];
            case 22:
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                _a.sent();
                return [3 /*break*/, 24];
            case 23:
                e_2 = _a.sent();
                console.error(e_2);
                expect(true).toEqual(false);
                return [3 /*break*/, 24];
            case 24: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_3, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                console.log('Deleting stack ' + STACK_NAME);
                return [4 /*yield*/, cf.deleteStack(STACK_NAME)];
            case 1:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.deleteUserPool(cognitoClient, USER_POOL_ID)];
            case 2:
                _a.sent();
                return [4 /*yield*/, cf.waitForStack(STACK_NAME)];
            case 3:
                _a.sent();
                console.log('Successfully deleted stack ' + STACK_NAME);
                return [3 /*break*/, 5];
            case 4:
                e_3 = _a.sent();
                if (e_3.code === 'ValidationError' && e_3.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_3);
                    expect(true).toEqual(false);
                }
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                e_4 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_4);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
/**
 * Test queries below
 */
test('Test createOrder mutation as admin', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_1, USERNAME2, "order1")];
            case 1:
                response = _a.sent();
                expect(response.data.createOrder.customerEmail).toBeDefined();
                expect(response.data.createOrder.orderId).toEqual('order1');
                expect(response.data.createOrder.createdAt).toBeDefined();
                return [2 /*return*/];
        }
    });
}); });
test('Test createOrder mutation as owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_2, USERNAME2, "order2")];
            case 1:
                response = _a.sent();
                expect(response.data.createOrder.customerEmail).toBeDefined();
                expect(response.data.createOrder.orderId).toEqual('order2');
                expect(response.data.createOrder.createdAt).toBeDefined();
                return [2 /*return*/];
        }
    });
}); });
test('Test createOrder mutation as owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_3, USERNAME2, "order3")];
            case 1:
                response = _a.sent();
                expect(response.data.createOrder).toBeNull();
                expect(response.errors).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
test('Test list orders as owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var listResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_3, USERNAME3, "owned1")];
            case 1:
                _a.sent();
                return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_3, USERNAME3, "owned2")];
            case 2:
                _a.sent();
                return [4 /*yield*/, listOrders(GRAPHQL_CLIENT_3, USERNAME3, { beginsWith: "owned" })];
            case 3:
                listResponse = _a.sent();
                expect(listResponse.data.listOrders.items).toHaveLength(2);
                return [2 /*return*/];
        }
    });
}); });
test('Test list orders as non owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var listResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_3, USERNAME3, "unowned1")];
            case 1:
                _a.sent();
                return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_3, USERNAME3, "unowned2")];
            case 2:
                _a.sent();
                return [4 /*yield*/, listOrders(GRAPHQL_CLIENT_2, USERNAME3, { beginsWith: "unowned" })];
            case 3:
                listResponse = _a.sent();
                expect(listResponse.data.listOrders.items).toHaveLength(0);
                return [2 /*return*/];
        }
    });
}); });
test('Test get orders as owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var getResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_2, USERNAME2, "myobj")];
            case 1:
                _a.sent();
                return [4 /*yield*/, getOrder(GRAPHQL_CLIENT_2, USERNAME2, "myobj")];
            case 2:
                getResponse = _a.sent();
                expect(getResponse.data.getOrder.orderId).toEqual("myobj");
                return [2 /*return*/];
        }
    });
}); });
test('Test get orders as non-owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var getResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_2, USERNAME2, "notmyobj")];
            case 1:
                _a.sent();
                return [4 /*yield*/, getOrder(GRAPHQL_CLIENT_3, USERNAME2, "notmyobj")];
            case 2:
                getResponse = _a.sent();
                expect(getResponse.data.getOrder).toBeNull();
                expect(getResponse.errors).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
test('Test query orders as owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var listResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_3, USERNAME3, "ownedby3a")];
            case 1:
                _a.sent();
                return [4 /*yield*/, ordersByOrderId(GRAPHQL_CLIENT_3, "ownedby3a")];
            case 2:
                listResponse = _a.sent();
                expect(listResponse.data.ordersByOrderId.items).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
test('Test query orders as non owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var listResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder(GRAPHQL_CLIENT_3, USERNAME3, "notownedby2a")];
            case 1:
                _a.sent();
                return [4 /*yield*/, ordersByOrderId(GRAPHQL_CLIENT_2, "notownedby2a")];
            case 2:
                listResponse = _a.sent();
                expect(listResponse.data.ordersByOrderId.items).toHaveLength(0);
                return [2 /*return*/];
        }
    });
}); });
function createOrder(client, customerEmail, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query("mutation CreateOrder($input: CreateOrderInput!) {\n        createOrder(input: $input) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", {
                        input: { customerEmail: customerEmail, orderId: orderId }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function updateOrder(client, customerEmail, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query("mutation UpdateOrder($input: UpdateOrderInput!) {\n        updateOrder(input: $input) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", {
                        input: { customerEmail: customerEmail, orderId: orderId }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function deleteOrder(client, customerEmail, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query("mutation DeleteOrder($input: DeleteOrderInput!) {\n        deleteOrder(input: $input) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", {
                        input: { customerEmail: customerEmail, orderId: orderId }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function getOrder(client, customerEmail, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query("query GetOrder($customerEmail: String!, $orderId: String!) {\n        getOrder(customerEmail: $customerEmail, orderId: $orderId) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", { customerEmail: customerEmail, orderId: orderId })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function listOrders(client, customerEmail, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query("query ListOrder($customerEmail: String, $orderId: ModelStringKeyConditionInput) {\n        listOrders(customerEmail: $customerEmail, orderId: $orderId) {\n            items {\n                customerEmail\n                orderId\n                createdAt\n            }\n            nextToken\n        }\n    }", { customerEmail: customerEmail, orderId: orderId })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function ordersByOrderId(client, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query("query OrdersByOrderId($orderId: String!) {\n        ordersByOrderId(orderId: $orderId) {\n            items {\n                customerEmail\n                orderId\n                createdAt\n            }\n            nextToken\n        }\n    }", { orderId: orderId })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
//# sourceMappingURL=KeyWithAuth.e2e.test.js.map