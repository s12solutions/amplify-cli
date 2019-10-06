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
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var CloudFormationClient_1 = require("../CloudFormationClient");
var GraphQLClient_1 = require("../GraphQLClient");
var deployNestedStacks_1 = require("../deployNestedStacks");
var emptyBucket_1 = require("../emptyBucket");
var S3Client_1 = require("../S3Client");
var S3 = require("aws-sdk/clients/s3");
var moment = require("moment");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "ModelConnectionTransformerTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-connection-transformer-test-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/model_connection_transform_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var GRAPHQL_CLIENT = undefined;
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, out, e_1, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n        comments: [Comment] @connection(name: \"PostComments\", keyField: \"postId\")\n        sortedComments: [SortedComment] @connection(name: \"SortedPostComments\", keyField: \"postId\", sortField: \"when\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String!\n        post: Post @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    type SortedComment @model {\n        id: ID!\n        content: String!\n        when: String!\n        post: Post @connection(name: \"SortedPostComments\", keyField: \"postId\", sortField: \"when\")\n    }\n    type Album @model {\n        id: ID!\n        title: String!\n        parent: Album @connection(name: \"AlbumAlbums\", keyField: \"parentId\")\n        children: [Album] @connection(name: \"AlbumAlbums\", keyField: \"parentId\")\n        photos: [Photo] @connection(name: \"AlbumPhotos\", keyField: \"albumId\")\n    }\n    type Photo @model {\n        id: ID!\n        album: Album @connection (name: \"AlbumPhotos\", keyField: \"albumId\")\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_connection_transformer_1.default(),
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
                _a.trys.push([4, 7, , 8]);
                console.log('Creating Stack ' + STACK_NAME);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1' }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)
                    // Arbitrary wait to make sure everything is ready.
                ];
            case 5:
                finishedStack = _a.sent();
                // Arbitrary wait to make sure everything is ready.
                return [4 /*yield*/, cf.wait(5, function () { return Promise.resolve(); })];
            case 6:
                // Arbitrary wait to make sure everything is ready.
                _a.sent();
                console.log('Successfully created stack ' + STACK_NAME);
                expect(finishedStack).toBeDefined();
                console.log(JSON.stringify(finishedStack, null, 4));
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                return [3 /*break*/, 8];
            case 7:
                e_2 = _a.sent();
                console.error(e_2);
                expect(true).toEqual(false);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
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
test('Test queryPost query', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, createCommentResponse, queryResponse, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { title: \"Test Query\" }) {\n            id\n            title\n        }\n    }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual('Test Query');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createComment(input: { content: \"A comment!\", postId: \"" + createResponse.data.createPost.id + "\" }) {\n            id\n            content\n            post {\n                id\n                title\n            }\n        }\n    }", {})];
            case 2:
                createCommentResponse = _a.sent();
                expect(createCommentResponse.data.createComment.id).toBeDefined();
                expect(createCommentResponse.data.createComment.content).toEqual('A comment!');
                expect(createCommentResponse.data.createComment.post.id).toEqual(createResponse.data.createPost.id);
                expect(createCommentResponse.data.createComment.post.title).toEqual(createResponse.data.createPost.title);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            comments {\n                items {\n                    id\n                    content\n                }\n            }\n        }\n    }", {})];
            case 3:
                queryResponse = _a.sent();
                expect(queryResponse.data.getPost).toBeDefined();
                items = queryResponse.data.getPost.comments.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toEqual(createCommentResponse.data.createComment.id);
                return [2 /*return*/];
        }
    });
}); });
var title = "Test Query with Sort Field";
var comment1 = "a comment and a date! - 1";
var comment2 = "a comment and a date! - 2";
var whenpast = "2017-10-01T00:00:00.000Z";
var when1 = "2018-10-01T00:00:00.000Z";
var whenmid = "2018-12-01T00:00:00.000Z";
var when2 = "2019-10-01T00:00:01.000Z";
var whenfuture = "2020-10-01T00:00:00.000Z";
test('Test queryPost query with sortField', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createResponse, createCommentResponse1, createCommentResponse2, queryResponse, items, queryResponseDesc, itemsDesc, queryResponseWithKeyCondition, itemsDescWithKeyCondition, queryResponseWithKeyConditionEq, itemsDescWithKeyConditionEq, queryResponseWithKeyConditionGt, itemsDescWithKeyConditionGt, queryResponseWithKeyConditionGe, itemsDescWithKeyConditionGe, queryResponseWithKeyConditionLe, itemsDescWithKeyConditionLe, queryResponseWithKeyConditionLt, itemsDescWithKeyConditionLt, queryResponseWithKeyConditionBetween, itemsDescWithKeyConditionBetween;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { title: \"" + title + "\" }) {\n            id\n            title\n        }\n    }", {})];
            case 1:
                createResponse = _a.sent();
                expect(createResponse.data.createPost.id).toBeDefined();
                expect(createResponse.data.createPost.title).toEqual(title);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createSortedComment(input:\n            { content: \"" + comment1 + "\",\n                when: \"" + when1 + "\"\n                postId: \"" + createResponse.data.createPost.id + "\"\n            }) {\n            id\n            content\n            post {\n                id\n                title\n            }\n        }\n    }", {})];
            case 2:
                createCommentResponse1 = _a.sent();
                expect(createCommentResponse1.data.createSortedComment.id).toBeDefined();
                expect(createCommentResponse1.data.createSortedComment.content).toEqual(comment1);
                expect(createCommentResponse1.data.createSortedComment.post.id).toEqual(createResponse.data.createPost.id);
                expect(createCommentResponse1.data.createSortedComment.post.title).toEqual(createResponse.data.createPost.title);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createSortedComment(input:\n            { content: \"" + comment2 + "\",\n                when: \"" + when2 + "\"\n                postId: \"" + createResponse.data.createPost.id + "\"\n            }) {\n            id\n            content\n            post {\n                id\n                title\n            }\n        }\n    }", {})];
            case 3:
                createCommentResponse2 = _a.sent();
                expect(createCommentResponse2.data.createSortedComment.id).toBeDefined();
                expect(createCommentResponse2.data.createSortedComment.content).toEqual(comment2);
                expect(createCommentResponse2.data.createSortedComment.post.id).toEqual(createResponse.data.createPost.id);
                expect(createCommentResponse2.data.createSortedComment.post.title).toEqual(createResponse.data.createPost.title);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 4:
                queryResponse = _a.sent();
                expect(queryResponse.data.getPost).toBeDefined();
                items = queryResponse.data.getPost.sortedComments.items;
                expect(items.length).toEqual(2);
                expect(items[0].id).toEqual(createCommentResponse1.data.createSortedComment.id);
                expect(items[1].id).toEqual(createCommentResponse2.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(sortDirection: DESC) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 5:
                queryResponseDesc = _a.sent();
                expect(queryResponseDesc.data.getPost).toBeDefined();
                itemsDesc = queryResponseDesc.data.getPost.sortedComments.items;
                expect(itemsDesc.length).toEqual(2);
                expect(itemsDesc[0].id).toEqual(createCommentResponse2.data.createSortedComment.id);
                expect(itemsDesc[1].id).toEqual(createCommentResponse1.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(when: { beginsWith: \"2018\"}) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 6:
                queryResponseWithKeyCondition = _a.sent();
                expect(queryResponseWithKeyCondition.data.getPost).toBeDefined();
                itemsDescWithKeyCondition = queryResponseWithKeyCondition.data.getPost.sortedComments.items;
                expect(itemsDescWithKeyCondition.length).toEqual(1);
                expect(itemsDescWithKeyCondition[0].id).toEqual(createCommentResponse1.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(when: { eq: \"" + when1 + "\"}) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 7:
                queryResponseWithKeyConditionEq = _a.sent();
                expect(queryResponseWithKeyConditionEq.data.getPost).toBeDefined();
                itemsDescWithKeyConditionEq = queryResponseWithKeyConditionEq.data.getPost.sortedComments.items;
                expect(itemsDescWithKeyConditionEq.length).toEqual(1);
                expect(itemsDescWithKeyConditionEq[0].id).toEqual(createCommentResponse1.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(when: { gt: \"" + when1 + "\"}) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 8:
                queryResponseWithKeyConditionGt = _a.sent();
                expect(queryResponseWithKeyConditionGt.data.getPost).toBeDefined();
                itemsDescWithKeyConditionGt = queryResponseWithKeyConditionGt.data.getPost.sortedComments.items;
                expect(itemsDescWithKeyConditionGt.length).toEqual(1);
                expect(itemsDescWithKeyConditionGt[0].id).toEqual(createCommentResponse2.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(when: { ge: \"" + when1 + "\"}) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 9:
                queryResponseWithKeyConditionGe = _a.sent();
                expect(queryResponseWithKeyConditionGe.data.getPost).toBeDefined();
                itemsDescWithKeyConditionGe = queryResponseWithKeyConditionGe.data.getPost.sortedComments.items;
                expect(itemsDescWithKeyConditionGe.length).toEqual(2);
                expect(itemsDescWithKeyConditionGe[0].id).toEqual(createCommentResponse1.data.createSortedComment.id);
                expect(itemsDescWithKeyConditionGe[1].id).toEqual(createCommentResponse2.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(when: { le: \"" + when2 + "\"}) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 10:
                queryResponseWithKeyConditionLe = _a.sent();
                expect(queryResponseWithKeyConditionLe.data.getPost).toBeDefined();
                itemsDescWithKeyConditionLe = queryResponseWithKeyConditionLe.data.getPost.sortedComments.items;
                expect(itemsDescWithKeyConditionLe.length).toEqual(2);
                expect(itemsDescWithKeyConditionLe[0].id).toEqual(createCommentResponse1.data.createSortedComment.id);
                expect(itemsDescWithKeyConditionLe[1].id).toEqual(createCommentResponse2.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(when: { lt: \"" + when2 + "\"}) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 11:
                queryResponseWithKeyConditionLt = _a.sent();
                expect(queryResponseWithKeyConditionLt.data.getPost).toBeDefined();
                itemsDescWithKeyConditionLt = queryResponseWithKeyConditionLt.data.getPost.sortedComments.items;
                expect(itemsDescWithKeyConditionLt.length).toEqual(1);
                expect(itemsDescWithKeyConditionLt[0].id).toEqual(createCommentResponse1.data.createSortedComment.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createResponse.data.createPost.id + "\") {\n            id\n            title\n            sortedComments(when: { between: [\"" + whenmid + "\", \"" + whenfuture + "\"]}) {\n                items {\n                    id\n                    when\n                    content\n                }\n            }\n        }\n    }", {})];
            case 12:
                queryResponseWithKeyConditionBetween = _a.sent();
                expect(queryResponseWithKeyConditionBetween.data.getPost).toBeDefined();
                itemsDescWithKeyConditionBetween = queryResponseWithKeyConditionBetween.data.getPost.sortedComments.items;
                expect(itemsDescWithKeyConditionBetween.length).toEqual(1);
                expect(itemsDescWithKeyConditionBetween[0].id).toEqual(createCommentResponse2.data.createSortedComment.id);
                return [2 /*return*/];
        }
    });
}); });
test('Test create comment without a post and then querying the comment.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createCommentResponse1, queryResponseDesc, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n            createComment(input:\n                { content: \"" + comment1 + "\" }) {\n                id\n                content\n                post {\n                    id\n                    title\n                }\n            }\n        }", {})];
            case 1:
                createCommentResponse1 = _a.sent();
                expect(createCommentResponse1.data.createComment.id).toBeDefined();
                expect(createCommentResponse1.data.createComment.content).toEqual(comment1);
                expect(createCommentResponse1.data.createComment.post).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n            getComment(id: \"" + createCommentResponse1.data.createComment.id + "\") {\n                id\n                content\n                post {\n                    id\n                }\n            }\n        }", {})];
            case 2:
                queryResponseDesc = _a.sent();
                expect(queryResponseDesc.data.getComment).toBeDefined();
                expect(queryResponseDesc.data.getComment.post).toBeNull();
                return [3 /*break*/, 4];
            case 3:
                e_5 = _a.sent();
                console.error(e_5);
                // fail
                expect(e_5).toBeUndefined();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
test('Test album self connection.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createAlbum, createSelfAlbum, queryAlbum;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createAlbum(input: { title: \"Test Album\" }) {\n            id\n            title\n        }\n    }", {})];
            case 1:
                createAlbum = _a.sent();
                expect(createAlbum.data.createAlbum.id).toBeDefined();
                expect(createAlbum.data.createAlbum.title).toEqual('Test Album');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createAlbum(input: { title: \"A Album!\", parentId: \"" + createAlbum.data.createAlbum.id + "\" }) {\n            id\n            title\n            parent {\n                id\n                title\n            }\n        }\n    }", {})];
            case 2:
                createSelfAlbum = _a.sent();
                expect(createSelfAlbum.data.createAlbum.id).toBeDefined();
                expect(createSelfAlbum.data.createAlbum.title).toEqual('A Album!');
                expect(createSelfAlbum.data.createAlbum.parent.id).toEqual(createAlbum.data.createAlbum.id);
                expect(createSelfAlbum.data.createAlbum.parent.title).toEqual(createAlbum.data.createAlbum.title);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getAlbum(id: \"" + createAlbum.data.createAlbum.id + "\") {\n            id\n            title\n        }\n    }", {})];
            case 3:
                queryAlbum = _a.sent();
                expect(queryAlbum.data.getAlbum).toBeDefined();
                expect(queryAlbum.data.getAlbum.title).toEqual('Test Album');
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=ModelConnectionTransformer.e2e.test.js.map