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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_elasticsearch_transformer_1 = require("graphql-elasticsearch-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var CloudFormationClient_1 = require("../CloudFormationClient");
var S3Client_1 = require("../S3Client");
var GraphQLClient_1 = require("../GraphQLClient");
var deployNestedStacks_1 = require("../deployNestedStacks");
var moment = require("moment");
var S3 = require("aws-sdk/clients/s3");
var emptyBucket_1 = require("../emptyBucket");
jest.setTimeout(60000 * 60);
var s3 = new S3Client_1.S3Client('us-west-2');
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "TestSearchableModelTransformer-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "testsearchablemodeltransformer-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/model_searchable_transform_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
var fragments = [
    "fragment FullPost on Post { id author title ups downs percentageUp isPublished createdAt }"
];
var createPosts = function () { return __awaiter(void 0, void 0, void 0, function () {
    var logContent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logContent = 'createPost response: ';
                return [4 /*yield*/, runQuery(getCreatePostsQuery("snvishna", "test", 157, 10, 97.4, true), logContent)];
            case 1:
                _a.sent();
                return [4 /*yield*/, runQuery(getCreatePostsQuery("snvishna", "test title", 60, 30, 21.0, false), logContent)];
            case 2:
                _a.sent();
                return [4 /*yield*/, runQuery(getCreatePostsQuery("shankar", "test title", 160, 30, 97.6, false), logContent)];
            case 3:
                _a.sent();
                return [4 /*yield*/, runQuery(getCreatePostsQuery("snvishna", "test TITLE", 170, 30, 88.8, true), logContent)];
            case 4:
                _a.sent();
                return [4 /*yield*/, runQuery(getCreatePostsQuery("snvishna", "test title", 200, 50, 11.9, false), logContent)];
            case 5:
                _a.sent();
                return [4 /*yield*/, runQuery(getCreatePostsQuery("snvishna", "test title", 170, 30, 88.8, true), logContent)];
            case 6:
                _a.sent();
                return [4 /*yield*/, runQuery(getCreatePostsQuery("snvishna", "test title", 160, 30, 97.6, false), logContent)];
            case 7:
                _a.sent();
                return [4 /*yield*/, runQuery(getCreatePostsQuery("snvishna", "test title", 170, 30, 77.7, true), logContent)
                    // Waiting for the ES Cluster + Streaming Lambda infra to be setup
                ];
            case 8:
                _a.sent();
                // Waiting for the ES Cluster + Streaming Lambda infra to be setup
                console.log('Waiting for the ES Cluster + Streaming Lambda infra to be setup');
                return [4 /*yield*/, cf.wait(120, function () { return Promise.resolve(); })];
            case 9:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var runQuery = function (query, logContent) { return __awaiter(void 0, void 0, void 0, function () {
    var q, response, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                q = __spreadArrays([query], fragments).join('\n');
                return [4 /*yield*/, GRAPHQL_CLIENT.query(q, {})];
            case 1:
                response = _a.sent();
                console.log(logContent + JSON.stringify(response, null, 4));
                return [2 /*return*/, response];
            case 2:
                e_1 = _a.sent();
                console.error(e_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
var GRAPHQL_CLIENT = undefined;
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, e_2, out, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Post @model @searchable {\n        id: ID!\n        author: String!\n        title: String\n        content: String\n        url: String\n        ups: Int\n        downs: Int\n        version: Int\n        relatedPosts: [Post]\n        postedAt: String\n        createdAt: AWSDateTime\n        comments: [String!]\n        ratings: [Int!]\n        percentageUp: Float\n        isPublished: Boolean\n        jsonField: AWSJSON\n    }\n    ";
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
                        new graphql_elasticsearch_transformer_1.default()
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
                e_2 = _a.sent();
                console.error("Failed to create bucket: " + e_2);
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 8, , 9]);
                out = transformer.transform(validSchema);
                // fs.writeFileSync('./out.json', JSON.stringify(out, null, 4))
                // create stack with additional params
                // const additionalParams = generateParams()
                console.log('Creating Stack ' + STACK_NAME);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1' }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)
                    // Arbitrary wait to make sure everything is ready.
                ];
            case 5:
                finishedStack = _a.sent();
                // Arbitrary wait to make sure everything is ready.
                return [4 /*yield*/, cf.wait(120, function () { return Promise.resolve(); })];
            case 6:
                // Arbitrary wait to make sure everything is ready.
                _a.sent();
                console.log('Successfully created stack ' + STACK_NAME);
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                // Create sample mutations to test search queries
                return [4 /*yield*/, createPosts()];
            case 7:
                // Create sample mutations to test search queries
                _a.sent();
                return [3 /*break*/, 9];
            case 8:
                e_3 = _a.sent();
                console.error(e_3);
                expect(true).toEqual(false);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_4, e_5;
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
                e_4 = _a.sent();
                if (e_4.code === 'ValidationError' && e_4.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_4);
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
                e_5 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_5);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts with sort field on a string field', function () { return __awaiter(void 0, void 0, void 0, function () {
    var firstQuery, fourthItemOfFirstQuery, secondQuery, nextToken, thirdQuery, firstItemOfThirdQuery;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(sort: {\n            field: id\n            direction: desc\n        }){\n            items{\n              ...FullPost\n            }\n            nextToken\n          }\n    }", 'Test searchPosts with filter ')];
            case 1:
                firstQuery = _a.sent();
                expect(firstQuery).toBeDefined();
                expect(firstQuery.data.searchPosts).toBeDefined();
                fourthItemOfFirstQuery = firstQuery.data.searchPosts.items[3];
                return [4 /*yield*/, runQuery("query {\n        searchPosts(limit: 3, sort: {\n            field: id\n            direction: desc\n        }){\n            items{\n              ...FullPost\n            }\n            nextToken\n          }\n    }", 'Test searchPosts with limit ')];
            case 2:
                secondQuery = _a.sent();
                expect(secondQuery).toBeDefined();
                expect(secondQuery.data.searchPosts).toBeDefined();
                nextToken = secondQuery.data.searchPosts.nextToken;
                expect(nextToken).toBeDefined();
                return [4 /*yield*/, runQuery("query {\n        searchPosts(nextToken: \"" + nextToken + "\", limit: 3, sort: {\n            field: id\n            direction: desc\n        }){\n            items{\n              ...FullPost\n            }\n            nextToken\n          }\n    }", 'Test searchPosts with sort limit and nextToken  ')];
            case 3:
                thirdQuery = _a.sent();
                expect(thirdQuery).toBeDefined();
                expect(thirdQuery.data.searchPosts).toBeDefined();
                firstItemOfThirdQuery = thirdQuery.data.searchPosts.items[0];
                expect(firstItemOfThirdQuery).toEqual(fourthItemOfFirstQuery);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts with sort on date type', function () { return __awaiter(void 0, void 0, void 0, function () {
    var query, recentItem, oldestItem;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(\n            sort: {\n                field: createdAt\n                direction: desc\n            }) {\n            items {\n                ...FullPost\n            }\n        }\n    }", 'Test search posts with date type response: ')];
            case 1:
                query = _a.sent();
                expect(query).toBeDefined();
                expect(query.data.searchPosts).toBeDefined();
                recentItem = new Date(query.data.searchPosts.items[0].createdAt);
                oldestItem = new Date(query.data.searchPosts.items[query.data.searchPosts.items.length - 1].createdAt);
                expect(recentItem > oldestItem);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query without filter', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts response without filter response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toBeGreaterThan(0);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with basic filter', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            author: { eq: \"snvishna\" }\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts response with basic filter response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(7);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with non-recursive filter', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            title: { eq: \"test title\" }\n            ups: { gte: 100 }\n            percentageUp: { ne: 77.7 }\n            downs: { range: [29, 31] }\n            author: { wildcard: \"s*a\" }\n            isPublished: { eq: true }\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts response with non-recursive filter response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toBeDefined();
                expect(items[0].author).toEqual("snvishna");
                expect(items[0].title).toEqual("test title");
                expect(items[0].ups).toEqual(170);
                expect(items[0].downs).toEqual(30);
                expect(items[0].percentageUp).toEqual(88.8);
                expect(items[0].isPublished).toEqual(true);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with recursive filter 1', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            downs: { eq: 10 }\n            or: [\n                {\n                    author: { wildcard: \"s*a\" },\n                    downs: { eq: 30 }\n                },\n                {\n                    isPublished: { eq: true }\n                }\n            ]\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts response with recursive filter 1 response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toBeDefined();
                expect(items[0].author).toEqual("snvishna");
                expect(items[0].title).toEqual("test");
                expect(items[0].ups).toEqual(157);
                expect(items[0].downs).toEqual(10);
                expect(items[0].percentageUp).toEqual(97.4);
                expect(items[0].isPublished).toEqual(true);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with recursive filter 2', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            downs: { eq: 30 }\n            or: [\n                {\n                    author: { wildcard: \"s*a\" },\n                    downs: { eq: 30 }\n                },\n                {\n                    isPublished: { eq: true }\n                }\n            ]\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts response with recursive filter 2 response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(5);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with recursive filter 3', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            ups:{  gt:199  }\n            and:[\n              {\n                or:[\n                  {\n                    author:{  wildcard:\"s*a\"  }\n                  },\n                  {\n                    downs:{  ne:30  }\n                  }\n                ]\n              },\n              {\n                isPublished:{  eq:false  }\n              }\n            ]\n          }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts query with recursive filter 3 response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toBeDefined();
                expect(items[0].author).toEqual("snvishna");
                expect(items[0].title).toEqual("test title");
                expect(items[0].ups).toEqual(200);
                expect(items[0].downs).toEqual(50);
                expect(items[0].percentageUp).toEqual(11.9);
                expect(items[0].isPublished).toEqual(false);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with recursive filter 4', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            ups:{  gt:100  }\n            and:[\n              {\n                or:[\n                  {\n                    author:{  wildcard:\"s*a\"  }\n                  },\n                  {\n                    downs:{  ne:30  }\n                  }\n                ]\n              },\n              {\n                isPublished:{  eq:false  }\n              }\n            ],\n            not: {\n              percentageUp: { lt: 20 }\n            }\n          }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts query with recursive filter 4 response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toBeDefined();
                expect(items[0].author).toEqual("snvishna");
                expect(items[0].title).toEqual("test title");
                expect(items[0].ups).toEqual(160);
                expect(items[0].downs).toEqual(30);
                expect(items[0].percentageUp).toEqual(97.6);
                expect(items[0].isPublished).toEqual(false);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with recursive filter 5', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            downs:{  ne:30  }\n            or:[\n              {\n                and:[\n                  {\n                    author:{  wildcard:\"s*a\"  },\n                    not: {\n                      isPublished: { eq: true }\n                    }\n                  }\n                ]\n              },\n              {\n                percentageUp:{  range: [90.0, 100.0]  }\n              }\n            ]\n            and: {\n              title:{ matchPhrasePrefix: \"test t\" }\n            }\n          }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts query with recursive filter 5 response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toBeDefined();
                expect(items[0].author).toEqual("snvishna");
                expect(items[0].title).toEqual("test title");
                expect(items[0].ups).toEqual(200);
                expect(items[0].downs).toEqual(50);
                expect(items[0].percentageUp).toEqual(11.9);
                expect(items[0].isPublished).toEqual(false);
                return [2 /*return*/];
        }
    });
}); });
test('Test searchPosts query with recursive filter 6', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            not: {\n              title:{ wildcard: \"*test*\" }\n            }\n            or:[\n              {\n                and:[\n                  {\n                    author:{  wildcard:\"s*a\"  },\n                    not: {\n                      isPublished: { eq: true }\n                    }\n                  }\n                ]\n              },\n              {\n                percentageUp:{  range: [90.0, 100.0]  }\n              }\n            ]\n          }) {\n            items { ...FullPost }\n        }\n    }", 'Test searchPosts query with recursive filter 6 response: ')];
            case 1:
                response = _a.sent();
                expect(response).toBeDefined();
                expect(response.data.searchPosts.items).toBeDefined();
                items = response.data.searchPosts.items;
                expect(items.length).toEqual(0);
                return [2 /*return*/];
        }
    });
}); });
test('Test deletePosts syncing with Elasticsearch', function () { return __awaiter(void 0, void 0, void 0, function () {
    var title, postToBeDeletedResponse, searchResponse1, items1, deleteResponse, searchResponse2, items2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                title = 'to be deleted';
                return [4 /*yield*/, runQuery(getCreatePostsQuery("test author new", title, 1157, 1000, 22.2, true), 'createPost (to be deleted) response: ')];
            case 1:
                postToBeDeletedResponse = _a.sent();
                expect(postToBeDeletedResponse).toBeDefined();
                expect(postToBeDeletedResponse.data.createPost).toBeDefined();
                expect(postToBeDeletedResponse.data.createPost.id).toBeDefined();
                // Wait for the Post to sync to Elasticsearch
                return [4 /*yield*/, cf.wait(10, function () { return Promise.resolve(); })];
            case 2:
                // Wait for the Post to sync to Elasticsearch
                _a.sent();
                return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            title: { eq: \"" + title + "\" }\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test deletePosts syncing with Elasticsearch Search_Before response: ')];
            case 3:
                searchResponse1 = _a.sent();
                expect(searchResponse1).toBeDefined();
                expect(searchResponse1.data.searchPosts.items).toBeDefined();
                items1 = searchResponse1.data.searchPosts.items;
                expect(items1.length).toEqual(1);
                expect(items1[0].id).toEqual(postToBeDeletedResponse.data.createPost.id);
                expect(items1[0].author).toEqual("test author new");
                expect(items1[0].title).toEqual(title);
                expect(items1[0].ups).toEqual(1157);
                expect(items1[0].downs).toEqual(1000);
                expect(items1[0].percentageUp).toEqual(22.2);
                expect(items1[0].isPublished).toEqual(true);
                return [4 /*yield*/, runQuery("mutation {\n        deletePost(input: {\n            id: \"" + postToBeDeletedResponse.data.createPost.id + "\"\n        }) {\n            ...FullPost\n        }\n    }", 'Test deletePosts syncing with Elasticsearch Perform_Delete response: ')];
            case 4:
                deleteResponse = _a.sent();
                expect(deleteResponse).toBeDefined();
                expect(deleteResponse.data.deletePost).toBeDefined();
                expect(deleteResponse.data.deletePost.id).toEqual(postToBeDeletedResponse.data.createPost.id);
                // Wait for the Deleted Post to sync to Elasticsearch
                return [4 /*yield*/, cf.wait(10, function () { return Promise.resolve(); })];
            case 5:
                // Wait for the Deleted Post to sync to Elasticsearch
                _a.sent();
                return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            title: { eq: \"" + title + "\" }\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test deletePosts syncing with Elasticsearch Search_After response: ')];
            case 6:
                searchResponse2 = _a.sent();
                expect(searchResponse2).toBeDefined();
                expect(searchResponse2.data.searchPosts.items).toBeDefined();
                items2 = searchResponse2.data.searchPosts.items;
                expect(items2.length).toEqual(0);
                return [2 /*return*/];
        }
    });
}); });
test('Test updatePost syncing with Elasticsearch', function () { return __awaiter(void 0, void 0, void 0, function () {
    var author, title, ups, downs, percentageUp, isPublished, postToBeUpdatedResponse, id, searchResponse1, items1, newTitle, updateResponse, searchResponse2, items2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                author = 'test author update new';
                title = 'to be updated new';
                ups = 2157;
                downs = 2000;
                percentageUp = 22.2;
                isPublished = true;
                return [4 /*yield*/, runQuery(getCreatePostsQuery(author, title, ups, downs, percentageUp, isPublished), 'createPost (to be updated) response: ')];
            case 1:
                postToBeUpdatedResponse = _a.sent();
                expect(postToBeUpdatedResponse).toBeDefined();
                expect(postToBeUpdatedResponse.data.createPost).toBeDefined();
                id = postToBeUpdatedResponse.data.createPost.id;
                expect(id).toBeDefined();
                // Wait for the Post to sync to Elasticsearch
                return [4 /*yield*/, cf.wait(10, function () { return Promise.resolve(); })];
            case 2:
                // Wait for the Post to sync to Elasticsearch
                _a.sent();
                return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            id: { eq: \"" + id + "\" }\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test updatePost syncing with Elasticsearch Search_Before response: ')];
            case 3:
                searchResponse1 = _a.sent();
                expect(searchResponse1).toBeDefined();
                expect(searchResponse1.data.searchPosts.items).toBeDefined();
                items1 = searchResponse1.data.searchPosts.items;
                expect(items1.length).toEqual(1);
                expect(items1[0].id).toEqual(id);
                expect(items1[0].author).toEqual(author);
                expect(items1[0].title).toEqual(title);
                expect(items1[0].ups).toEqual(ups);
                expect(items1[0].downs).toEqual(downs);
                expect(items1[0].percentageUp).toEqual(percentageUp);
                expect(items1[0].isPublished).toEqual(isPublished);
                newTitle = title.concat('_updated');
                return [4 /*yield*/, runQuery("mutation {\n        updatePost(input: {\n            id: \"" + id + "\"\n            author: \"" + author + "\"\n            title: \"" + newTitle + "\"\n            ups: " + ups + "\n            downs: " + downs + "\n            percentageUp: " + percentageUp + "\n            isPublished: " + isPublished + "\n        }) {\n            ...FullPost\n        }\n    }", 'Test updatePost syncing with Elasticsearch Perform_Update response: ')];
            case 4:
                updateResponse = _a.sent();
                expect(updateResponse).toBeDefined();
                expect(updateResponse.data.updatePost).toBeDefined();
                expect(updateResponse.data.updatePost.id).toEqual(id);
                expect(updateResponse.data.updatePost.title).toEqual(newTitle);
                // Wait for the Update Post to sync to Elasticsearch
                return [4 /*yield*/, cf.wait(10, function () { return Promise.resolve(); })];
            case 5:
                // Wait for the Update Post to sync to Elasticsearch
                _a.sent();
                return [4 /*yield*/, runQuery("query {\n        searchPosts(filter: {\n            id: { eq: \"" + id + "\" }\n        }) {\n            items { ...FullPost }\n        }\n    }", 'Test updatePost syncing with Elasticsearch Search_After response: ')];
            case 6:
                searchResponse2 = _a.sent();
                expect(searchResponse2).toBeDefined();
                expect(searchResponse2.data.searchPosts.items).toBeDefined();
                items2 = searchResponse2.data.searchPosts.items;
                expect(items2.length).toEqual(1);
                expect(items2[0].id).toEqual(id);
                expect(items2[0].author).toEqual(author);
                expect(items2[0].title).toEqual(newTitle);
                expect(items2[0].ups).toEqual(ups);
                expect(items2[0].downs).toEqual(downs);
                expect(items2[0].percentageUp).toEqual(percentageUp);
                expect(items2[0].isPublished).toEqual(isPublished);
                return [2 /*return*/];
        }
    });
}); });
function generateParams() {
    var _a;
    var params = (_a = {},
        _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchAccessIAMRoleName] = 'ElasticsearchAccessIAMRoleTest',
        _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingIAMRoleName] = 'ElasticsearchStreamingIAMRoleTest',
        _a);
    return params;
}
function getCreatePostsQuery(author, title, ups, downs, percentageUp, isPublished) {
    return "mutation {\n        createPost(input: {\n            author: \"" + author + "\"\n            title: \"" + title + "\"\n            ups: " + ups + "\n            downs: " + downs + "\n            percentageUp: " + percentageUp + "\n            isPublished: " + isPublished + "\n        }) { ...FullPost }\n    }";
}
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
//# sourceMappingURL=SearchableModelTransformer.e2e.test.js.map