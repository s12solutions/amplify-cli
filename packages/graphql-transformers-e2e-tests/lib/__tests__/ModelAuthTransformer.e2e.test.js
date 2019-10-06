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
var STACK_NAME = "ModelAuthTransformerTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-auth-transformer-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/model_auth_transform_tests/';
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
                validSchema = "\n    type Post @model @auth(rules: [{ allow: owner }]) {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n        owner: String\n    }\n    type Salary @model @auth(\n        rules: [\n            {allow: owner},\n            {allow: groups, groups: [\"Admin\"]}\n        ]\n    ) {\n        id: ID!\n        wage: Int\n        owner: String\n    }\n    type AdminNote @model @auth(\n        rules: [\n            {allow: groups, groups: [\"Admin\"], groupClaim: \"cognito:groups\"}\n        ]\n    ) {\n        id: ID!\n        content: String!\n    }\n    type ManyGroupProtected @model @auth(rules: [{allow: groups, groupsField: \"groups\"}]) {\n        id: ID!\n        value: Int\n        groups: [String]\n    }\n    type SingleGroupProtected @model @auth(rules: [{allow: groups, groupsField: \"group\"}]) {\n        id: ID!\n        value: Int\n        group: String\n    }\n    type PWProtected\n        @auth(rules: [\n            {allow: groups, groupsField: \"participants\", mutations: [update, delete], queries: [get, list]},\n            {allow: groups, groupsField: \"watchers\", mutations: [], queries: [get, list]}\n        ])\n        @model\n    {\n        id: ID!\n        content: String!\n        participants: String\n        watchers: String\n    }\n    type AllThree\n        @auth(rules: [\n            {allow: owner, identityField: \"username\" },\n            {allow: owner, ownerField: \"editors\", identityField: \"cognito:username\" },\n            {allow: groups, groups: [\"Admin\"]},\n            {allow: groups, groups: [\"Execs\"]},\n            {allow: groups, groupsField: \"groups\"},\n            {allow: groups, groupsField: \"alternativeGroup\"}\n        ])\n        @model\n    {\n        id: ID!\n        owner: String\n        editors: [String]\n        groups: [String]\n        alternativeGroup: String\n    }\n    # The owner should always start with https://cognito-idp\n    type TestIdentity @model @auth(rules: [{ allow: owner, identityField: \"iss\" }]) {\n        id: ID!\n        title: String!\n        owner: String\n    }\n    type OwnerReadProtected @model @auth(rules: [{ allow: owner, operations: [read] }]) {\n        id: ID!\n        content: String\n        owner: String\n    }\n    type OwnerCreateUpdateDeleteProtected @model @auth(rules: [{ allow: owner, operations: [create, update, delete] }]) {\n        id: ID!\n        content: String\n        owner: String\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
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
test('Test createPost mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, response2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                console.log(response);
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1_ACCESS.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.createPost.id).toBeDefined();
                expect(response2.data.createPost.title).toEqual('Hello, World!');
                expect(response2.data.createPost.createdAt).toBeDefined();
                expect(response2.data.createPost.updatedAt).toBeDefined();
                expect(response2.data.createPost.owner).toEqual(USERNAME1);
                return [2 /*return*/];
        }
    });
}); });
test('Test getPost query when authorized', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, getResponse, getResponseAccess;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        getPost(id: \"" + response.data.createPost.id + "\") {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 2:
                getResponse = _a.sent();
                expect(getResponse.data.getPost.id).toBeDefined();
                expect(getResponse.data.getPost.title).toEqual('Hello, World!');
                expect(getResponse.data.getPost.createdAt).toBeDefined();
                expect(getResponse.data.getPost.updatedAt).toBeDefined();
                expect(getResponse.data.getPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1_ACCESS.query("query {\n        getPost(id: \"" + response.data.createPost.id + "\") {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 3:
                getResponseAccess = _a.sent();
                expect(getResponseAccess.data.getPost.id).toBeDefined();
                expect(getResponseAccess.data.getPost.title).toEqual('Hello, World!');
                expect(getResponseAccess.data.getPost.createdAt).toBeDefined();
                expect(getResponseAccess.data.getPost.updatedAt).toBeDefined();
                expect(getResponseAccess.data.getPost.owner).toEqual(USERNAME1);
                return [2 /*return*/];
        }
    });
}); });
test('Test getPost query when not authorized', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, getResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.owner).toBeDefined();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        getPost(id: \"" + response.data.createPost.id + "\") {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 2:
                getResponse = _a.sent();
                expect(getResponse.data.getPost).toEqual(null);
                expect(getResponse.errors.length).toEqual(1);
                expect(getResponse.errors[0].errorType).toEqual('Unauthorized');
                return [2 /*return*/];
        }
    });
}); });
test('Test updatePost mutation when authorized', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, updateResponse, updateResponseAccess;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        updatePost(input: { id: \"" + response.data.createPost.id + "\", title: \"Bye, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 2:
                updateResponse = _a.sent();
                expect(updateResponse.data.updatePost.id).toEqual(response.data.createPost.id);
                expect(updateResponse.data.updatePost.title).toEqual('Bye, World!');
                expect(updateResponse.data.updatePost.updatedAt > response.data.createPost.updatedAt).toEqual(true);
                return [4 /*yield*/, GRAPHQL_CLIENT_1_ACCESS.query("mutation {\n        updatePost(input: { id: \"" + response.data.createPost.id + "\", title: \"Bye, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 3:
                updateResponseAccess = _a.sent();
                expect(updateResponseAccess.data.updatePost.id).toEqual(response.data.createPost.id);
                expect(updateResponseAccess.data.updatePost.title).toEqual('Bye, World!');
                expect(updateResponseAccess.data.updatePost.updatedAt > response.data.createPost.updatedAt).toEqual(true);
                return [2 /*return*/];
        }
    });
}); });
test('Test updatePost mutation when not authorized', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, updateResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.owner).toBeDefined();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        updatePost(input: { id: \"" + response.data.createPost.id + "\", title: \"Bye, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 2:
                updateResponse = _a.sent();
                expect(updateResponse.data.updatePost).toEqual(null);
                expect(updateResponse.errors.length).toEqual(1);
                expect(updateResponse.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [2 /*return*/];
        }
    });
}); });
test('Test deletePost mutation when authorized', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, deleteResponse, responseAccess, deleteResponseAccess;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        deletePost(input: { id: \"" + response.data.createPost.id + "\" }) {\n            id\n        }\n    }", {})];
            case 2:
                deleteResponse = _a.sent();
                expect(deleteResponse.data.deletePost.id).toEqual(response.data.createPost.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_1_ACCESS.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 3:
                responseAccess = _a.sent();
                expect(responseAccess.data.createPost.id).toBeDefined();
                expect(responseAccess.data.createPost.title).toEqual('Hello, World!');
                expect(responseAccess.data.createPost.createdAt).toBeDefined();
                expect(responseAccess.data.createPost.updatedAt).toBeDefined();
                expect(responseAccess.data.createPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1_ACCESS.query("mutation {\n        deletePost(input: { id: \"" + responseAccess.data.createPost.id + "\" }) {\n            id\n        }\n    }", {})];
            case 4:
                deleteResponseAccess = _a.sent();
                expect(deleteResponseAccess.data.deletePost.id).toEqual(responseAccess.data.createPost.id);
                return [2 /*return*/];
        }
    });
}); });
test('Test deletePost mutation when not authorized', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, deleteResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        deletePost(input: { id: \"" + response.data.createPost.id + "\" }) {\n            id\n        }\n    }", {})];
            case 2:
                deleteResponse = _a.sent();
                expect(deleteResponse.data.deletePost).toEqual(null);
                expect(deleteResponse.errors.length).toEqual(1);
                expect(deleteResponse.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [2 /*return*/];
        }
    });
}); });
test('Test listPosts query when authorized', function () { return __awaiter(void 0, void 0, void 0, function () {
    var firstPost, secondPost, listResponse, listResponseAccess;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createPost(input: { title: \"testing list\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})];
            case 1:
                firstPost = _a.sent();
                expect(firstPost.data.createPost.id).toBeDefined();
                expect(firstPost.data.createPost.title).toEqual('testing list');
                expect(firstPost.data.createPost.createdAt).toBeDefined();
                expect(firstPost.data.createPost.updatedAt).toBeDefined();
                expect(firstPost.data.createPost.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        createPost(input: { title: \"testing list\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            owner\n        }\n    }", {})
                    // There are two posts but only 1 created by me.
                ];
            case 2:
                secondPost = _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        listPosts(filter: { title: { eq: \"testing list\" } }, limit: 25) {\n            items {\n                id\n            }\n        }\n    }", {})];
            case 3:
                listResponse = _a.sent();
                console.log(JSON.stringify(listResponse, null, 4));
                expect(listResponse.data.listPosts.items.length).toEqual(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1_ACCESS.query("query {\n        listPosts(filter: { title: { eq: \"testing list\" } }, limit: 25) {\n            items {\n                id\n            }\n        }\n    }", {})];
            case 4:
                listResponseAccess = _a.sent();
                console.log(JSON.stringify(listResponseAccess, null, 4));
                expect(listResponseAccess.data.listPosts.items.length).toEqual(1);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Static Group Auth
 */
test("Test createSalary w/ Admin group protection authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSalary(input: { wage: 10 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(10);
                return [2 /*return*/];
        }
    });
}); });
test("Test update my own salary without admin permission", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createSalary(input: { wage: 10 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.wage).toEqual(10);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateSalary(input: { id: \"" + req.data.createSalary.id + "\", wage: 14 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                console.log(JSON.stringify(req2, null, 4));
                expect(req2.data.updateSalary.wage).toEqual(14);
                return [2 /*return*/];
        }
    });
}); });
test("Test updating someone else's salary as an admin", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createSalary(input: { wage: 11 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(11);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        updateSalary(input: { id: \"" + req.data.createSalary.id + "\", wage: 12 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                console.log(JSON.stringify(req2, null, 4));
                expect(req2.data.updateSalary.id).toEqual(req.data.createSalary.id);
                expect(req2.data.updateSalary.wage).toEqual(12);
                return [2 /*return*/];
        }
    });
}); });
test("Test updating someone else's salary when I am not admin.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSalary(input: { wage: 13 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(13);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateSalary(input: { id: \"" + req.data.createSalary.id + "\", wage: 14 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.updateSalary).toEqual(null);
                expect(req2.errors.length).toEqual(1);
                expect(req2.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [2 /*return*/];
        }
    });
}); });
test("Test deleteSalary w/ Admin group protection authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSalary(input: { wage: 15 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(15);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        deleteSalary(input: { id: \"" + req.data.createSalary.id + "\" }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                console.log(JSON.stringify(req2, null, 4));
                expect(req2.data.deleteSalary.id).toEqual(req.data.createSalary.id);
                expect(req2.data.deleteSalary.wage).toEqual(15);
                return [2 /*return*/];
        }
    });
}); });
test("Test deleteSalary w/ Admin group protection not authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSalary(input: { wage: 16 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(16);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        deleteSalary(input: { id: \"" + req.data.createSalary.id + "\" }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.deleteSalary).toEqual(null);
                expect(req2.errors.length).toEqual(1);
                expect(req2.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [2 /*return*/];
        }
    });
}); });
test("Test and Admin can get a salary created by any user", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createSalary(input: { wage: 15 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(15);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        getSalary(id: \"" + req.data.createSalary.id + "\") {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.getSalary.id).toEqual(req.data.createSalary.id);
                expect(req2.data.getSalary.wage).toEqual(15);
                return [2 /*return*/];
        }
    });
}); });
test("Test owner can create and get a salary when not admin", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createSalary(input: { wage: 15 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(15);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        getSalary(id: \"" + req.data.createSalary.id + "\") {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.getSalary.id).toEqual(req.data.createSalary.id);
                expect(req2.data.getSalary.wage).toEqual(15);
                return [2 /*return*/];
        }
    });
}); });
test("Test getSalary w/ Admin group protection not authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSalary(input: { wage: 16 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(16);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        getSalary(id: \"" + req.data.createSalary.id + "\") {\n            id\n            wage\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.getSalary).toEqual(null);
                expect(req2.errors.length).toEqual(1);
                expect(req2.errors[0].errorType).toEqual('Unauthorized');
                return [2 /*return*/];
        }
    });
}); });
test("Test listSalarys w/ Admin group protection authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSalary(input: { wage: 101 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(101);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        listSalarys(filter: { wage: { eq: 101 }}) {\n            items {\n                id\n                wage\n            }\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.listSalarys.items.length).toEqual(1);
                expect(req2.data.listSalarys.items[0].id).toEqual(req.data.createSalary.id);
                expect(req2.data.listSalarys.items[0].wage).toEqual(101);
                return [2 /*return*/];
        }
    });
}); });
test("Test listSalarys w/ Admin group protection not authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSalary(input: { wage: 102 }) {\n            id\n            wage\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSalary.id).toBeDefined();
                expect(req.data.createSalary.wage).toEqual(102);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        listSalarys(filter: { wage: { eq: 102 }}) {\n            items {\n                id\n                wage\n            }\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.listSalarys.items).toEqual([]);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Dynamic Group Auth
 */
test("Test createManyGroupProtected w/ dynamic group protection authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createManyGroupProtected(input: { value: 10, groups: [\"Admin\"] }) {\n            id\n            value\n            groups\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createManyGroupProtected.id).toBeDefined();
                expect(req.data.createManyGroupProtected.value).toEqual(10);
                expect(req.data.createManyGroupProtected.groups).toEqual(["Admin"]);
                return [2 /*return*/];
        }
    });
}); });
test("Test createManyGroupProtected w/ dynamic group protection when not authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createManyGroupProtected(input: { value: 10, groups: [\"Admin\"] }) {\n            id\n            value\n            groups\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createManyGroupProtected).toEqual(null);
                expect(req.errors.length).toEqual(1);
                expect(req.errors[0].errorType).toEqual('Unauthorized');
                return [2 /*return*/];
        }
    });
}); });
test("Test createSingleGroupProtected w/ dynamic group protection authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createSingleGroupProtected(input: { value: 10, group: \"Admin\" }) {\n            id\n            value\n            group\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSingleGroupProtected.id).toBeDefined();
                expect(req.data.createSingleGroupProtected.value).toEqual(10);
                expect(req.data.createSingleGroupProtected.group).toEqual("Admin");
                return [2 /*return*/];
        }
    });
}); });
test("Test createSingleGroupProtected w/ dynamic group protection when not authorized", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createSingleGroupProtected(input: { value: 10, group: \"Admin\" }) {\n            id\n            value\n            group\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createSingleGroupProtected).toEqual(null);
                expect(req.errors.length).toEqual(1);
                expect(req.errors[0].errorType).toEqual('Unauthorized');
                return [2 /*return*/];
        }
    });
}); });
test("Test listPWProtecteds when the user is authorized.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, uReq, req2, req3, dReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createPWProtected(input: { content: \"Foobie\", participants: \"" + PARTICIPANT_GROUP_NAME + "\", watchers: \"" + WATCHER_GROUP_NAME + "\" }) {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createPWProtected).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        updatePWProtected(input: { id: \"" + req.data.createPWProtected.id + "\", content: \"Foobie2\" }) {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 2:
                uReq = _a.sent();
                console.log(JSON.stringify(uReq, null, 4));
                expect(uReq.data.updatePWProtected).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        listPWProtecteds {\n            items {\n                id\n                content\n                participants\n                watchers\n            }\n            nextToken\n        }\n    }\n    ")];
            case 3:
                req2 = _a.sent();
                expect(req2.data.listPWProtecteds.items.length).toEqual(1);
                expect(req2.data.listPWProtecteds.items[0].id).toEqual(req.data.createPWProtected.id);
                expect(req2.data.listPWProtecteds.items[0].content).toEqual("Foobie2");
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        getPWProtected(id: \"" + req.data.createPWProtected.id + "\") {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 4:
                req3 = _a.sent();
                console.log(JSON.stringify(req3, null, 4));
                expect(req3.data.getPWProtected).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        deletePWProtected(input: { id: \"" + req.data.createPWProtected.id + "\" }) {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 5:
                dReq = _a.sent();
                console.log(JSON.stringify(dReq, null, 4));
                expect(dReq.data.deletePWProtected).toBeTruthy();
                return [2 /*return*/];
        }
    });
}); });
test("Test listPWProtecteds when groups is null in dynamodb.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2, req3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createPWProtected(input: { content: \"Foobie\" }) {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createPWProtected).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        listPWProtecteds {\n            items {\n                id\n                content\n                participants\n                watchers\n            }\n            nextToken\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                expect(req2.data.listPWProtecteds.items.length).toEqual(0);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        getPWProtected(id: \"" + req.data.createPWProtected.id + "\") {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 3:
                req3 = _a.sent();
                console.log(JSON.stringify(req3, null, 4));
                expect(req3.data.getPWProtected).toEqual(null);
                expect(req3.errors.length).toEqual(1);
                expect(req3.errors[0].errorType).toEqual('Unauthorized');
                return [2 /*return*/];
        }
    });
}); });
test("Test Protecteds when the user is not authorized.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2, uReq, req3, dReq, getReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createPWProtected(input: { content: \"Barbie\", participants: \"" + PARTICIPANT_GROUP_NAME + "\", watchers: \"" + WATCHER_GROUP_NAME + "\" }) {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createPWProtected).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        listPWProtecteds {\n            items {\n                id\n                content\n                participants\n                watchers\n            }\n            nextToken\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                console.log(JSON.stringify(req2, null, 4));
                expect(req2.data.listPWProtecteds.items.length).toEqual(0);
                expect(req2.data.listPWProtecteds.nextToken).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updatePWProtected(input: { id: \"" + req.data.createPWProtected.id + "\", content: \"Foobie2\" }) {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 3:
                uReq = _a.sent();
                console.log(JSON.stringify(uReq, null, 4));
                expect(uReq.data.updatePWProtected).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        getPWProtected(id: \"" + req.data.createPWProtected.id + "\") {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 4:
                req3 = _a.sent();
                console.log(JSON.stringify(req3, null, 4));
                expect(req3.data.getPWProtected).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        deletePWProtected(input: { id: \"" + req.data.createPWProtected.id + "\" }) {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 5:
                dReq = _a.sent();
                console.log(JSON.stringify(dReq, null, 4));
                expect(dReq.data.deletePWProtected).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        getPWProtected(id: \"" + req.data.createPWProtected.id + "\") {\n            id\n            content\n            participants\n            watchers\n        }\n    }\n    ")];
            case 6:
                getReq = _a.sent();
                console.log(JSON.stringify(getReq, null, 4));
                expect(getReq.data.getPWProtected).toBeTruthy();
                return [2 /*return*/];
        }
    });
}); });
test("Test creating, updating, and deleting an admin note as an admin", function () { return __awaiter(void 0, void 0, void 0, function () {
    var req, req2, req3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAdminNote(input: { content: \"Hello\" }) {\n            id\n            content\n        }\n    }\n    ")];
            case 1:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.data.createAdminNote.id).toBeDefined();
                expect(req.data.createAdminNote.content).toEqual("Hello");
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        updateAdminNote(input: { id: \"" + req.data.createAdminNote.id + "\", content: \"Hello 2\" }) {\n            id\n            content\n        }\n    }\n    ")];
            case 2:
                req2 = _a.sent();
                console.log(JSON.stringify(req2, null, 4));
                expect(req2.data.updateAdminNote.id).toEqual(req.data.createAdminNote.id);
                expect(req2.data.updateAdminNote.content).toEqual("Hello 2");
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        deleteAdminNote(input: { id: \"" + req.data.createAdminNote.id + "\" }) {\n            id\n            content\n        }\n    }\n    ")];
            case 3:
                req3 = _a.sent();
                console.log(JSON.stringify(req3, null, 4));
                expect(req3.data.deleteAdminNote.id).toEqual(req.data.createAdminNote.id);
                expect(req3.data.deleteAdminNote.content).toEqual("Hello 2");
                return [2 /*return*/];
        }
    });
}); });
test("Test creating, updating, and deleting an admin note as a non admin", function () { return __awaiter(void 0, void 0, void 0, function () {
    var adminReq, req, req2, req3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAdminNote(input: { content: \"Hello\" }) {\n            id\n            content\n        }\n    }\n    ")];
            case 1:
                adminReq = _a.sent();
                console.log(JSON.stringify(adminReq, null, 4));
                expect(adminReq.data.createAdminNote.id).toBeDefined();
                expect(adminReq.data.createAdminNote.content).toEqual("Hello");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAdminNote(input: { content: \"Hello\" }) {\n            id\n            content\n        }\n    }\n    ")];
            case 2:
                req = _a.sent();
                console.log(JSON.stringify(req, null, 4));
                expect(req.errors.length).toEqual(1);
                expect(req.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateAdminNote(input: { id: \"" + adminReq.data.createAdminNote.id + "\", content: \"Hello 2\" }) {\n            id\n            content\n        }\n    }\n    ")];
            case 3:
                req2 = _a.sent();
                console.log(JSON.stringify(req2, null, 4));
                expect(req2.errors.length).toEqual(1);
                expect(req2.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        deleteAdminNote(input: { id: \"" + adminReq.data.createAdminNote.id + "\" }) {\n            id\n            content\n        }\n    }\n    ")];
            case 4:
                req3 = _a.sent();
                console.log(JSON.stringify(req3, null, 4));
                expect(req3.errors.length).toEqual(1);
                expect(req3.errors[0].errorType).toEqual('Unauthorized');
                return [2 /*return*/];
        }
    });
}); });
/**
 * Get Query Tests
 */
test("Test getAllThree as admin.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, fetchOwnedBy2AsAdmin, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        getAllThree(id: \"" + ownedBy2.data.createAllThree.id + "\") {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                fetchOwnedBy2AsAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedBy2AsAdmin, null, 4));
                expect(fetchOwnedBy2AsAdmin.data.getAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test getAllThree as owner.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, fetchOwnedBy2AsOwner, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        getAllThree(id: \"" + ownedBy2.data.createAllThree.id + "\") {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                fetchOwnedBy2AsOwner = _a.sent();
                console.log(JSON.stringify(fetchOwnedBy2AsOwner, null, 4));
                expect(fetchOwnedBy2AsOwner.data.getAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test getAllThree as one of a set of editors.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, fetchOwnedBy2AsEditor, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            editors: [\"user2@test.com\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        getAllThree(id: \"" + ownedBy2.data.createAllThree.id + "\") {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                fetchOwnedBy2AsEditor = _a.sent();
                console.log(JSON.stringify(fetchOwnedBy2AsEditor, null, 4));
                expect(fetchOwnedBy2AsEditor.data.getAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test getAllThree as a member of a dynamic group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByAdmins, fetchOwnedByAdminsAsAdmin, fetchOwnedByAdminsAsNonAdmin, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            groups: [\"Devs\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByAdmins = _a.sent();
                console.log(JSON.stringify(ownedByAdmins, null, 4));
                expect(ownedByAdmins.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        getAllThree(id: \"" + ownedByAdmins.data.createAllThree.id + "\") {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                fetchOwnedByAdminsAsAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
                expect(fetchOwnedByAdminsAsAdmin.data.getAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    query {\n        getAllThree(id: \"" + ownedByAdmins.data.createAllThree.id + "\") {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 3:
                fetchOwnedByAdminsAsNonAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
                expect(fetchOwnedByAdminsAsNonAdmin.errors.length).toEqual(1);
                expect(fetchOwnedByAdminsAsNonAdmin.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByAdmins.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 4:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test getAllThree as a member of the alternative group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByAdmins, fetchOwnedByAdminsAsAdmin, fetchOwnedByAdminsAsNonAdmin, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByAdmins = _a.sent();
                console.log(JSON.stringify(ownedByAdmins, null, 4));
                expect(ownedByAdmins.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        getAllThree(id: \"" + ownedByAdmins.data.createAllThree.id + "\") {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                fetchOwnedByAdminsAsAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
                expect(fetchOwnedByAdminsAsAdmin.data.getAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    query {\n        getAllThree(id: \"" + ownedByAdmins.data.createAllThree.id + "\") {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 3:
                fetchOwnedByAdminsAsNonAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
                expect(fetchOwnedByAdminsAsNonAdmin.errors.length).toEqual(1);
                expect(fetchOwnedByAdminsAsNonAdmin.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByAdmins.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 4:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
/**
 * List Query Tests
 */
test("Test listAllThrees as admin.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, fetchOwnedBy2AsAdmin, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    query {\n        listAllThrees {\n            items {\n                id\n                owner\n                editors\n                groups\n                alternativeGroup\n            }\n        }\n    }\n    ")];
            case 2:
                fetchOwnedBy2AsAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedBy2AsAdmin, null, 4));
                expect(fetchOwnedBy2AsAdmin.data.listAllThrees.items).toHaveLength(1);
                expect(fetchOwnedBy2AsAdmin.data.listAllThrees.items[0].id).toEqual(ownedBy2.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test listAllThrees as owner.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, fetchOwnedBy2AsOwner, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        listAllThrees {\n            items {\n                id\n                owner\n                editors\n                groups\n                alternativeGroup\n            }\n        }\n    }\n    ")];
            case 2:
                fetchOwnedBy2AsOwner = _a.sent();
                console.log(JSON.stringify(fetchOwnedBy2AsOwner, null, 4));
                expect(fetchOwnedBy2AsOwner.data.listAllThrees.items).toHaveLength(1);
                expect(fetchOwnedBy2AsOwner.data.listAllThrees.items[0].id).toEqual(ownedBy2.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test listAllThrees as one of a set of editors.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, fetchOwnedBy2AsEditor, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            editors: [\"user2@test.com\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        listAllThrees {\n            items {\n                id\n                owner\n                editors\n                groups\n                alternativeGroup\n            }\n        }\n    }\n    ")];
            case 2:
                fetchOwnedBy2AsEditor = _a.sent();
                console.log(JSON.stringify(fetchOwnedBy2AsEditor, null, 4));
                expect(fetchOwnedBy2AsEditor.data.listAllThrees.items).toHaveLength(1);
                expect(fetchOwnedBy2AsEditor.data.listAllThrees.items[0].id).toEqual(ownedBy2.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test listAllThrees as a member of a dynamic group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByAdmins, fetchOwnedByAdminsAsAdmin, fetchOwnedByAdminsAsNonAdmin, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            groups: [\"Devs\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByAdmins = _a.sent();
                console.log(JSON.stringify(ownedByAdmins, null, 4));
                expect(ownedByAdmins.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        listAllThrees {\n            items {\n                id\n                owner\n                editors\n                groups\n                alternativeGroup\n            }\n        }\n    }\n    ")];
            case 2:
                fetchOwnedByAdminsAsAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
                expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items).toHaveLength(1);
                expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items[0].id).toEqual(ownedByAdmins.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    query {\n        listAllThrees {\n            items {\n                id\n                owner\n                editors\n                groups\n                alternativeGroup\n            }\n        }\n    }\n    ")];
            case 3:
                fetchOwnedByAdminsAsNonAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
                expect(fetchOwnedByAdminsAsNonAdmin.data.listAllThrees.items).toHaveLength(0);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByAdmins.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 4:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test getAllThree as a member of the alternative group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByAdmins, fetchOwnedByAdminsAsAdmin, fetchOwnedByAdminsAsNonAdmin, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByAdmins = _a.sent();
                console.log(JSON.stringify(ownedByAdmins, null, 4));
                expect(ownedByAdmins.data.createAllThree).toBeTruthy();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    query {\n        listAllThrees {\n            items {\n                id\n                owner\n                editors\n                groups\n                alternativeGroup\n            }\n        }\n    }\n    ")];
            case 2:
                fetchOwnedByAdminsAsAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
                expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items).toHaveLength(1);
                expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items[0].id).toEqual(ownedByAdmins.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    query {\n        listAllThrees {\n            items {\n                id\n                owner\n                editors\n                groups\n                alternativeGroup\n            }\n        }\n    }\n    ")];
            case 3:
                fetchOwnedByAdminsAsNonAdmin = _a.sent();
                console.log(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
                expect(fetchOwnedByAdminsAsNonAdmin.data.listAllThrees.items).toHaveLength(0);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByAdmins.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 4:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Create Mutation Tests
 */
test("Test createAllThree as admin.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, ownedBy2NoEditors, deleteReq, deleteReq2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                // set by input
                expect(ownedBy2.data.createAllThree.owner).toEqual("user2@test.com");
                // auto filled as logged in user.
                expect(ownedBy2.data.createAllThree.editors[0]).toEqual("user1@test.com");
                expect(ownedBy2.data.createAllThree.groups).toBeNull();
                expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\",\n            editors: []\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedBy2NoEditors = _a.sent();
                console.log(JSON.stringify(ownedBy2NoEditors, null, 4));
                expect(ownedBy2NoEditors.data.createAllThree).toBeTruthy();
                // set by input
                expect(ownedBy2NoEditors.data.createAllThree.owner).toEqual("user2@test.com");
                // set by input
                expect(ownedBy2NoEditors.data.createAllThree.editors).toHaveLength(0);
                expect(ownedBy2NoEditors.data.createAllThree.groups).toBeNull();
                expect(ownedBy2NoEditors.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2NoEditors.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 4:
                deleteReq2 = _a.sent();
                console.log(JSON.stringify(deleteReq2, null, 4));
                expect(deleteReq2.data.deleteAllThree.id).toEqual(ownedBy2NoEditors.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test createAllThree as owner.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, ownedBy1, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\",\n            editors: []\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                expect(ownedBy2.data.createAllThree.owner).toEqual("user2@test.com");
                expect(ownedBy2.data.createAllThree.editors).toHaveLength(0);
                expect(ownedBy2.data.createAllThree.groups).toBeNull();
                expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user1@test.com\",\n            editors: []\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedBy1 = _a.sent();
                console.log(JSON.stringify(ownedBy1, null, 4));
                expect(ownedBy1.errors.length).toEqual(1);
                expect(ownedBy1.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test createAllThree as one of a set of editors.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, ownedBy2WithDefaultOwner, ownedByEditorsUnauthed, deleteReq, deleteReq2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [\"user2@test.com\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                expect(ownedBy2.data.createAllThree.owner).toBeNull();
                expect(ownedBy2.data.createAllThree.editors[0]).toEqual("user2@test.com");
                expect(ownedBy2.data.createAllThree.groups).toBeNull();
                expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            editors: [\"user2@test.com\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedBy2WithDefaultOwner = _a.sent();
                console.log(JSON.stringify(ownedBy2WithDefaultOwner, null, 4));
                expect(ownedBy2WithDefaultOwner.data.createAllThree).toBeTruthy();
                expect(ownedBy2WithDefaultOwner.data.createAllThree.owner).toEqual("user2@test.com");
                expect(ownedBy2WithDefaultOwner.data.createAllThree.editors[0]).toEqual("user2@test.com");
                expect(ownedBy2WithDefaultOwner.data.createAllThree.groups).toBeNull();
                expect(ownedBy2WithDefaultOwner.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [\"user1@test.com\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 3:
                ownedByEditorsUnauthed = _a.sent();
                console.log(JSON.stringify(ownedByEditorsUnauthed, null, 4));
                expect(ownedByEditorsUnauthed.errors.length).toEqual(1);
                expect(ownedByEditorsUnauthed.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 4:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2WithDefaultOwner.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 5:
                deleteReq2 = _a.sent();
                console.log(JSON.stringify(deleteReq2, null, 4));
                expect(deleteReq2.data.deleteAllThree.id).toEqual(ownedBy2WithDefaultOwner.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test createAllThree as a member of a dynamic group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByDevs, ownedByAdminsUnauthed, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            groups: [\"Devs\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByDevs = _a.sent();
                console.log(JSON.stringify(ownedByDevs, null, 4));
                expect(ownedByDevs.data.createAllThree).toBeTruthy();
                expect(ownedByDevs.data.createAllThree.owner).toBeNull();
                expect(ownedByDevs.data.createAllThree.editors).toHaveLength(0);
                expect(ownedByDevs.data.createAllThree.groups[0]).toEqual("Devs");
                expect(ownedByDevs.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            groups: [\"Devs\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedByAdminsUnauthed = _a.sent();
                console.log(JSON.stringify(ownedByAdminsUnauthed, null, 4));
                expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
                expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByDevs.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByDevs.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test createAllThree as a member of the alternative group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByAdmins, ownedByAdminsUnauthed, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByAdmins = _a.sent();
                console.log(JSON.stringify(ownedByAdmins, null, 4));
                expect(ownedByAdmins.data.createAllThree).toBeTruthy();
                expect(ownedByAdmins.data.createAllThree.owner).toBeNull();
                expect(ownedByAdmins.data.createAllThree.editors).toHaveLength(0);
                expect(ownedByAdmins.data.createAllThree.alternativeGroup).toEqual("Devs");
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            alternativeGroup: \"Admin\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedByAdminsUnauthed = _a.sent();
                console.log(JSON.stringify(ownedByAdminsUnauthed, null, 4));
                expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
                expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByAdmins.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Update Mutation Tests
 */
test("Test updateAllThree and deleteAllThree as admin.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, ownedByTwoUpdate, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            editors: []\n            owner: \"user2@test.com\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                // set by input
                expect(ownedBy2.data.createAllThree.owner).toEqual("user2@test.com");
                // auto filled as logged in user.
                expect(ownedBy2.data.createAllThree.editors).toHaveLength(0);
                expect(ownedBy2.data.createAllThree.groups).toBeNull();
                expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        updateAllThree(input: {\n            id: \"" + ownedBy2.data.createAllThree.id + "\",\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedByTwoUpdate = _a.sent();
                console.log(JSON.stringify(ownedByTwoUpdate, null, 4));
                expect(ownedByTwoUpdate.data.updateAllThree).toBeTruthy();
                // set by input
                expect(ownedByTwoUpdate.data.updateAllThree.owner).toEqual("user2@test.com");
                // set by input
                expect(ownedByTwoUpdate.data.updateAllThree.editors).toHaveLength(0);
                expect(ownedByTwoUpdate.data.updateAllThree.groups).toBeNull();
                expect(ownedByTwoUpdate.data.updateAllThree.alternativeGroup).toEqual("Devs");
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test updateAllThree and deleteAllThree as owner.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, ownedBy2Update, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: \"user2@test.com\",\n            editors: []\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                expect(ownedBy2.data.createAllThree.owner).toEqual("user2@test.com");
                expect(ownedBy2.data.createAllThree.editors).toHaveLength(0);
                expect(ownedBy2.data.createAllThree.groups).toBeNull();
                expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateAllThree(input: {\n            id: \"" + ownedBy2.data.createAllThree.id + "\",\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedBy2Update = _a.sent();
                console.log(JSON.stringify(ownedBy2Update, null, 4));
                expect(ownedBy2Update.data.updateAllThree).toBeTruthy();
                // set by input
                expect(ownedBy2Update.data.updateAllThree.owner).toEqual("user2@test.com");
                // set by input
                expect(ownedBy2Update.data.updateAllThree.editors).toHaveLength(0);
                expect(ownedBy2Update.data.updateAllThree.groups).toBeNull();
                expect(ownedBy2Update.data.updateAllThree.alternativeGroup).toEqual("Devs");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test updateAllThree and deleteAllThree as one of a set of editors.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, ownedByUpdate, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [\"user2@test.com\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createAllThree).toBeTruthy();
                expect(ownedBy2.data.createAllThree.owner).toBeNull();
                expect(ownedBy2.data.createAllThree.editors[0]).toEqual("user2@test.com");
                expect(ownedBy2.data.createAllThree.groups).toBeNull();
                expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateAllThree(input: {\n            id: \"" + ownedBy2.data.createAllThree.id + "\",\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedByUpdate = _a.sent();
                console.log(JSON.stringify(ownedByUpdate, null, 4));
                expect(ownedByUpdate.data.updateAllThree).toBeTruthy();
                // set by input
                expect(ownedByUpdate.data.updateAllThree.owner).toBeNull();
                // set by input
                expect(ownedByUpdate.data.updateAllThree.editors[0]).toEqual("user2@test.com");
                expect(ownedByUpdate.data.updateAllThree.groups).toBeNull();
                expect(ownedByUpdate.data.updateAllThree.alternativeGroup).toEqual("Devs");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedBy2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 3:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test updateAllThree and deleteAllThree as a member of a dynamic group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByDevs, ownedByUpdate, ownedByAdminsUnauthed, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            groups: [\"Devs\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByDevs = _a.sent();
                console.log(JSON.stringify(ownedByDevs, null, 4));
                expect(ownedByDevs.data.createAllThree).toBeTruthy();
                expect(ownedByDevs.data.createAllThree.owner).toBeNull();
                expect(ownedByDevs.data.createAllThree.editors).toHaveLength(0);
                expect(ownedByDevs.data.createAllThree.groups[0]).toEqual("Devs");
                expect(ownedByDevs.data.createAllThree.alternativeGroup).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateAllThree(input: {\n            id: \"" + ownedByDevs.data.createAllThree.id + "\",\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedByUpdate = _a.sent();
                console.log(JSON.stringify(ownedByUpdate, null, 4));
                expect(ownedByUpdate.data.updateAllThree).toBeTruthy();
                // set by input
                expect(ownedByUpdate.data.updateAllThree.owner).toBeNull();
                // set by input
                expect(ownedByUpdate.data.updateAllThree.editors).toHaveLength(0);
                expect(ownedByUpdate.data.updateAllThree.groups[0]).toEqual("Devs");
                expect(ownedByUpdate.data.updateAllThree.alternativeGroup).toEqual("Devs");
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            groups: [\"Devs\"]\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 3:
                ownedByAdminsUnauthed = _a.sent();
                console.log(JSON.stringify(ownedByAdminsUnauthed, null, 4));
                expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
                expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('Unauthorized');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByDevs.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 4:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByDevs.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test updateAllThree and deleteAllThree as a member of the alternative group.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedByDevs, ownedByUpdate, ownedByAdminsUnauthed, ownedByDevs2, deleteReq2, deleteReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 1:
                ownedByDevs = _a.sent();
                console.log(JSON.stringify(ownedByDevs, null, 4));
                expect(ownedByDevs.data.createAllThree).toBeTruthy();
                expect(ownedByDevs.data.createAllThree.owner).toBeNull();
                expect(ownedByDevs.data.createAllThree.editors).toHaveLength(0);
                expect(ownedByDevs.data.createAllThree.alternativeGroup).toEqual("Devs");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateAllThree(input: {\n            id: \"" + ownedByDevs.data.createAllThree.id + "\",\n            alternativeGroup: \"Admin\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 2:
                ownedByUpdate = _a.sent();
                console.log(JSON.stringify(ownedByUpdate, null, 4));
                expect(ownedByUpdate.data.updateAllThree).toBeTruthy();
                // set by input
                expect(ownedByUpdate.data.updateAllThree.owner).toBeNull();
                // set by input
                expect(ownedByUpdate.data.updateAllThree.editors).toHaveLength(0);
                expect(ownedByUpdate.data.updateAllThree.groups).toBeNull();
                expect(ownedByUpdate.data.updateAllThree.alternativeGroup).toEqual("Admin");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n    mutation {\n        updateAllThree(input: {\n            id: \"" + ownedByDevs.data.createAllThree.id + "\",\n            alternativeGroup: \"Dev\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 3:
                ownedByAdminsUnauthed = _a.sent();
                console.log(JSON.stringify(ownedByAdminsUnauthed, null, 4));
                expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
                expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createAllThree(input: {\n            owner: null,\n            editors: [],\n            alternativeGroup: \"Devs\"\n        }) {\n            id\n            owner\n            editors\n            groups\n            alternativeGroup\n        }\n    }\n    ")];
            case 4:
                ownedByDevs2 = _a.sent();
                console.log(JSON.stringify(ownedByDevs2, null, 4));
                expect(ownedByDevs2.data.createAllThree).toBeTruthy();
                expect(ownedByDevs2.data.createAllThree.owner).toBeNull();
                expect(ownedByDevs2.data.createAllThree.editors).toHaveLength(0);
                expect(ownedByDevs2.data.createAllThree.alternativeGroup).toEqual("Devs");
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByDevs2.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 5:
                deleteReq2 = _a.sent();
                console.log(JSON.stringify(deleteReq2, null, 4));
                expect(deleteReq2.data.deleteAllThree.id).toEqual(ownedByDevs2.data.createAllThree.id);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n        mutation {\n            deleteAllThree(input: { id: \"" + ownedByDevs.data.createAllThree.id + "\" }) {\n                id\n            }\n        }\n    ")];
            case 6:
                deleteReq = _a.sent();
                console.log(JSON.stringify(deleteReq, null, 4));
                expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByDevs.data.createAllThree.id);
                return [2 /*return*/];
        }
    });
}); });
test("Test createTestIdentity as admin.", function () { return __awaiter(void 0, void 0, void 0, function () {
    var ownedBy2, update, getReq, listResponse, relevantPost, delReq;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("\n    mutation {\n        createTestIdentity(input: {\n            title: \"Test title\"\n        }) {\n            id\n            title\n            owner\n        }\n    }\n    ")];
            case 1:
                ownedBy2 = _a.sent();
                console.log(JSON.stringify(ownedBy2, null, 4));
                expect(ownedBy2.data.createTestIdentity).toBeTruthy();
                expect(ownedBy2.data.createTestIdentity.title).toEqual("Test title");
                expect(ownedBy2.data.createTestIdentity.owner.slice(0, 19)).toEqual("https://cognito-idp");
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    mutation {\n        updateTestIdentity(input: {\n            id: \"" + ownedBy2.data.createTestIdentity.id + "\",\n            title: \"Test title update\"\n        }) {\n            id\n            title\n            owner\n        }\n    }\n    ")];
            case 2:
                update = _a.sent();
                console.log(JSON.stringify(update, null, 4));
                expect(update.data.updateTestIdentity).toBeTruthy();
                expect(update.data.updateTestIdentity.title).toEqual("Test title update");
                expect(update.data.updateTestIdentity.owner.slice(0, 19)).toEqual("https://cognito-idp");
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    query {\n        getTestIdentity(id: \"" + ownedBy2.data.createTestIdentity.id + "\") {\n            id\n            title\n            owner\n        }\n    }\n    ")];
            case 3:
                getReq = _a.sent();
                console.log(JSON.stringify(getReq, null, 4));
                expect(getReq.data.getTestIdentity).toBeTruthy();
                expect(getReq.data.getTestIdentity.title).toEqual("Test title update");
                expect(getReq.data.getTestIdentity.owner.slice(0, 19)).toEqual("https://cognito-idp");
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("query {\n        listTestIdentitys(filter: { title: { eq: \"Test title update\" } }, limit: 100) {\n            items {\n                id\n                title\n                owner\n            }\n        }\n    }", {})];
            case 4:
                listResponse = _a.sent();
                relevantPost = listResponse.data.listTestIdentitys.items.find(function (p) { return p.id === getReq.data.getTestIdentity.id; });
                console.log(JSON.stringify(listResponse, null, 4));
                expect(relevantPost).toBeTruthy();
                expect(relevantPost.title).toEqual("Test title update");
                expect(relevantPost.owner.slice(0, 19)).toEqual("https://cognito-idp");
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("\n    mutation {\n        deleteTestIdentity(input: {\n            id: \"" + ownedBy2.data.createTestIdentity.id + "\"\n        }) {\n            id\n            title\n            owner\n        }\n    }\n    ")];
            case 5:
                delReq = _a.sent();
                console.log(JSON.stringify(delReq, null, 4));
                expect(delReq.data.deleteTestIdentity).toBeTruthy();
                expect(delReq.data.deleteTestIdentity.title).toEqual("Test title update");
                expect(delReq.data.deleteTestIdentity.owner.slice(0, 19)).toEqual("https://cognito-idp");
                return [2 /*return*/];
        }
    });
}); });
/**
 * Test 'operations' argument
 */
test('Test get and list with \'read\' operation set', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, response2, response3, response4, response5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createOwnerReadProtected(input: { content: \"Hello, World!\", owner: \"" + USERNAME1 + "\" }) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                console.log(response);
                expect(response.data.createOwnerReadProtected.id).toBeDefined();
                expect(response.data.createOwnerReadProtected.content).toEqual('Hello, World!');
                expect(response.data.createOwnerReadProtected.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        getOwnerReadProtected(id: \"" + response.data.createOwnerReadProtected.id + "\") {\n            id content owner\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.getOwnerReadProtected).toBeNull();
                expect(response2.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        getOwnerReadProtected(id: \"" + response.data.createOwnerReadProtected.id + "\") {\n            id content owner\n        }\n    }", {})];
            case 3:
                response3 = _a.sent();
                console.log(response3);
                expect(response3.data.getOwnerReadProtected.id).toBeDefined();
                expect(response3.data.getOwnerReadProtected.content).toEqual('Hello, World!');
                expect(response3.data.getOwnerReadProtected.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        listOwnerReadProtecteds {\n            items {\n                id content owner\n            }\n        }\n    }", {})];
            case 4:
                response4 = _a.sent();
                console.log(response4);
                expect(response4.data.listOwnerReadProtecteds.items.length).toBeGreaterThanOrEqual(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        listOwnerReadProtecteds {\n            items {\n                id content owner\n            }\n        }\n    }", {})];
            case 5:
                response5 = _a.sent();
                console.log(response5);
                expect(response5.data.listOwnerReadProtecteds.items).toHaveLength(0);
                return [2 /*return*/];
        }
    });
}); });
test('Test createOwnerCreateUpdateDeleteProtected with \'create\' operation set', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, response2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createOwnerCreateUpdateDeleteProtected(input: { content: \"Hello, World!\", owner: \"" + USERNAME1 + "\" }) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                console.log(response);
                expect(response.data.createOwnerCreateUpdateDeleteProtected.id).toBeDefined();
                expect(response.data.createOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
                expect(response.data.createOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createOwnerCreateUpdateDeleteProtected(input: { content: \"Hello, World!\", owner: \"" + USERNAME2 + "\" }) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.createOwnerCreateUpdateDeleteProtected).toBeNull();
                expect(response2.errors).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
test('Test updateOwnerCreateUpdateDeleteProtected with \'update\' operation set', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, response2, response3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createOwnerCreateUpdateDeleteProtected(input: { content: \"Hello, World!\", owner: \"" + USERNAME1 + "\" }) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                console.log(response);
                expect(response.data.createOwnerCreateUpdateDeleteProtected.id).toBeDefined();
                expect(response.data.createOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
                expect(response.data.createOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        updateOwnerCreateUpdateDeleteProtected(\n            input: {\n                id: \"" + response.data.createOwnerCreateUpdateDeleteProtected.id + "\",\n                content: \"Bye, World!\"\n            }\n        ) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.updateOwnerCreateUpdateDeleteProtected).toBeNull();
                expect(response2.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        updateOwnerCreateUpdateDeleteProtected(\n            input: {\n                id: \"" + response.data.createOwnerCreateUpdateDeleteProtected.id + "\",\n                content: \"Bye, World!\"\n            }\n        ) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 3:
                response3 = _a.sent();
                console.log(response3);
                expect(response3.data.updateOwnerCreateUpdateDeleteProtected.id).toBeDefined();
                expect(response3.data.updateOwnerCreateUpdateDeleteProtected.content).toEqual('Bye, World!');
                expect(response3.data.updateOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
                return [2 /*return*/];
        }
    });
}); });
test('Test deleteOwnerCreateUpdateDeleteProtected with \'update\' operation set', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, response2, response3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createOwnerCreateUpdateDeleteProtected(input: { content: \"Hello, World!\", owner: \"" + USERNAME1 + "\" }) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                console.log(response);
                expect(response.data.createOwnerCreateUpdateDeleteProtected.id).toBeDefined();
                expect(response.data.createOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
                expect(response.data.createOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        deleteOwnerCreateUpdateDeleteProtected(\n            input: {\n                id: \"" + response.data.createOwnerCreateUpdateDeleteProtected.id + "\"\n            }\n        ) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 2:
                response2 = _a.sent();
                console.log(response2);
                expect(response2.data.deleteOwnerCreateUpdateDeleteProtected).toBeNull();
                expect(response2.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        deleteOwnerCreateUpdateDeleteProtected(\n            input: {\n                id: \"" + response.data.createOwnerCreateUpdateDeleteProtected.id + "\"\n            }\n        ) {\n            id\n            content\n            owner\n        }\n    }", {})];
            case 3:
                response3 = _a.sent();
                console.log(response3);
                expect(response3.data.deleteOwnerCreateUpdateDeleteProtected.id).toBeDefined();
                expect(response3.data.deleteOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
                expect(response3.data.deleteOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=ModelAuthTransformer.e2e.test.js.map