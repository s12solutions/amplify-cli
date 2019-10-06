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
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var fs = require("fs");
var CloudFormationClient_1 = require("../CloudFormationClient");
var S3 = require("aws-sdk/clients/s3");
var CognitoClient = require("aws-sdk/clients/cognitoidentityserviceprovider");
var GraphQLClient_1 = require("../GraphQLClient");
var S3Client_1 = require("../S3Client");
var deployNestedStacks_1 = require("../deployNestedStacks");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var cognitoUtils_1 = require("../cognitoUtils");
// to deal with bug in cognito-identity-js
global.fetch = require("node-fetch");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "ConnectionsWithAuthTests-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "connections-with-auth-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_BUILD_ROOT = '/tmp/connections_with_auth_test/';
var DEPLOYMENT_ROOT_KEY = 'deployments';
var GRAPHQL_ENDPOINT = undefined;
/**
 * Client 1 is logged in and is a member of the Admin group.
 */
var GRAPHQL_CLIENT_1 = undefined;
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
function createBucket(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        Bucket: name,
                    };
                    awsS3Client.createBucket(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
function deleteBucket(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        Bucket: name,
                    };
                    awsS3Client.deleteBucket(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, userPoolResponse, userPoolClientResponse, userPoolClientId, out, finishedStack, getApiEndpoint, authRes, authRes2, authRes3, authResAfterGroup, idToken, authRes2AfterGroup, idToken2, idToken3, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Create a stack for the post model with auth enabled.
                if (!fs.existsSync(LOCAL_BUILD_ROOT)) {
                    fs.mkdirSync(LOCAL_BUILD_ROOT);
                }
                return [4 /*yield*/, createBucket(BUCKET_NAME)];
            case 1:
                _a.sent();
                validSchema = "\n    type Post @model(\n        subscriptions: {\n            level: public\n    })@auth(rules: [{ allow: owner }]) {\n        id: ID!\n        title: String!\n        author: User @connection(name: \"UserPosts\", keyField: \"owner\")\n        owner: String\n    }\n    type User @model(\n        subscriptions: {\n            level: public\n        }) @auth(rules: [{ allow: owner }]) {\n        id: ID!\n        posts: [Post!]! @connection(name: \"UserPosts\", keyField: \"owner\")\n    }\n    type FieldProtected @model(\n        subscriptions: {\n            level: public\n    }){\n        id: ID!\n        owner: String\n        ownerOnly: String @auth(rules: [{ allow: owner }])\n    }\n    type OpenTopLevel @model(\n        subscriptions: {\n            level: public\n    }) {\n        id: ID!\n        name: String\n        owner: String\n        protected: [ConnectionProtected] @connection(name: \"ProtectedConnection\")\n    }\n    type ConnectionProtected @model(\n        subscriptions: {\n            level: public\n        }\n        queries: null\n    )@auth(rules: [{ allow: owner }]) {\n        id: ID!\n        name: String\n        owner: String\n        topLevel: OpenTopLevel @connection(name: \"ProtectedConnection\")\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_connection_transformer_1.default(),
                        new graphql_auth_transformer_1.default({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: "AMAZON_COGNITO_USER_POOLS"
                                },
                                additionalAuthenticationProviders: []
                            }
                        }),
                    ]
                });
                return [4 /*yield*/, cognitoUtils_1.createUserPool(cognitoClient, "UserPool" + STACK_NAME)];
            case 2:
                userPoolResponse = _a.sent();
                USER_POOL_ID = userPoolResponse.UserPool.Id;
                return [4 /*yield*/, cognitoUtils_1.createUserPoolClient(cognitoClient, USER_POOL_ID, "UserPool" + STACK_NAME)];
            case 3:
                userPoolClientResponse = _a.sent();
                userPoolClientId = userPoolClientResponse.UserPoolClient.ClientId;
                _a.label = 4;
            case 4:
                _a.trys.push([4, 20, , 21]);
                out = transformer.transform(validSchema);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { AuthCognitoUserPoolId: USER_POOL_ID }, LOCAL_BUILD_ROOT, BUCKET_NAME, DEPLOYMENT_ROOT_KEY, BUILD_TIMESTAMP)];
            case 5:
                finishedStack = _a.sent();
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                GRAPHQL_ENDPOINT = getApiEndpoint(finishedStack.Outputs);
                console.log("Using graphql url: " + GRAPHQL_ENDPOINT);
                // Verify we have all the details
                expect(GRAPHQL_ENDPOINT).toBeTruthy();
                expect(USER_POOL_ID).toBeTruthy();
                expect(userPoolClientId).toBeTruthy();
                // Configure Amplify, create users, and sign in.
                cognitoUtils_1.configureAmplify(USER_POOL_ID, userPoolClientId);
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 6:
                authRes = _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 7:
                authRes2 = _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME3, TMP_PASSWORD, REAL_PASSWORD)];
            case 8:
                authRes3 = _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, ADMIN_GROUP_NAME)];
            case 9:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, PARTICIPANT_GROUP_NAME)];
            case 10:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, WATCHER_GROUP_NAME)];
            case 11:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, DEVS_GROUP_NAME)];
            case 12:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(ADMIN_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 13:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(PARTICIPANT_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 14:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(WATCHER_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 15:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(DEVS_GROUP_NAME, USERNAME2, USER_POOL_ID)];
            case 16:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 17:
                authResAfterGroup = _a.sent();
                idToken = authResAfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_1 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken });
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 18:
                authRes2AfterGroup = _a.sent();
                idToken2 = authRes2AfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_2 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken2 });
                idToken3 = authRes3.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_3 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken3 });
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, 5000); })];
            case 19:
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                _a.sent();
                return [3 /*break*/, 21];
            case 20:
                e_1 = _a.sent();
                console.error(e_1);
                throw e_1;
            case 21: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_2, e_3;
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
                e_2 = _a.sent();
                if (e_2.code === 'ValidationError' && e_2.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_2);
                    throw e_2;
                }
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                e_3 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_3);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
/**
 * Tests
 */
test('Test creating a post and immediately view it via the User.posts connection.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser1, response, getResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createUser(input: { id: \"user1@test.com\" }) {\n            id\n        }\n    }", {})];
            case 1:
                createUser1 = _a.sent();
                console.log(createUser1);
                expect(createUser1.data.createUser.id).toEqual("user1@test.com");
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            owner\n        }\n    }", {})];
            case 2:
                response = _a.sent();
                console.log(response);
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.owner).toBeDefined();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        getUser(id: \"user1@test.com\") {\n            posts {\n                items {\n                    id\n                    title\n                    owner\n                    author {\n                        id\n                    }\n                }\n            }\n        }\n    }", {})];
            case 3:
                getResponse = _a.sent();
                console.log(JSON.stringify(getResponse, null, 4));
                expect(getResponse.data.getUser.posts.items[0].id).toBeDefined();
                expect(getResponse.data.getUser.posts.items[0].title).toEqual("Hello, World!");
                expect(getResponse.data.getUser.posts.items[0].owner).toEqual("user1@test.com");
                expect(getResponse.data.getUser.posts.items[0].author.id).toEqual("user1@test.com");
                return [2 /*return*/];
        }
    });
}); });
test('Testing reading an owner protected field as a non owner', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response1, response2, response3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createFieldProtected(input: { id: \"1\", owner: \"" + USERNAME1 + "\", ownerOnly: \"owner-protected\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 1:
                response1 = _a.sent();
                console.log(response1);
                expect(response1.data.createFieldProtected.id).toEqual("1");
                expect(response1.data.createFieldProtected.owner).toEqual(USERNAME1);
                expect(response1.data.createFieldProtected.ownerOnly).toEqual("owner-protected");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        getFieldProtected(id: \"1\") {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.getFieldProtected.ownerOnly).toBeNull();
                expect(response2.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        getFieldProtected(id: \"1\") {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 3:
                response3 = _a.sent();
                console.log(response3);
                expect(response3.data.getFieldProtected.id).toEqual("1");
                expect(response3.data.getFieldProtected.owner).toEqual(USERNAME1);
                expect(response3.data.getFieldProtected.ownerOnly).toEqual("owner-protected");
                return [2 /*return*/];
        }
    });
}); });
test('Test that @connection resolvers respect @model read operations.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response1, response2, response3, response4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createOpenTopLevel(input: { id: \"1\", owner: \"" + USERNAME1 + "\", name: \"open\" }) {\n            id\n            owner\n            name\n        }\n    }", {})];
            case 1:
                response1 = _a.sent();
                console.log(response1);
                expect(response1.data.createOpenTopLevel.id).toEqual("1");
                expect(response1.data.createOpenTopLevel.owner).toEqual(USERNAME1);
                expect(response1.data.createOpenTopLevel.name).toEqual("open");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        createConnectionProtected(input: { id: \"1\", owner: \"" + USERNAME2 + "\", name: \"closed\", connectionProtectedTopLevelId: \"1\" }) {\n            id\n            owner\n            name\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.createConnectionProtected.id).toEqual("1");
                expect(response2.data.createConnectionProtected.owner).toEqual(USERNAME2);
                expect(response2.data.createConnectionProtected.name).toEqual("closed");
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        getOpenTopLevel(id: \"1\") {\n            id\n            protected {\n                items {\n                    id\n                    name\n                    owner\n                }\n            }\n        }\n    }", {})];
            case 3:
                response3 = _a.sent();
                console.log(response3);
                expect(response3.data.getOpenTopLevel.id).toEqual("1");
                expect(response3.data.getOpenTopLevel.protected.items).toHaveLength(0);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        getOpenTopLevel(id: \"1\") {\n            id\n            protected {\n                items {\n                    id\n                    name\n                    owner\n                }\n            }\n        }\n    }", {})];
            case 4:
                response4 = _a.sent();
                console.log(response4);
                expect(response4.data.getOpenTopLevel.id).toEqual("1");
                expect(response4.data.getOpenTopLevel.protected.items).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
// Per field auth in mutations
test('Test that owners cannot set the field of a FieldProtected object unless authorized.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response1, response2, response3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createFieldProtected(input: { id: \"2\", owner: \"" + USERNAME1 + "\", ownerOnly: \"owner-protected\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 1:
                response1 = _a.sent();
                console.log(JSON.stringify(response1));
                expect(response1.data.createFieldProtected.id).toEqual("2");
                expect(response1.data.createFieldProtected.owner).toEqual(USERNAME1);
                expect(response1.data.createFieldProtected.ownerOnly).toEqual("owner-protected");
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createFieldProtected(input: { id: \"3\", owner: \"" + USERNAME2 + "\", ownerOnly: \"owner-protected\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.createFieldProtected).toBeNull();
                expect(response2.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createFieldProtected(input: { id: \"4\", owner: \"" + USERNAME2 + "\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 3:
                response3 = _a.sent();
                console.log(response3);
                expect(response3.data.createFieldProtected.id).toEqual("4");
                expect(response3.data.createFieldProtected.owner).toEqual(USERNAME2);
                // The length is one because the 'ownerOnly' field is protected on reads.
                // Since the caller is not the owner this will throw after the mutation succeeds
                // and return partial results.
                expect(response3.errors).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
test('Test that owners cannot update the field of a FieldProtected object unless authorized.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response1, response2, response3, response4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createFieldProtected(input: { owner: \"" + USERNAME1 + "\", ownerOnly: \"owner-protected\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 1:
                response1 = _a.sent();
                console.log(JSON.stringify(response1));
                expect(response1.data.createFieldProtected.id).not.toBeNull();
                expect(response1.data.createFieldProtected.owner).toEqual(USERNAME1);
                expect(response1.data.createFieldProtected.ownerOnly).toEqual("owner-protected");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        updateFieldProtected(input: { id: \"" + response1.data.createFieldProtected.id + "\", ownerOnly: \"owner2-protected\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.updateFieldProtected).toBeNull();
                expect(response2.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        updateFieldProtected(input: { id: \"" + response1.data.createFieldProtected.id + "\", ownerOnly: \"updated\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 3:
                response3 = _a.sent();
                console.log(response3);
                expect(response3.data.updateFieldProtected.id).toEqual(response1.data.createFieldProtected.id);
                expect(response3.data.updateFieldProtected.owner).toEqual(USERNAME1);
                expect(response3.data.updateFieldProtected.ownerOnly).toEqual("updated");
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("mutation {\n        updateFieldProtected(input: { id: \"" + response1.data.createFieldProtected.id + "\", owner: \"" + USERNAME3 + "\" }) {\n            id\n            owner\n            ownerOnly\n        }\n    }", {})];
            case 4:
                response4 = _a.sent();
                console.log(response4);
                expect(response4.data.updateFieldProtected.id).toEqual(response1.data.createFieldProtected.id);
                expect(response4.data.updateFieldProtected.owner).toEqual(USERNAME3);
                expect(response4.data.updateFieldProtected.ownerOnly).toEqual("updated");
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=ConnectionsWithAuthTests.e2e.test.js.map