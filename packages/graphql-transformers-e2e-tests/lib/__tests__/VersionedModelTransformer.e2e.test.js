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
var graphql_versioned_transformer_1 = require("graphql-versioned-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var CloudFormationClient_1 = require("../CloudFormationClient");
var GraphQLClient_1 = require("../GraphQLClient");
var moment = require("moment");
var S3 = require("aws-sdk/clients/s3");
var S3Client_1 = require("../S3Client");
var deployNestedStacks_1 = require("../deployNestedStacks");
var emptyBucket_1 = require("../emptyBucket");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "VersionedTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "versioned-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/model_transform_versioned_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var GRAPHQL_CLIENT = undefined;
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, e_1, out, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Post @model @versioned {\n        id: ID!\n        title: String!\n        version: Int!\n        createdAt: String\n        updatedAt: String\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_versioned_transformer_1.default(),
                        new graphql_auth_transformer_1.default({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: "API_KEY"
                                },
                                additionalAuthenticationProviders: []
                            }
                        }),
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
            case 4:
                _a.trys.push([4, 6, , 7]);
                out = transformer.transform(validSchema);
                console.log('Creating Stack ' + STACK_NAME);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1' }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)];
            case 5:
                finishedStack = _a.sent();
                expect(finishedStack).toBeDefined();
                // Arbitrary wait to make sure everything is ready.
                //await cf.wait(10, () => Promise.resolve())
                console.log('Successfully created stack ' + STACK_NAME);
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                return [3 /*break*/, 7];
            case 6:
                e_2 = _a.sent();
                console.error(e_2);
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
                    console.error(e_3);
                    expect(true).toEqual(false);
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
/**
 * Test queries below
 */
test('Test createPost mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { title: \"Hello, World!\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            version\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createPost.id).toBeDefined();
                expect(response.data.createPost.title).toEqual('Hello, World!');
                expect(response.data.createPost.createdAt).toBeDefined();
                expect(response.data.createPost.updatedAt).toBeDefined();
                expect(response.data.createPost.version).toEqual(1);
                return [2 /*return*/];
        }
    });
}); });
test('Test updatePost mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, updateResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { title: \"Test Update\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            version\n        }\n    }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Update');
                expect(createResponse.data.createPost.version).toEqual(1);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        updatePost(input: {\n            id: \"" + createResponse.data.createPost.id + "\",\n            title: \"Bye, World!\",\n            expectedVersion: " + createResponse.data.createPost.version + "\n        }) {\n            id\n            title\n            version\n        }\n    }", {})];
            case 2:
                updateResponse = _a.sent();
                expect(updateResponse.data.updatePost.title).toEqual('Bye, World!');
                expect(updateResponse.data.updatePost.version).toEqual(2);
                return [2 /*return*/];
        }
    });
}); });
test('Test failed updatePost mutation with wrong version', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, updateResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { title: \"Test Update\" }) {\n            id\n            title\n            createdAt\n            updatedAt\n            version\n        }\n    }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Update');
                expect(createResponse.data.createPost.version).toEqual(1);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        updatePost(input: {\n            id: \"" + createResponse.data.createPost.id + "\",\n            title: \"Bye, World!\",\n            expectedVersion: 3\n        }) {\n            id\n            title\n            version\n        }\n    }", {})];
            case 2:
                updateResponse = _a.sent();
                expect(updateResponse.errors.length).toEqual(1);
                expect(updateResponse.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [2 /*return*/];
        }
    });
}); });
test('Test deletePost mutation', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, deleteResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { title: \"Test Delete\" }) {\n            id\n            title\n            version\n            createdAt\n            updatedAt\n        }\n    }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Delete');
                expect(createResponse.data.createPost.version).toBeDefined();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        deletePost(input: { id: \"" + createResponse.data.createPost.id + "\", expectedVersion: " + createResponse.data.createPost.version + " }) {\n            id\n            title\n            version\n        }\n    }", {})];
            case 2:
                deleteResponse = _a.sent();
                expect(deleteResponse.data.deletePost.title).toEqual('Test Delete');
                expect(deleteResponse.data.deletePost.version).toEqual(createResponse.data.createPost.version);
                return [2 /*return*/];
        }
    });
}); });
test('Test deletePost mutation with wrong version', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, deleteResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { title: \"Test Delete\" }) {\n            id\n            title\n            version\n            createdAt\n            updatedAt\n        }\n    }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Delete');
                expect(createResponse.data.createPost.version).toBeDefined();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        deletePost(input: { id: \"" + createResponse.data.createPost.id + "\", expectedVersion: 3 }) {\n            id\n            title\n            version\n        }\n    }", {})];
            case 2:
                deleteResponse = _a.sent();
                expect(deleteResponse.errors.length).toEqual(1);
                expect(deleteResponse.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=VersionedModelTransformer.e2e.test.js.map