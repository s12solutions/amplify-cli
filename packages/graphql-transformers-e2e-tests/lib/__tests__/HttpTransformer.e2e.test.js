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
var graphql_http_transformer_1 = require("../../../graphql-http-transformer");
var CloudFormationClient_1 = require("../CloudFormationClient");
var GraphQLClient_1 = require("../GraphQLClient");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var deployNestedStacks_1 = require("../deployNestedStacks");
var S3Client_1 = require("../S3Client");
var S3 = require("aws-sdk/clients/s3");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "HttpTransformerTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-http-transformer-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/http_transformer_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var GRAPHQL_CLIENT = undefined;
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, e_1, transformer, out, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Comment @model {\n        id: ID!\n        title: String\n        simpleGet: CompObj @http(method: GET, url: \"https://jsonplaceholder.typicode.com/posts/1\")\n        simpleGet2: CompObj @http(url: \"https://jsonplaceholder.typicode.com/posts/2\")\n        complexPost(\n            id: Int,\n            title: String!,\n            body: String,\n            userId: Int\n        ): CompObj @http(method: POST, url: \"https://jsonplaceholder.typicode.com/posts\")\n        complexPut(\n            id: Int!,\n            title: String,\n            body: String,\n            userId: Int\n        ): CompObj @http(method: PUT, url: \"https://jsonplaceholder.typicode.com/posts/:id\")\n        deleter: String @http(method: DELETE, url: \"https://jsonplaceholder.typicode.com/posts/3\")\n        complexGet(\n            data: String!,\n            userId: Int!,\n            _limit: Int\n        ): [CompObj] @http(url: \"https://jsonplaceholder.typicode.com/:data\")\n        complexGet2(\n            dataType: String!,\n            postId: Int!,\n            secondType: String!,\n            id: Int\n        ): [PostComment] @http(url: \"https://jsonplaceholder.typicode.com/:dataType/:postId/:secondType\")\n    }\n    type CompObj {\n        userId: Int\n        id: Int\n        title: String\n        body: String\n    }\n    type PostComment {\n        postId: Int\n        id: Int\n        name: String\n        email: String\n        body: String\n    }\n    ";
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
                        }),
                        new graphql_http_transformer_1.default()
                    ]
                });
                out = transformer.transform(validSchema);
                _a.label = 5;
            case 5:
                _a.trys.push([5, 8, , 9]);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1' }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)
                    // Arbitrary wait to make sure everything is ready.
                ];
            case 6:
                finishedStack = _a.sent();
                // Arbitrary wait to make sure everything is ready.
                return [4 /*yield*/, cf.wait(5, function () { return Promise.resolve(); })];
            case 7:
                // Arbitrary wait to make sure everything is ready.
                _a.sent();
                console.log('Successfully created stack ' + STACK_NAME);
                console.log(finishedStack);
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                return [3 /*break*/, 9];
            case 8:
                e_2 = _a.sent();
                console.error(e_2);
                expect(true).toEqual(false);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
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
test('Test HTTP GET request', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, post1Title, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                simpleGet {\n                    id\n                    title\n                    body\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                post1Title = 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit';
                expect(response.data.createComment.id).toBeDefined();
                expect(response.data.createComment.title).toEqual('Hello, World!');
                expect(response.data.createComment.simpleGet).toBeDefined();
                expect(response.data.createComment.simpleGet.title).toEqual(post1Title);
                return [3 /*break*/, 3];
            case 2:
                e_5 = _a.sent();
                console.error(e_5);
                // fail
                expect(e_5).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test HTTP GET request 2', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, post2Title, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                simpleGet2 {\n                    id\n                    title\n                    body\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                post2Title = 'qui est esse';
                expect(response.data.createComment.id).toBeDefined();
                expect(response.data.createComment.title).toEqual('Hello, World!');
                expect(response.data.createComment.simpleGet2).toBeDefined();
                expect(response.data.createComment.simpleGet2.title).toEqual(post2Title);
                return [3 /*break*/, 3];
            case 2:
                e_6 = _a.sent();
                console.error(e_6);
                // fail
                expect(e_6).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test HTTP POST request', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                complexPost(\n                    body: {\n                        title: \"foo\",\n                        body: \"bar\",\n                        userId: 2\n                    }\n                ) {\n                    id\n                    title\n                    body\n                    userId\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createComment.id).toBeDefined();
                expect(response.data.createComment.title).toEqual('Hello, World!');
                expect(response.data.createComment.complexPost).toBeDefined();
                expect(response.data.createComment.complexPost.title).toEqual('foo');
                expect(response.data.createComment.complexPost.userId).toEqual(2);
                return [3 /*break*/, 3];
            case 2:
                e_7 = _a.sent();
                console.error(e_7);
                // fail
                expect(e_7).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test HTTP PUT request', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                complexPut(\n                    params: {\n                        id: \"2\"\n                    },\n                    body: {\n                        title: \"foo\",\n                        body: \"bar\",\n                        userId: 2\n                    }\n                ) {\n                    id\n                    title\n                    body\n                    userId\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createComment.id).toBeDefined();
                expect(response.data.createComment.title).toEqual('Hello, World!');
                expect(response.data.createComment.complexPut).toBeDefined();
                expect(response.data.createComment.complexPut.title).toEqual('foo');
                expect(response.data.createComment.complexPut.userId).toEqual(2);
                return [3 /*break*/, 3];
            case 2:
                e_8 = _a.sent();
                console.error(e_8);
                // fail
                expect(e_8).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test HTTP DELETE request', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                deleter\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createComment.id).toBeDefined();
                expect(response.data.createComment.title).toEqual('Hello, World!');
                expect(response.data.createComment.deleter).toBeDefined();
                return [3 /*break*/, 3];
            case 2:
                e_9 = _a.sent();
                console.error(e_9);
                // fail
                expect(e_9).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test GET with URL param and query values', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                complexGet(\n                    params: {\n                        data: \"posts\"\n                    },\n                    query: {\n                        userId: 1,\n                        _limit: 7\n                    }\n                ) {\n                    id\n                    title\n                    body\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createComment.id).toBeDefined();
                expect(response.data.createComment.title).toEqual('Hello, World!');
                expect(response.data.createComment.complexGet).toBeDefined();
                expect(response.data.createComment.complexGet.length).toEqual(7);
                return [3 /*break*/, 3];
            case 2:
                e_10 = _a.sent();
                console.error(e_10);
                // fail
                expect(e_10).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test GET with multiple URL params and query values', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                complexGet2(\n                    params: {\n                        dataType: \"posts\",\n                        postId: \"1\",\n                        secondType: \"comments\"\n                    },\n                    query: {\n                        id: 2\n                    }\n                ) {\n                    id\n                    name\n                    email\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createComment.id).toBeDefined();
                expect(response.data.createComment.title).toEqual('Hello, World!');
                expect(response.data.createComment.complexGet2).toBeDefined();
                expect(response.data.createComment.complexGet2[0].email).toEqual('Jayne_Kuhic@sydney.com');
                return [3 /*break*/, 3];
            case 2:
                e_11 = _a.sent();
                console.error(e_11);
                // fail
                expect(e_11).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test that GET errors when missing a required Query input object', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                complexGet(\n                    params: {\n                        data: \"posts\",\n                    }\n                ) {\n                    id\n                    title\n                    body\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data).toBeNull();
                return [3 /*break*/, 3];
            case 2:
                e_12 = _a.sent();
                console.error(e_12);
                // fail
                expect(e_12).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
test('Test that POST errors when missing a non-null arg in query/body', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, e_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                complexPost(\n                    body: {\n                        id: 1,\n                        body: \"bar\"\n                    }\n                ) {\n                    id\n                    title\n                    body\n                }\n            }\n        }", {})];
            case 1:
                response = _a.sent();
                expect(response.data.createComment.complexPost).toBeNull();
                return [3 /*break*/, 3];
            case 2:
                e_13 = _a.sent();
                console.error(e_13);
                // fail
                expect(e_13).toBeUndefined();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=HttpTransformer.e2e.test.js.map