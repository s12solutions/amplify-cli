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
var CloudFormationClient_1 = require("../CloudFormationClient");
var GraphQLClient_1 = require("../GraphQLClient");
var deployNestedStacks_1 = require("../deployNestedStacks");
var S3Client_1 = require("../S3Client");
var S3 = require("aws-sdk/clients/s3");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "DynamoDBModelTransformerTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-model-transformer-test-bucket-" + BUILD_TIMESTAMP;
var GRAPHQL_CLIENT = undefined;
var TMP_ROOT = '/tmp/model_transform_tests/';
var ROOT_KEY = 'deployments';
var GRAPHQL_ENDPOINT = undefined;
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, out, e_1, finishedStack, getApiEndpoint, getApiKey, apiKey, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: AWSDateTime\n        updatedAt: AWSDateTime\n        metadata: PostMetadata\n        entityMetadata: EntityMetadata\n        appearsIn: [Episode!]\n        episode: Episode\n    }\n    type Author @model {\n        id: ID!\n        name: String!\n        postMetadata: PostMetadata\n        entityMetadata: EntityMetadata\n    }\n    type EntityMetadata {\n        isActive: Boolean\n    }\n    type PostMetadata {\n        tags: Tag\n    }\n    type Tag {\n        published: Boolean\n        metadata: PostMetadata\n    }\n    enum Episode {\n        NEWHOPE\n        EMPIRE\n        JEDI\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_auth_transformer_1.default({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: "API_KEY"
                                },
                                additionalAuthenticationProviders: []
                            }
                        })
                    ]
                });
                out = transformer.transform(validSchema);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, awsS3Client.createBucket({
                        Bucket: BUCKET_NAME,
                    }).promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.error("Failed to create S3 bucket: " + e_1);
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                console.log('Creating Stack ' + STACK_NAME);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1', DynamoDBEnablePointInTimeRecovery: 'true' }, TMP_ROOT, BUCKET_NAME, ROOT_KEY, BUILD_TIMESTAMP)];
            case 5:
                finishedStack = _a.sent();
                expect(finishedStack).toBeDefined();
                console.log(JSON.stringify(finishedStack, null, 4));
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                GRAPHQL_ENDPOINT = getApiEndpoint(finishedStack.Outputs);
                console.log("Using graphql url: " + GRAPHQL_ENDPOINT);
                apiKey = getApiKey(finishedStack.Outputs);
                console.log("API KEY: " + apiKey);
                expect(apiKey).toBeTruthy();
                expect(GRAPHQL_ENDPOINT).toBeTruthy();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { 'x-api-key': apiKey });
                return [3 /*break*/, 7];
            case 6:
                e_2 = _a.sent();
                console.log(e_2);
                expect(true).toEqual(false);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_3, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                console.log('Deleting stack ' + STACK_NAME);
                return [4 /*yield*/, cf.deleteStack(STACK_NAME)];
            case 1:
                _a.sent();
                return [4 /*yield*/, cf.waitForStack(STACK_NAME)];
            case 2:
                _a.sent();
                console.log('Successfully deleted stack ' + STACK_NAME);
                return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                if (e_3.code === 'ValidationError' && e_3.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.log(e_3);
                }
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                e_4 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_4);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, rows, deletePromises_1, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                // delete all the records
                console.log('deleting posts');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("\n    query {\n      listPosts {\n        items {\n          id\n        }\n      }\n    }", {})];
            case 1:
                response = _a.sent();
                rows = response.data.listPosts.items || [];
                deletePromises_1 = [];
                rows.forEach(function (row) {
                    deletePromises_1.push(GRAPHQL_CLIENT.query("mutation delete{\n        deletePost(input: {id: \"" + row.id + "\"}) { id }\n      }"));
                });
                return [4 /*yield*/, Promise.all(deletePromises_1)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_5 = _a.sent();
                console.log(e_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Test queries below
 */
test('Test createAuthor mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation($input: CreateAuthorInput!) {\n            createAuthor(input: $input) {\n                id\n                name\n                entityMetadata {\n                    isActive\n                }\n            }\n        }", {
                        input: {
                            name: 'Jeff B',
                            entityMetadata: {
                                isActive: true
                            }
                        }
                    })];
            case 1:
                response = _a.sent();
                expect(response.data.createAuthor.id).toBeDefined();
                expect(response.data.createAuthor.name).toEqual('Jeff B');
                expect(response.data.createAuthor.entityMetadata).toBeDefined();
                expect(response.data.createAuthor.entityMetadata.isActive).toEqual(true);
                return [3 /*break*/, 3];
            case 2:
                e_6 = _a.sent();
                console.log(e_6);
                // fail
                expect(e_6).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test createPost mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                return [3 /*break*/, 3];
            case 2:
                e_7 = _a.sent();
                console.log(e_7);
                // fail
                expect(e_7).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test updatePost mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, updateResponse, e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Test Update\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                createResponse = _a.sent();
                console.log(JSON.stringify(createResponse, null, 4));
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Update');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            updatePost(input: { id: \"" + createResponse.data.createPost.id + "\", title: \"Bye, World!\" }) {\n                id\n                title\n            }\n        }", {})];
            case 2:
                updateResponse = _a.sent();
                console.log(JSON.stringify(updateResponse, null, 4));
                expect(updateResponse.data.updatePost.title).toEqual('Bye, World!');
                return [3 /*break*/, 4];
            case 3:
                e_8 = _a.sent();
                console.log(e_8);
                // fail
                expect(e_8).toBeUndefined();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
test('Test createPost and updatePost mutation with a client generated id.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var clientId, createResponse, updateResponse, getResponse, deleteResponse, getResponse2, e_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                clientId = 'a-client-side-generated-id';
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { id: \"" + clientId + "\" title: \"Test Update\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                createResponse = _a.sent();
                console.log(JSON.stringify(createResponse, null, 4));
                expect(createResponse.data.createPost.id).toEqual(clientId);
                expect(createResponse.data.createPost.title).toEqual('Test Update');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            updatePost(input: { id: \"" + clientId + "\", title: \"Bye, World!\" }) {\n                id\n                title\n            }\n        }", {})];
            case 2:
                updateResponse = _a.sent();
                console.log(JSON.stringify(updateResponse, null, 4));
                expect(updateResponse.data.updatePost.id).toEqual(clientId);
                expect(updateResponse.data.updatePost.title).toEqual('Bye, World!');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            getPost(id: \"" + clientId + "\") {\n                id\n                title\n            }\n        }", {})];
            case 3:
                getResponse = _a.sent();
                console.log(JSON.stringify(getResponse, null, 4));
                expect(getResponse.data.getPost.id).toEqual(clientId);
                expect(getResponse.data.getPost.title).toEqual('Bye, World!');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            deletePost(input: { id: \"" + clientId + "\" }) {\n                id\n                title\n            }\n        }", {})];
            case 4:
                deleteResponse = _a.sent();
                console.log(JSON.stringify(deleteResponse, null, 4));
                expect(deleteResponse.data.deletePost.id).toEqual(clientId);
                expect(deleteResponse.data.deletePost.title).toEqual('Bye, World!');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            getPost(id: \"" + clientId + "\") {\n                id\n                title\n            }\n        }", {})];
            case 5:
                getResponse2 = _a.sent();
                console.log(JSON.stringify(getResponse2, null, 4));
                expect(getResponse2.data.getPost).toBeNull();
                return [3 /*break*/, 7];
            case 6:
                e_9 = _a.sent();
                console.log(e_9);
                // fail
                expect(e_9).toBeUndefined();
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
test('Test deletePost mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, deleteResponse, getResponse, e_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Test Delete\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                createResponse = _a.sent();
                console.log(JSON.stringify(createResponse, null, 4));
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Delete');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            deletePost(input: { id: \"" + createResponse.data.createPost.id + "\" }) {\n                id\n                title\n            }\n        }", {})];
            case 2:
                deleteResponse = _a.sent();
                console.log(JSON.stringify(deleteResponse, null, 4));
                expect(deleteResponse.data.deletePost.title).toEqual('Test Delete');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            getPost(id: \"" + createResponse.data.createPost.id + "\") {\n                id\n                title\n            }\n        }", {})];
            case 3:
                getResponse = _a.sent();
                console.log(JSON.stringify(getResponse, null, 4));
                expect(getResponse.data.getPost).toBeNull();
                return [3 /*break*/, 5];
            case 4:
                e_10 = _a.sent();
                console.log(e_10);
                // fail
                expect(e_10).toBeUndefined();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
test('Test getPost query', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, getResponse, e_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Test Get\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeTruthy();
                expect(createResponse.data.createPost.title).toEqual('Test Get');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            getPost(id: \"" + createResponse.data.createPost.id + "\") {\n                id\n                title\n            }\n        }", {})];
            case 2:
                getResponse = _a.sent();
                expect(getResponse.data.getPost.title).toEqual('Test Get');
                return [3 /*break*/, 4];
            case 3:
                e_11 = _a.sent();
                console.log(e_11);
                // fail
                expect(e_11).toBeUndefined();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
test('Test listPosts query', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, listResponse, items, e_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Test List\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test List');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts {\n                items {\n                    id\n                    title\n                }\n            }\n        }", {})];
            case 2:
                listResponse = _a.sent();
                expect(listResponse.data.listPosts.items).toBeDefined();
                items = listResponse.data.listPosts.items;
                expect(items.length).toBeGreaterThan(0);
                return [3 /*break*/, 4];
            case 3:
                e_12 = _a.sent();
                console.log(e_12);
                // fail
                expect(e_12).toBeUndefined();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
test('Test listPosts query with filter', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, listWithFilterResponse, items, e_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Test List with filter\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test List with filter');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts(filter: {\n                title: {\n                    contains: \"List with filter\"\n                }\n            }) {\n                items {\n                    id\n                    title\n                }\n            }\n        }", {})];
            case 2:
                listWithFilterResponse = _a.sent();
                console.log(JSON.stringify(listWithFilterResponse, null, 4));
                expect(listWithFilterResponse.data.listPosts.items).toBeDefined();
                items = listWithFilterResponse.data.listPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].title).toEqual('Test List with filter');
                return [3 /*break*/, 4];
            case 3:
                e_13 = _a.sent();
                console.log(e_13);
                // fail
                expect(e_13).toBeUndefined();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
test('Test enum filters List', function () { return __awaiter(void 0, void 0, void 0, function () {
    var appearsInWithFilterResponseJedi, items, appearsInWithFilterResponseNonJedi, appearsInNonJediItems, appearsInContainingJedi, appearsInWithJediItems, appearsInNotContainingJedi, appearsInWithNonJediItems, jediEpisode, jediEpisodeItems, nonJediEpisode, nonJediEpisodeItems, e_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 11, , 12]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Appears in New Hope\", appearsIn: [NEWHOPE], episode: NEWHOPE }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Appears in Jedi\", appearsIn: [JEDI], episode: JEDI }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 2:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n              createPost(input: { title: \"Appears in Empire\", appearsIn: [EMPIRE], episode: EMPIRE }) {\n                  id\n                  title\n                  createdAt\n                  updatedAt\n              }\n          }", {})];
            case 3:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n              createPost(input: { title: \"Appears in Empire & JEDI\", appearsIn: [EMPIRE, JEDI] }) {\n                  id\n                  title\n                  createdAt\n                  updatedAt\n              }\n          }", {})];
            case 4:
                _a.sent();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts(filter: { appearsIn: {eq: [JEDI]}}) {\n                items {\n                    title\n                    id\n                }\n            }\n        }\n        ", {})];
            case 5:
                appearsInWithFilterResponseJedi = _a.sent();
                expect(appearsInWithFilterResponseJedi.data.listPosts.items).toBeDefined();
                items = appearsInWithFilterResponseJedi.data.listPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].title).toEqual('Appears in Jedi');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts(filter: { appearsIn: {ne: [JEDI]}}) {\n                items {\n                    title\n                    id\n                }\n            }\n        }\n        ", {})];
            case 6:
                appearsInWithFilterResponseNonJedi = _a.sent();
                expect(appearsInWithFilterResponseNonJedi.data.listPosts.items).toBeDefined();
                appearsInNonJediItems = appearsInWithFilterResponseNonJedi.data.listPosts.items;
                expect(appearsInNonJediItems.length).toEqual(3);
                appearsInNonJediItems.forEach(function (item) {
                    expect(['Appears in Empire & JEDI', 'Appears in New Hope', 'Appears in Empire'].includes(item.title))
                        .toBeTruthy();
                });
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts(filter: { appearsIn: {contains: JEDI }}) {\n                items {\n                    title\n                    id\n                }\n            }\n        }\n        ", {})];
            case 7:
                appearsInContainingJedi = _a.sent();
                expect(appearsInContainingJedi.data.listPosts.items).toBeDefined();
                appearsInWithJediItems = appearsInContainingJedi.data.listPosts.items;
                expect(appearsInWithJediItems.length).toEqual(2);
                appearsInWithJediItems.forEach(function (item) {
                    expect(['Appears in Empire & JEDI', 'Appears in Jedi'].includes(item.title))
                        .toBeTruthy();
                });
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts(filter: { appearsIn: {notContains: JEDI }}) {\n                items {\n                    title\n                    id\n                }\n            }\n        }\n        ", {})];
            case 8:
                appearsInNotContainingJedi = _a.sent();
                expect(appearsInNotContainingJedi.data.listPosts.items).toBeDefined();
                appearsInWithNonJediItems = appearsInNotContainingJedi.data.listPosts.items;
                expect(appearsInWithNonJediItems.length).toEqual(2);
                appearsInWithNonJediItems.forEach(function (item) {
                    expect(['Appears in New Hope', 'Appears in Empire'].includes(item.title))
                        .toBeTruthy();
                });
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts(filter: { episode: {eq: JEDI }}) {\n                items {\n                    title\n                    id\n                }\n            }\n        }\n        ", {})];
            case 9:
                jediEpisode = _a.sent();
                expect(jediEpisode.data.listPosts.items).toBeDefined();
                jediEpisodeItems = jediEpisode.data.listPosts.items;
                expect(jediEpisodeItems.length).toEqual(1);
                expect(jediEpisodeItems[0].title).toEqual('Appears in Jedi');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            listPosts(filter: { episode: {ne: JEDI }}) {\n                items {\n                    title\n                    id\n                }\n            }\n        }\n        ", {})];
            case 10:
                nonJediEpisode = _a.sent();
                expect(nonJediEpisode.data.listPosts.items).toBeDefined();
                nonJediEpisodeItems = nonJediEpisode.data.listPosts.items;
                expect(nonJediEpisodeItems.length).toEqual(3);
                nonJediEpisodeItems.forEach(function (item) {
                    expect(['Appears in New Hope', 'Appears in Empire', 'Appears in Empire & JEDI'].includes(item.title))
                        .toBeTruthy();
                });
                return [3 /*break*/, 12];
            case 11:
                e_14 = _a.sent();
                console.log(e_14);
                // fail
                expect(e_14).toBeUndefined();
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); });
test('Test createPost mutation with non-model types', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation CreatePost($input: CreatePostInput!) {\n            createPost(input: $input) {\n                id\n                title\n                createdAt\n                updatedAt\n                metadata {\n                    tags {\n                        published\n                        metadata {\n                            tags {\n                                published\n                            }\n                        }\n                    }\n                }\n                appearsIn\n            }\n        }", {
                        input: {
                            title: 'Check that metadata exists',
                            metadata: {
                                tags: {
                                    published: true,
                                    metadata: {
                                        tags: {
                                            published: false
                                        }
                                    }
                                }
                            },
                            appearsIn: ['NEWHOPE']
                        }
                    })];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Check that metadata exists');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.metadata).toBeDefined();
                expect(response.data.createPost.metadata.tags.published).toEqual(true);
                expect(response.data.createPost.metadata.tags.metadata.tags.published).toEqual(false);
                expect(response.data.createPost.appearsIn).toEqual(['NEWHOPE']);
                return [3 /*break*/, 3];
            case 2:
                e_15 = _a.sent();
                console.log(e_15);
                // fail
                expect(e_15).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test updatePost mutation with non-model types', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, updateResponse, e_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createPost(input: { title: \"Test Update\" }) {\n                id\n                title\n                createdAt\n                updatedAt\n            }\n        }", {})];
            case 1:
                createResponse = _a.sent();
                console.log(JSON.stringify(createResponse, null, 4));
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Update');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation UpdatePost($input: UpdatePostInput!) {\n            updatePost(input: $input) {\n                id\n                title\n                createdAt\n                updatedAt\n                metadata {\n                    tags {\n                        published\n                        metadata {\n                            tags {\n                                published\n                            }\n                        }\n                    }\n                }\n                appearsIn\n            }\n        }", {
                        input: {
                            id: createResponse.data.createPost.id,
                            title: 'Add some metadata',
                            metadata: {
                                tags: {
                                    published: true,
                                    metadata: {
                                        tags: {
                                            published: false
                                        }
                                    }
                                }
                            },
                            appearsIn: ['NEWHOPE', 'EMPIRE']
                        }
                    })];
            case 2:
                updateResponse = _a.sent();
                console.log(JSON.stringify(updateResponse, null, 4));
                expect(updateResponse.data.updatePost.title).toEqual('Add some metadata');
                expect(updateResponse.data.updatePost.metadata).toBeDefined();
                expect(updateResponse.data.updatePost.metadata.tags.published).toEqual(true);
                expect(updateResponse.data.updatePost.metadata.tags.metadata.tags.published).toEqual(false);
                expect(updateResponse.data.updatePost.appearsIn).toEqual(['NEWHOPE', 'EMPIRE']);
                return [3 /*break*/, 4];
            case 3:
                e_16 = _a.sent();
                console.log(e_16);
                // fail
                expect(e_16).toBeUndefined();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=DynamoDBModelTransformer.e2e.test.js.map