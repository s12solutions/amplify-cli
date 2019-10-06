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
var graphql_key_transformer_1 = require("graphql-key-transformer");
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
var STACK_NAME = "NewConnectionTransformerTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-new-connection-transformer-test-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/new_connection_transform_tests/';
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
                validSchema = "\ntype Child\n\t@model\n\t@key(fields: [\"id\", \"name\"])\n{\n\tid: ID!\n\tname: String!\n\n\tparents: [Parent] @connection(keyName: \"byChild\", fields: [\"id\"])\n}\n\ntype Parent\n\t@model\n\t@key(name: \"byChild\", fields: [\"childID\", \"childName\"])\n{\n\tid: ID!\n\tchildID: ID!\n\tchildName: String!\n\n\tchild: Child @connection(fields: [\"childID\", \"childName\"])\n}\n\ntype User\n\t@model\n\t@key(fields: [\"id\", \"name\", \"surname\"])\n{\n\tid: ID!\n\tname: String!\n    surname: String!\n\n    friendships: [Friendship] @connection(keyName: \"byUser\", fields: [\"id\"])\n}\n\ntype Friendship\n    @model\n    @key(name: \"byUser\", fields: [\"userID\", \"friendID\"])\n{\n    id: ID!\n    userID: ID!\n    friendID: ID!\n\n    friend: [User] @connection(fields: [\"friendID\"])\n}\n\ntype UserModel\n    @model\n    @key(fields: [\"id\", \"rollNumber\"])\n    @key(name: \"composite\", fields: [\"id\", \"name\", \"surname\"])\n{\n    id: ID!\n    rollNumber: Int!\n\tname: String!\n    surname: String!\n\n    authorPosts: [PostAuthor] @connection(keyName: \"byAuthor\", fields: [\"id\"])\n}\n\n\ntype PostModel @model {\n\tid: ID!\n\tauthorID: ID!\n\tauthorName: String!\n\tauthorSurname: String!\n\tpostContents: [String]\n\n    authors: [UserModel] @connection(keyName: \"composite\", fields: [\"authorID\", \"authorName\", \"authorSurname\"])\n    singleAuthor: User @connection(fields: [\"authorID\", \"authorName\", \"authorSurname\"])\n}\n\ntype Post @model {\n\tid: ID!\n\tauthorID: ID!\n\tpostContents: [String]\n\n\tauthors: [User] @connection(fields: [\"authorID\"])\n}\n\ntype PostAuthor\n    @model\n    @key(name: \"byAuthor\", fields: [\"authorID\", \"postID\"])\n{\n    id: ID!\n    authorID: ID!\n    postID: ID!\n\n    post: Post @connection(fields: [\"postID\"])\n}\n";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_key_transformer_1.default(),
                        new graphql_connection_transformer_1.ModelConnectionTransformer(),
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
test('Test Parent.child getItem', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createChild, createParent, queryParent, child;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createChild(input: { id: \"1\", name: \"child1\" }) {\n            id\n            name\n        }\n    }", {})];
            case 1:
                createChild = _a.sent();
                expect(createChild.data.createChild.id).toBeDefined();
                expect(createChild.data.createChild.name).toEqual('child1');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createParent(input: { childID: \"1\", childName: \"" + createChild.data.createChild.name + "\" }) {\n            id\n            childID\n            childName\n        }\n    }", {})];
            case 2:
                createParent = _a.sent();
                expect(createParent.data.createParent.id).toBeDefined();
                expect(createParent.data.createParent.childID).toEqual(createChild.data.createChild.id);
                expect(createParent.data.createParent.childName).toEqual(createChild.data.createChild.name);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getParent(id: \"" + createParent.data.createParent.id + "\") {\n            id\n            child {\n                id\n                name\n            }\n        }\n    }", {})];
            case 3:
                queryParent = _a.sent();
                expect(queryParent.data.getParent).toBeDefined();
                child = queryParent.data.getParent.child;
                expect(child.id).toEqual(createParent.data.createParent.childID);
                expect(child.name).toEqual(createParent.data.createParent.childName);
                return [2 /*return*/];
        }
    });
}); });
test('Test Child.parents query', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createChild, createParent1, queryChild, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createChild(input: { id: \"2\", name: \"child2\" }) {\n            id\n            name\n        }\n    }", {})];
            case 1:
                createChild = _a.sent();
                expect(createChild.data.createChild.id).toBeDefined();
                expect(createChild.data.createChild.name).toEqual('child2');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createParent(input: { childID: \"" + createChild.data.createChild.id + "\", childName: \"" + createChild.data.createChild.name + "\" }) {\n            id\n            childID\n            childName\n        }\n    }", {})];
            case 2:
                createParent1 = _a.sent();
                expect(createParent1.data.createParent.id).toBeDefined();
                expect(createParent1.data.createParent.childID).toEqual(createChild.data.createChild.id);
                expect(createParent1.data.createParent.childName).toEqual(createChild.data.createChild.name);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getChild(id: \"" + createChild.data.createChild.id + "\", name: \"" + createChild.data.createChild.name + "\") {\n            id\n            parents {\n                items {\n                    id\n                    childID\n                    childName\n                }\n            }\n        }\n    }", {})];
            case 3:
                queryChild = _a.sent();
                expect(queryChild.data.getChild).toBeDefined();
                items = queryChild.data.getChild.parents.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toEqual(createParent1.data.createParent.id);
                expect(items[0].childID).toEqual(createParent1.data.createParent.childID);
                expect(items[0].childName).toEqual(createParent1.data.createParent.childName);
                return [2 /*return*/];
        }
    });
}); });
test('Test PostModel.singleAuthor GetItem with composite sortkey', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser, createPostModel, queryPostModel, author;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createUser(input: { id: \"123\", name: \"Bob\", surname: \"Rob\" }) {\n          id\n          name\n          surname\n        }\n      }", {})];
            case 1:
                createUser = _a.sent();
                expect(createUser.data.createUser.id).toBeDefined();
                expect(createUser.data.createUser.name).toEqual('Bob');
                expect(createUser.data.createUser.surname).toEqual('Rob');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPostModel(input: { authorID: \"" + createUser.data.createUser.id + "\",\n                                 authorName: \"" + createUser.data.createUser.name + "\",\n                                 authorSurname: \"" + createUser.data.createUser.surname + "\",\n                                 postContents: \"potato\" }) {\n          id\n          authorID\n          authorName\n          authorSurname\n          postContents\n        }\n      }", {})];
            case 2:
                createPostModel = _a.sent();
                expect(createPostModel.data.createPostModel.id).toBeDefined();
                expect(createPostModel.data.createPostModel.authorID).toEqual(createUser.data.createUser.id);
                expect(createPostModel.data.createPostModel.authorName).toEqual(createUser.data.createUser.name);
                expect(createPostModel.data.createPostModel.authorSurname).toEqual(createUser.data.createUser.surname);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPostModel(id: \"" + createPostModel.data.createPostModel.id + "\") {\n            id\n            singleAuthor {\n                id\n                name\n                surname\n            }\n        }\n    }", {})];
            case 3:
                queryPostModel = _a.sent();
                expect(queryPostModel.data.getPostModel).toBeDefined();
                author = queryPostModel.data.getPostModel.singleAuthor;
                expect(author.id).toEqual(createUser.data.createUser.id);
                expect(author.name).toEqual(createUser.data.createUser.name);
                expect(author.surname).toEqual(createUser.data.createUser.surname);
                return [2 /*return*/];
        }
    });
}); });
test('Test PostModel.authors query with composite sortkey', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser, createUser2, createPostModel, queryPostModel, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createUserModel(input: { id: \"123\", rollNumber: 1, name: \"Bob\", surname: \"Rob\" }) {\n          id\n          rollNumber\n          name\n          surname\n        }\n      }", {})];
            case 1:
                createUser = _a.sent();
                expect(createUser.data.createUserModel.id).toBeDefined();
                expect(createUser.data.createUserModel.name).toEqual('Bob');
                expect(createUser.data.createUserModel.rollNumber).toEqual(1);
                expect(createUser.data.createUserModel.surname).toEqual('Rob');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createUserModel(input: { id: \"123\", rollNumber: 2, name: \"Bob\", surname: \"Rob\" }) {\n          id\n          rollNumber\n          name\n          surname\n        }\n      }", {})];
            case 2:
                createUser2 = _a.sent();
                expect(createUser2.data.createUserModel.id).toBeDefined();
                expect(createUser2.data.createUserModel.name).toEqual('Bob');
                expect(createUser2.data.createUserModel.rollNumber).toEqual(2);
                expect(createUser2.data.createUserModel.surname).toEqual('Rob');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPostModel(input: { authorID: \"" + createUser.data.createUserModel.id + "\",\n                                 authorName: \"" + createUser.data.createUserModel.name + "\",\n                                 authorSurname: \"" + createUser.data.createUserModel.surname + "\",\n                                 postContents: \"potato\" }) {\n          id\n          authorID\n          authorName\n          authorSurname\n          postContents\n        }\n      }", {})];
            case 3:
                createPostModel = _a.sent();
                expect(createPostModel.data.createPostModel.id).toBeDefined();
                expect(createPostModel.data.createPostModel.authorID).toEqual(createUser.data.createUserModel.id);
                expect(createPostModel.data.createPostModel.authorName).toEqual(createUser.data.createUserModel.name);
                expect(createPostModel.data.createPostModel.authorSurname).toEqual(createUser.data.createUserModel.surname);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPostModel(id: \"" + createPostModel.data.createPostModel.id + "\") {\n            id\n            authors {\n                items {\n                    id\n                    rollNumber\n                    name\n                    surname\n                }\n            }\n        }\n    }", {})];
            case 4:
                queryPostModel = _a.sent();
                expect(queryPostModel.data.getPostModel).toBeDefined();
                items = queryPostModel.data.getPostModel.authors.items;
                expect(items.length).toEqual(2);
                expect(items[0].id).toEqual(createUser.data.createUserModel.id);
                try {
                    expect(items[0].rollNumber).toEqual(createUser.data.createUserModel.rollNumber);
                    expect(items[1].rollNumber).toEqual(createUser2.data.createUserModel.rollNumber);
                }
                catch (error) {
                    expect(items[1].rollNumber).toEqual(createUser.data.createUserModel.rollNumber);
                    expect(items[0].rollNumber).toEqual(createUser2.data.createUserModel.rollNumber);
                }
                expect(items[0].name).toEqual(createUser.data.createUserModel.name);
                expect(items[0].surname).toEqual(createUser.data.createUserModel.surname);
                expect(items[1].id).toEqual(createUser2.data.createUserModel.id);
                expect(items[1].surname).toEqual(createUser2.data.createUserModel.surname);
                expect(items[1].name).toEqual(createUser2.data.createUserModel.name);
                return [2 /*return*/];
        }
    });
}); });
test('Test PostModel.authors query with composite sortkey passed as arg.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser, createPost, queryPost, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createUser(input: { id: \"123\", name: \"Bobby\", surname: \"Rob\" }) {\n          id\n          name\n          surname\n        }\n      }", {})];
            case 1:
                createUser = _a.sent();
                expect(createUser.data.createUser.id).toBeDefined();
                expect(createUser.data.createUser.name).toEqual('Bobby');
                expect(createUser.data.createUser.surname).toEqual('Rob');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPost(input: { id: \"321\", authorID: \"" + createUser.data.createUser.id + "\", postContents: \"potato\"}) {\n          id\n          authorID\n          postContents\n        }\n      }", {})];
            case 2:
                createPost = _a.sent();
                expect(createPost.data.createPost.id).toBeDefined();
                expect(createPost.data.createPost.authorID).toEqual(createUser.data.createUser.id);
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getPost(id: \"" + createPost.data.createPost.id + "\") {\n            id\n            authors(nameSurname: {beginsWith: {name: \"" + createUser.data.createUser.name + "\", surname: \"" + createUser.data.createUser.surname + "\"}}) {\n                items {\n                    id\n                    name\n                    surname\n                }\n            }\n        }\n    }", {})];
            case 3:
                queryPost = _a.sent();
                expect(queryPost.data.getPost).toBeDefined();
                items = queryPost.data.getPost.authors.items;
                expect(items.length).toEqual(1);
                expect(items[0].id).toEqual(createUser.data.createUser.id);
                expect(items[0].name).toEqual(createUser.data.createUser.name);
                expect(items[0].surname).toEqual(createUser.data.createUser.surname);
                return [2 /*return*/];
        }
    });
}); });
test('Test User.authorPosts.posts query followed by getItem (intermediary model)', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createPostAuthor, queryUser, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createPostAuthor(input: { authorID: \"123\", postID: \"321\" }) {\n            id\n            authorID\n            postID\n        }\n    }")];
            case 1:
                createPostAuthor = _a.sent();
                expect(createPostAuthor.data.createPostAuthor.id).toBeDefined();
                expect(createPostAuthor.data.createPostAuthor.authorID).toEqual("123");
                expect(createPostAuthor.data.createPostAuthor.postID).toEqual("321");
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getUserModel(id: \"123\", rollNumber: 1) {\n            id\n            authorPosts {\n                items {\n                    post {\n                        id\n                        postContents\n                    }\n                }\n            }\n        }\n    }", {})];
            case 2:
                queryUser = _a.sent();
                expect(queryUser.data.getUserModel).toBeDefined();
                items = queryUser.data.getUserModel.authorPosts.items;
                expect(items.length).toEqual(1);
                expect(items[0].post.id).toEqual("321");
                expect(items[0].post.postContents).toEqual(["potato"]);
                return [2 /*return*/];
        }
    });
}); });
test('Test User.friendship.friend query (reflexive has many).', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser, createUser1, createFriendship, queryUser, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createUser(input: { id: \"12\", name: \"Bobby\", surname: \"Rob\" }) {\n          id\n          name\n          surname\n        }\n      }", {})];
            case 1:
                createUser = _a.sent();
                expect(createUser.data.createUser.id).toBeDefined();
                expect(createUser.data.createUser.name).toEqual('Bobby');
                expect(createUser.data.createUser.surname).toEqual('Rob');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createUser(input: { id: \"13\", name: \"Bob\", surname: \"Rob\" }) {\n          id\n          name\n          surname\n        }\n      }", {})];
            case 2:
                createUser1 = _a.sent();
                expect(createUser1.data.createUser.id).toBeDefined();
                expect(createUser1.data.createUser.name).toEqual('Bob');
                expect(createUser1.data.createUser.surname).toEqual('Rob');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation {\n        createFriendship(input: { id: \"1\", userID: 13, friendID: 12 }) {\n          id\n          userID\n          friendID\n        }\n      }", {})];
            case 3:
                createFriendship = _a.sent();
                expect(createFriendship.data.createFriendship.id).toBeDefined();
                expect(createFriendship.data.createFriendship.userID).toEqual('13');
                expect(createFriendship.data.createFriendship.friendID).toEqual('12');
                return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        getUser(id: \"13\", name: \"Bob\", surname: \"Rob\") {\n            id\n            friendships {\n                items {\n                    friend {\n                        items {\n                            id\n                            name\n                        }\n                    }\n                }\n            }\n        }\n    }", {})];
            case 4:
                queryUser = _a.sent();
                expect(queryUser.data.getUser).toBeDefined();
                items = queryUser.data.getUser.friendships.items;
                expect(items.length).toEqual(1);
                expect(items[0].friend.items[0].id).toEqual("12");
                expect(items[0].friend.items[0].name).toEqual("Bobby");
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=NewConnectionTransformer.e2e.test.js.map