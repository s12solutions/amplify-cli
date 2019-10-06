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
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
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
var STACK_NAME = "KeyTransformerTests-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-key-transformer-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/key_transformer_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var GRAPHQL_CLIENT = undefined;
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, e_1, transformer, out, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Order @model @key(fields: [\"customerEmail\", \"createdAt\"]) {\n        customerEmail: String!\n        createdAt: String!\n        orderId: ID!\n    }\n    type Customer @model @key(fields: [\"email\"]) {\n        email: String!\n        addresslist:  [String]\n        username: String\n    }\n    type Item @model\n        @key(fields: [\"orderId\", \"status\", \"createdAt\"])\n        @key(name: \"ByStatus\", fields: [\"status\", \"createdAt\"], queryField: \"itemsByStatus\")\n        @key(name: \"ByCreatedAt\", fields: [\"createdAt\", \"status\"], queryField: \"itemsByCreatedAt\")\n    {\n        orderId: ID!\n        status: Status!\n        createdAt: AWSDateTime!\n        name: String!\n    }\n    enum Status {\n        DELIVERED IN_TRANSIT PENDING UNKNOWN\n    }\n    type ShippingUpdate @model\n        @key(name: \"ByOrderItemStatus\", fields: [\"orderId\", \"itemId\", \"status\"], queryField: \"shippingUpdates\")\n    {\n        id: ID!\n        orderId: ID\n        itemId: ID\n        status: Status\n        name: String\n    }\n    ";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, awsS3Client.createBucket({ Bucket: BUCKET_NAME }).promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.warn("Could not create bucket: " + e_1);
                return [3 /*break*/, 4];
            case 4:
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_key_transformer_1.default(),
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
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1', env: 'dev' }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)
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
                console.log(finishedStack);
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_2, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('Deleting stack ' + STACK_NAME);
                return [4 /*yield*/, cf.deleteStack(STACK_NAME)
                    // await cf.waitForStack(STACK_NAME)
                ];
            case 1:
                _a.sent();
                // await cf.waitForStack(STACK_NAME)
                console.log('Successfully deleted stack ' + STACK_NAME);
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                if (e_2.code === 'ValidationError' && e_2.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_2);
                    expect(true).toEqual(false);
                }
                return [3 /*break*/, 3];
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                e_3 = _a.sent();
                console.warn("Error during bucket cleanup: " + e_3);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * Test queries below
 */
test('Test getX with a two part primary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var order1, getOrder1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder('test@gmail.com', '1')];
            case 1:
                order1 = _a.sent();
                return [4 /*yield*/, getOrder('test@gmail.com', order1.data.createOrder.createdAt)];
            case 2:
                getOrder1 = _a.sent();
                expect(getOrder1.data.getOrder.orderId).toEqual('1');
                return [2 /*return*/];
        }
    });
}); });
test('Test updateX with a two part primary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var order2, getOrder2, updateOrder2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder('test3@gmail.com', '2')];
            case 1:
                order2 = _a.sent();
                return [4 /*yield*/, getOrder('test3@gmail.com', order2.data.createOrder.createdAt)];
            case 2:
                getOrder2 = _a.sent();
                expect(getOrder2.data.getOrder.orderId).toEqual('2');
                return [4 /*yield*/, updateOrder('test3@gmail.com', order2.data.createOrder.createdAt, '3')];
            case 3:
                updateOrder2 = _a.sent();
                expect(updateOrder2.data.updateOrder.orderId).toEqual('3');
                return [4 /*yield*/, getOrder('test3@gmail.com', order2.data.createOrder.createdAt)];
            case 4:
                getOrder2 = _a.sent();
                expect(getOrder2.data.getOrder.orderId).toEqual('3');
                return [2 /*return*/];
        }
    });
}); });
test('Test deleteX with a two part primary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var order2, getOrder2, delOrder2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder('test2@gmail.com', '2')];
            case 1:
                order2 = _a.sent();
                return [4 /*yield*/, getOrder('test2@gmail.com', order2.data.createOrder.createdAt)];
            case 2:
                getOrder2 = _a.sent();
                expect(getOrder2.data.getOrder.orderId).toEqual('2');
                return [4 /*yield*/, deleteOrder('test2@gmail.com', order2.data.createOrder.createdAt)];
            case 3:
                delOrder2 = _a.sent();
                expect(delOrder2.data.deleteOrder.orderId).toEqual('2');
                return [4 /*yield*/, getOrder('test2@gmail.com', order2.data.createOrder.createdAt)];
            case 4:
                getOrder2 = _a.sent();
                expect(getOrder2.data.getOrder).toBeNull();
                return [2 /*return*/];
        }
    });
}); });
test('Test getX with a three part primary key', function () { return __awaiter(void 0, void 0, void 0, function () {
    var item1, getItem1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createItem('1', 'PENDING', 'item1')];
            case 1:
                item1 = _a.sent();
                return [4 /*yield*/, getItem('1', 'PENDING', item1.data.createItem.createdAt)];
            case 2:
                getItem1 = _a.sent();
                expect(getItem1.data.getItem.orderId).toEqual('1');
                expect(getItem1.data.getItem.status).toEqual('PENDING');
                return [2 /*return*/];
        }
    });
}); });
test('Test updateX with a three part primary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var item2, getItem2, updateItem2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createItem('2', 'PENDING', 'item2')];
            case 1:
                item2 = _a.sent();
                return [4 /*yield*/, getItem('2', 'PENDING', item2.data.createItem.createdAt)];
            case 2:
                getItem2 = _a.sent();
                expect(getItem2.data.getItem.orderId).toEqual('2');
                return [4 /*yield*/, updateItem('2', 'PENDING', item2.data.createItem.createdAt, 'item2.1')];
            case 3:
                updateItem2 = _a.sent();
                expect(updateItem2.data.updateItem.name).toEqual('item2.1');
                return [4 /*yield*/, getItem('2', 'PENDING', item2.data.createItem.createdAt)];
            case 4:
                getItem2 = _a.sent();
                expect(getItem2.data.getItem.name).toEqual('item2.1');
                return [2 /*return*/];
        }
    });
}); });
test('Test deleteX with a three part primary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var item3, getItem3, delItem3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createItem('3', 'IN_TRANSIT', 'item3')];
            case 1:
                item3 = _a.sent();
                return [4 /*yield*/, getItem('3', 'IN_TRANSIT', item3.data.createItem.createdAt)];
            case 2:
                getItem3 = _a.sent();
                expect(getItem3.data.getItem.name).toEqual('item3');
                return [4 /*yield*/, deleteItem('3', 'IN_TRANSIT', item3.data.createItem.createdAt)];
            case 3:
                delItem3 = _a.sent();
                expect(delItem3.data.deleteItem.name).toEqual('item3');
                return [4 /*yield*/, getItem('3', 'IN_TRANSIT', item3.data.createItem.createdAt)];
            case 4:
                getItem3 = _a.sent();
                expect(getItem3.data.getItem).toBeNull();
                return [2 /*return*/];
        }
    });
}); });
test('Test listX with three part primary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var hashKey, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashKey = 'TEST_LIST_ID';
                return [4 /*yield*/, createItem(hashKey, 'IN_TRANSIT', 'list1', '2018-01-01T00:01:01.000Z')];
            case 1:
                _a.sent();
                return [4 /*yield*/, createItem(hashKey, 'PENDING', 'list2', '2018-06-01T00:01:01.000Z')];
            case 2:
                _a.sent();
                return [4 /*yield*/, createItem(hashKey, 'PENDING', 'item3', '2018-09-01T00:01:01.000Z')];
            case 3:
                _a.sent();
                return [4 /*yield*/, listItem(undefined)];
            case 4:
                items = _a.sent();
                expect(items.data.listItems.items.length).toBeGreaterThan(0);
                return [4 /*yield*/, listItem(hashKey)];
            case 5:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(3);
                return [4 /*yield*/, listItem(hashKey, { beginsWith: { status: 'PENDING' } })];
            case 6:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(2);
                return [4 /*yield*/, listItem(hashKey, { beginsWith: { status: 'IN_TRANSIT' } })];
            case 7:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, listItem(hashKey, { beginsWith: { status: 'PENDING', createdAt: '2018-09' } })];
            case 8:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, listItem(hashKey, { eq: { status: 'PENDING', createdAt: '2018-09-01T00:01:01.000Z' } })];
            case 9:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, listItem(hashKey, { between: [{ status: 'PENDING', createdAt: '2018-08-01' }, { status: 'PENDING', createdAt: '2018-10-01' }] })];
            case 10:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, listItem(hashKey, { gt: { status: 'PENDING', createdAt: '2018-08-1' } })];
            case 11:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, listItem(hashKey, { ge: { status: 'PENDING', createdAt: '2018-09-01T00:01:01.000Z' } })];
            case 12:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, listItem(hashKey, { lt: { status: 'IN_TRANSIT', createdAt: '2018-01-02' } })];
            case 13:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, listItem(hashKey, { le: { status: 'IN_TRANSIT', createdAt: '2018-01-01T00:01:01.000Z' } })];
            case 14:
                items = _a.sent();
                expect(items.data.listItems.items).toHaveLength(1);
                return [4 /*yield*/, deleteItem(hashKey, 'IN_TRANSIT', '2018-01-01T00:01:01.000Z')];
            case 15:
                _a.sent();
                return [4 /*yield*/, deleteItem(hashKey, 'PENDING', '2018-06-01T00:01:01.000Z')];
            case 16:
                _a.sent();
                return [4 /*yield*/, deleteItem(hashKey, 'PENDING', '2018-09-01T00:01:01.000Z')];
            case 17:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('Test query with three part secondary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var hashKey, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashKey = 'UNKNOWN';
                return [4 /*yield*/, createItem('order1', 'UNKNOWN', 'list1', '2018-01-01T00:01:01.000Z')];
            case 1:
                _a.sent();
                return [4 /*yield*/, createItem('order2', 'UNKNOWN', 'list2', '2018-06-01T00:01:01.000Z')];
            case 2:
                _a.sent();
                return [4 /*yield*/, createItem('order3', 'UNKNOWN', 'item3', '2018-09-01T00:01:01.000Z')];
            case 3:
                _a.sent();
                return [4 /*yield*/, itemsByStatus(undefined)];
            case 4:
                items = _a.sent();
                expect(items.data).toBeNull();
                expect(items.errors.length).toBeGreaterThan(0);
                return [4 /*yield*/, itemsByStatus(hashKey)];
            case 5:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(3);
                return [4 /*yield*/, itemsByStatus(hashKey, { beginsWith: '2018-09' })];
            case 6:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(1);
                return [4 /*yield*/, itemsByStatus(hashKey, { eq: '2018-09-01T00:01:01.000Z' })];
            case 7:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(1);
                return [4 /*yield*/, itemsByStatus(hashKey, { between: ['2018-08-01', '2018-10-01'] })];
            case 8:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(1);
                return [4 /*yield*/, itemsByStatus(hashKey, { gt: '2018-08-01' })];
            case 9:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(1);
                return [4 /*yield*/, itemsByStatus(hashKey, { ge: '2018-09-01' })];
            case 10:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(1);
                return [4 /*yield*/, itemsByStatus(hashKey, { lt: '2018-07-01' })];
            case 11:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(2);
                return [4 /*yield*/, itemsByStatus(hashKey, { le: '2018-06-01' })];
            case 12:
                items = _a.sent();
                expect(items.data.itemsByStatus.items).toHaveLength(1);
                return [4 /*yield*/, itemsByStatus(undefined, { le: '2018-09-01' })];
            case 13:
                items = _a.sent();
                expect(items.data).toBeNull();
                expect(items.errors.length).toBeGreaterThan(0);
                return [4 /*yield*/, deleteItem('order1', hashKey, '2018-01-01T00:01:01.000Z')];
            case 14:
                _a.sent();
                return [4 /*yield*/, deleteItem('order2', hashKey, '2018-06-01T00:01:01.000Z')];
            case 15:
                _a.sent();
                return [4 /*yield*/, deleteItem('order3', hashKey, '2018-09-01T00:01:01.000Z')];
            case 16:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('Test query with three part secondary key, where sort key is an enum.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var hashKey, sortKey, items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hashKey = '2018-06-01T00:01:01.000Z';
                sortKey = 'UNKNOWN';
                return [4 /*yield*/, createItem('order1', sortKey, 'list1', '2018-01-01T00:01:01.000Z')];
            case 1:
                _a.sent();
                return [4 /*yield*/, createItem('order2', sortKey, 'list2', hashKey)];
            case 2:
                _a.sent();
                return [4 /*yield*/, createItem('order3', sortKey, 'item3', '2018-09-01T00:01:01.000Z')];
            case 3:
                _a.sent();
                return [4 /*yield*/, itemsByCreatedAt(undefined)];
            case 4:
                items = _a.sent();
                expect(items.data).toBeNull();
                expect(items.errors.length).toBeGreaterThan(0);
                return [4 /*yield*/, itemsByCreatedAt(hashKey)];
            case 5:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
                return [4 /*yield*/, itemsByCreatedAt(hashKey, { beginsWith: sortKey })];
            case 6:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
                return [4 /*yield*/, itemsByCreatedAt(hashKey, { eq: sortKey })];
            case 7:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
                return [4 /*yield*/, itemsByCreatedAt(hashKey, { between: [sortKey, sortKey] })];
            case 8:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
                return [4 /*yield*/, itemsByCreatedAt(hashKey, { gt: sortKey })];
            case 9:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(0);
                return [4 /*yield*/, itemsByCreatedAt(hashKey, { ge: sortKey })];
            case 10:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
                return [4 /*yield*/, itemsByCreatedAt(hashKey, { lt: sortKey })];
            case 11:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(0);
                return [4 /*yield*/, itemsByCreatedAt(hashKey, { le: sortKey })];
            case 12:
                items = _a.sent();
                expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
                return [4 /*yield*/, itemsByCreatedAt(undefined, { le: sortKey })];
            case 13:
                items = _a.sent();
                expect(items.data).toBeNull();
                expect(items.errors.length).toBeGreaterThan(0);
                return [4 /*yield*/, deleteItem('order1', sortKey, '2018-01-01T00:01:01.000Z')];
            case 14:
                _a.sent();
                return [4 /*yield*/, deleteItem('order2', sortKey, hashKey)];
            case 15:
                _a.sent();
                return [4 /*yield*/, deleteItem('order3', sortKey, '2018-09-01T00:01:01.000Z')];
            case 16:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('Test update mutation validation with three part secondary key.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var items, item, itemsWithFilter, itemWithFilter, itemsWithUnknownFilter, updateResponseMissingLastSortKey, updateResponseMissingFirstSortKey, updateResponseMissingAllSortKeys, updateResponseMissingNoKeys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createShippingUpdate('order1', 'item1', 'PENDING', 'name1')];
            case 1:
                _a.sent();
                return [4 /*yield*/, getShippingUpdates('order1')];
            case 2:
                items = _a.sent();
                expect(items.data.shippingUpdates.items).toHaveLength(1);
                item = items.data.shippingUpdates.items[0];
                expect(item.name).toEqual('name1');
                return [4 /*yield*/, getShippingUpdatesWithNameFilter('order1', 'name1')];
            case 3:
                itemsWithFilter = _a.sent();
                expect(itemsWithFilter.data.shippingUpdates.items).toHaveLength(1);
                itemWithFilter = itemsWithFilter.data.shippingUpdates.items[0];
                expect(itemWithFilter.name).toEqual('name1');
                return [4 /*yield*/, getShippingUpdatesWithNameFilter('order1', 'unknownname')];
            case 4:
                itemsWithUnknownFilter = _a.sent();
                expect(itemsWithUnknownFilter.data.shippingUpdates.items).toHaveLength(0);
                return [4 /*yield*/, updateShippingUpdate({ id: item.id, orderId: 'order1', itemId: 'item1', name: 'name2' })];
            case 5:
                updateResponseMissingLastSortKey = _a.sent();
                expect(updateResponseMissingLastSortKey.data.updateShippingUpdate).toBeNull();
                expect(updateResponseMissingLastSortKey.errors).toHaveLength(1);
                return [4 /*yield*/, updateShippingUpdate({ id: item.id, orderId: 'order1', status: 'PENDING', name: 'name3' })];
            case 6:
                updateResponseMissingFirstSortKey = _a.sent();
                expect(updateResponseMissingFirstSortKey.data.updateShippingUpdate).toBeNull();
                expect(updateResponseMissingFirstSortKey.errors).toHaveLength(1);
                return [4 /*yield*/, updateShippingUpdate({ id: item.id, orderId: 'order1', name: 'testing' })];
            case 7:
                updateResponseMissingAllSortKeys = _a.sent();
                expect(updateResponseMissingAllSortKeys.data.updateShippingUpdate.name).toEqual('testing');
                return [4 /*yield*/, updateShippingUpdate({ id: item.id, orderId: 'order1', itemId: 'item1', status: 'PENDING', name: 'testing2' })];
            case 8:
                updateResponseMissingNoKeys = _a.sent();
                expect(updateResponseMissingNoKeys.data.updateShippingUpdate.name).toEqual('testing2');
                return [2 /*return*/];
        }
    });
}); });
test('Test Customer Create with list member and secondary key', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createCustomer1, getCustomer1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createCustomer("customer1@email.com", ["thing1", "thing2"], "customerusr1")];
            case 1:
                createCustomer1 = _a.sent();
                return [4 /*yield*/, getCustomer("customer1@email.com")];
            case 2:
                getCustomer1 = _a.sent();
                expect(getCustomer1.data.getCustomer.addresslist).toEqual(["thing1", "thing2"]);
                return [2 /*return*/];
        }
    });
}); });
test('Test Customer Mutation with list member', function () { return __awaiter(void 0, void 0, void 0, function () {
    var updateCustomer1, getCustomer1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, updateCustomer("customer1@email.com", ["thing3", "thing4"], "new_customerusr1")];
            case 1:
                updateCustomer1 = _a.sent();
                return [4 /*yield*/, getCustomer("customer1@email.com")];
            case 2:
                getCustomer1 = _a.sent();
                expect(getCustomer1.data.getCustomer.addresslist).toEqual(["thing3", "thing4"]);
                return [2 /*return*/];
        }
    });
}); });
test('Test @key directive with customer sortDirection', function () { return __awaiter(void 0, void 0, void 0, function () {
    var newOrders, oldOrders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createOrder('testorder1@email.com', '1', '2016-03-10')];
            case 1:
                _a.sent();
                return [4 /*yield*/, createOrder('testorder1@email.com', '2', '2018-05-22')];
            case 2:
                _a.sent();
                return [4 /*yield*/, createOrder('testorder1@email.com', '3', '2019-06-27')];
            case 3:
                _a.sent();
                return [4 /*yield*/, listOrders('testorder1@email.com', { beginsWith: "201" }, "DESC")];
            case 4:
                newOrders = _a.sent();
                return [4 /*yield*/, listOrders('testorder1@email.com', { beginsWith: "201" }, "ASC")];
            case 5:
                oldOrders = _a.sent();
                expect(newOrders.data.listOrders.items[0].createdAt).toEqual('2019-06-27');
                expect(newOrders.data.listOrders.items[0].orderId).toEqual('3');
                expect(oldOrders.data.listOrders.items[0].createdAt).toEqual('2016-03-10');
                expect(oldOrders.data.listOrders.items[0].orderId).toEqual('1');
                return [2 /*return*/];
        }
    });
}); });
// orderId: string, itemId: string, status: string, name?: string
// DELIVERED IN_TRANSIT PENDING UNKNOWN
// (orderId: string, itemId: string, sortDirection: string)
test('Test @key directive with sortDirection on GSI', function () { return __awaiter(void 0, void 0, void 0, function () {
    var newShippingUpdates, oldShippingUpdates;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createShippingUpdate("order1", "product1", "PENDING", "order1Name1")];
            case 1:
                _a.sent();
                return [4 /*yield*/, createShippingUpdate("order1", "product2", "IN_TRANSIT", "order1Name2")];
            case 2:
                _a.sent();
                return [4 /*yield*/, createShippingUpdate("order1", "product3", "DELIVERED", "order1Name3")];
            case 3:
                _a.sent();
                return [4 /*yield*/, createShippingUpdate("order1", "product4", "DELIVERED", "order1Name4")];
            case 4:
                _a.sent();
                return [4 /*yield*/, listGSIShippingUpdate('order1', { beginsWith: { itemId: 'product' } }, 'DESC')];
            case 5:
                newShippingUpdates = _a.sent();
                return [4 /*yield*/, listGSIShippingUpdate('order1', { beginsWith: { itemId: 'product' } }, 'ASC')];
            case 6:
                oldShippingUpdates = _a.sent();
                expect(oldShippingUpdates.data.shippingUpdates.items[0].status).toEqual('PENDING');
                expect(oldShippingUpdates.data.shippingUpdates.items[0].name).toEqual('testing2');
                expect(newShippingUpdates.data.shippingUpdates.items[0].status).toEqual('DELIVERED');
                expect(newShippingUpdates.data.shippingUpdates.items[0].name).toEqual('order1Name4');
                return [2 /*return*/];
        }
    });
}); });
function createCustomer(email, addresslist, username) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation CreateCustomer($input: CreateCustomerInput!) {\n        createCustomer(input: $input) {\n            email\n            addresslist\n            username\n        }\n    }", {
                        input: { email: email, addresslist: addresslist, username: username }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function updateCustomer(email, addresslist, username) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation UpdateCustomer($input: UpdateCustomerInput!) {\n        updateCustomer(input: $input) {\n            email\n            addresslist\n            username\n        }\n    }", {
                        input: { email: email, addresslist: addresslist, username: username }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function getCustomer(email) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query GetCustomer($email: String!) {\n        getCustomer(email: $email) {\n            email\n            addresslist\n            username\n        }\n    }", {
                        email: email
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function createOrder(customerEmail, orderId, createdAt) {
    if (createdAt === void 0) { createdAt = new Date().toISOString(); }
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation CreateOrder($input: CreateOrderInput!) {\n        createOrder(input: $input) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", {
                        input: { customerEmail: customerEmail, orderId: orderId, createdAt: createdAt }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function updateOrder(customerEmail, createdAt, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation UpdateOrder($input: UpdateOrderInput!) {\n        updateOrder(input: $input) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", {
                        input: { customerEmail: customerEmail, orderId: orderId, createdAt: createdAt }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function deleteOrder(customerEmail, createdAt) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation DeleteOrder($input: DeleteOrderInput!) {\n        deleteOrder(input: $input) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", {
                        input: { customerEmail: customerEmail, createdAt: createdAt }
                    })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function getOrder(customerEmail, createdAt) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query GetOrder($customerEmail: String!, $createdAt: String!) {\n        getOrder(customerEmail: $customerEmail, createdAt: $createdAt) {\n            customerEmail\n            orderId\n            createdAt\n        }\n    }", { customerEmail: customerEmail, createdAt: createdAt })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function listOrders(customerEmail, createdAt, sortDirection) {
    return __awaiter(this, void 0, void 0, function () {
        var input, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = { customerEmail: customerEmail, createdAt: createdAt, sortDirection: sortDirection };
                    return [4 /*yield*/, GRAPHQL_CLIENT.query("query ListOrders(\n        $customerEmail: String, $createdAt: ModelStringKeyConditionInput, $sortDirection: ModelSortDirection) {\n            listOrders(customerEmail: $customerEmail, createdAt: $createdAt, sortDirection: $sortDirection) {\n                items {\n                    orderId\n                    customerEmail\n                    createdAt\n                }\n            }\n        }", input)];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function createItem(orderId, status, name, createdAt) {
    if (createdAt === void 0) { createdAt = new Date().toISOString(); }
    return __awaiter(this, void 0, void 0, function () {
        var input, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = { status: status, orderId: orderId, name: name, createdAt: createdAt };
                    return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation CreateItem($input: CreateItemInput!) {\n        createItem(input: $input) {\n            orderId\n            status\n            createdAt\n            name\n        }\n    }", {
                            input: input
                        })];
                case 1:
                    result = _a.sent();
                    console.log("Running create: " + JSON.stringify(input));
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function updateItem(orderId, status, createdAt, name) {
    return __awaiter(this, void 0, void 0, function () {
        var input, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = { status: status, orderId: orderId, createdAt: createdAt, name: name };
                    return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation UpdateItem($input: UpdateItemInput!) {\n        updateItem(input: $input) {\n            orderId\n            status\n            createdAt\n            name\n        }\n    }", {
                            input: input
                        })];
                case 1:
                    result = _a.sent();
                    console.log("Running create: " + JSON.stringify(input));
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function deleteItem(orderId, status, createdAt) {
    return __awaiter(this, void 0, void 0, function () {
        var input, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = { orderId: orderId, status: status, createdAt: createdAt };
                    return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation DeleteItem($input: DeleteItemInput!) {\n        deleteItem(input: $input) {\n            orderId\n            status\n            createdAt\n            name\n        }\n    }", {
                            input: input
                        })];
                case 1:
                    result = _a.sent();
                    console.log("Running delete: " + JSON.stringify(input));
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function getItem(orderId, status, createdAt) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query GetItem($orderId: ID!, $status: Status!, $createdAt: AWSDateTime!) {\n        getItem(orderId: $orderId, status: $status, createdAt: $createdAt) {\n            orderId\n            status\n            createdAt\n            name\n        }\n    }", { orderId: orderId, status: status, createdAt: createdAt })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function listItem(orderId, statusCreatedAt, limit, nextToken) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query ListItems(\n        $orderId: ID, $statusCreatedAt: ModelItemPrimaryCompositeKeyConditionInput, $limit: Int, $nextToken: String) {\n        listItems(orderId: $orderId, statusCreatedAt: $statusCreatedAt, limit: $limit, nextToken: $nextToken) {\n            items {\n                orderId\n                status\n                createdAt\n                name\n            }\n            nextToken\n        }\n    }", { orderId: orderId, statusCreatedAt: statusCreatedAt, limit: limit, nextToken: nextToken })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function itemsByStatus(status, createdAt, limit, nextToken) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query ListByStatus(\n        $status: Status!, $createdAt: ModelStringKeyConditionInput, $limit: Int, $nextToken: String) {\n        itemsByStatus(status: $status, createdAt: $createdAt, limit: $limit, nextToken: $nextToken) {\n            items {\n                orderId\n                status\n                createdAt\n                name\n            }\n            nextToken\n        }\n    }", { status: status, createdAt: createdAt, limit: limit, nextToken: nextToken })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function itemsByCreatedAt(createdAt, status, limit, nextToken) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query ListByCreatedAt(\n        $createdAt: AWSDateTime!, $status: ModelStringKeyConditionInput, $limit: Int, $nextToken: String) {\n        itemsByCreatedAt(createdAt: $createdAt, status: $status, limit: $limit, nextToken: $nextToken) {\n            items {\n                orderId\n                status\n                createdAt\n                name\n            }\n            nextToken\n        }\n    }", { createdAt: createdAt, status: status, limit: limit, nextToken: nextToken })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function createShippingUpdate(orderId, itemId, status, name) {
    return __awaiter(this, void 0, void 0, function () {
        var input, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = { status: status, orderId: orderId, itemId: itemId, name: name };
                    return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation CreateShippingUpdate($input: CreateShippingUpdateInput!) {\n        createShippingUpdate(input: $input) {\n            orderId\n            status\n            itemId\n            name\n            id\n        }\n    }", {
                            input: input
                        })];
                case 1:
                    result = _a.sent();
                    console.log("Running create: " + JSON.stringify(input));
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function listGSIShippingUpdate(orderId, itemId, sortDirection) {
    return __awaiter(this, void 0, void 0, function () {
        var input, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = { orderId: orderId, itemId: itemId, sortDirection: sortDirection };
                    return [4 /*yield*/, GRAPHQL_CLIENT.query("query queryGSI(\n        $orderId: ID,\n        $itemIdStatus: ModelShippingUpdateByOrderItemStatusCompositeKeyConditionInput,\n        $sortDirection:  ModelSortDirection) {\n            shippingUpdates(\n                orderId: $orderId,\n                itemIdStatus: $itemIdStatus,\n                sortDirection: $sortDirection) {\n                items {\n                    orderId\n                    name\n                    status\n                }\n            }\n        }", input)];
                case 1:
                    result = _a.sent();
                    console.log("Running create: " + JSON.stringify(input));
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function updateShippingUpdate(input) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("mutation UpdateShippingUpdate($input: UpdateShippingUpdateInput!) {\n        updateShippingUpdate(input: $input) {\n            orderId\n            status\n            itemId\n            name\n            id\n        }\n    }", {
                        input: input
                    })];
                case 1:
                    result = _a.sent();
                    console.log("Running update: " + JSON.stringify(input));
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function getShippingUpdates(orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query GetShippingUpdates($orderId: ID!) {\n        shippingUpdates(orderId: $orderId) {\n            items {\n                id\n                orderId\n                status\n                itemId\n                name\n            }\n            nextToken\n        }\n    }", { orderId: orderId })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
function getShippingUpdatesWithNameFilter(orderId, name) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query GetShippingUpdates($orderId: ID!, $name: String) {\n        shippingUpdates(orderId: $orderId, filter: { name: { eq: $name }}) {\n            items {\n                id\n                orderId\n                status\n                itemId\n                name\n            }\n            nextToken\n        }\n    }", { orderId: orderId, name: name })];
                case 1:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 4));
                    return [2 /*return*/, result];
            }
        });
    });
}
//# sourceMappingURL=KeyTransformer.e2e.test.js.map