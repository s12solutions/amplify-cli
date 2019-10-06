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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const graphql_key_transformer_1 = require("graphql-key-transformer");
const graphql_transformer_core_1 = require("graphql-transformer-core");
const graphql_client_1 = require("./utils/graphql-client");
const index_1 = require("./utils/index");
jest.setTimeout(2000000);
let GRAPHQL_ENDPOINT = undefined;
let GRAPHQL_CLIENT = undefined;
let ddbEmulator = null;
let dbPath = null;
let server;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const validSchema = `
    type Order @model @key(fields: ["customerEmail", "createdAt"]) {
        customerEmail: String!
        createdAt: String!
        orderId: ID!
    }
    type Customer @model @key(fields: ["email"]) {
        email: String!
        addresslist:  [String]
        username: String
    }
    type Item @model
        @key(fields: ["orderId", "status", "createdAt"])
        @key(name: "ByStatus", fields: ["status", "createdAt"], queryField: "itemsByStatus")
        @key(name: "ByCreatedAt", fields: ["createdAt", "status"], queryField: "itemsByCreatedAt")
    {
        orderId: ID!
        status: Status!
        createdAt: AWSDateTime!
        name: String!
    }
    enum Status {
        DELIVERED IN_TRANSIT PENDING UNKNOWN
    }
    type ShippingUpdate @model
        @key(name: "ByOrderItemStatus", fields: ["orderId", "itemId", "status"], queryField: "shippingUpdates")
    {
        id: ID!
        orderId: ID
        itemId: ID
        status: Status
        name: String
    }
    `;
    const transformer = new graphql_transformer_core_1.default({
        transformers: [new graphql_dynamodb_transformer_1.default(), new graphql_key_transformer_1.default()],
    });
    const out = transformer.transform(validSchema);
    let ddbClient;
    ({ dbPath, emulator: ddbEmulator, client: ddbClient } = yield index_1.launchDDBLocal());
    const result = yield index_1.deploy(out, ddbClient);
    server = result.simulator;
    GRAPHQL_ENDPOINT = server.url + '/graphql';
    index_1.logDebug(`Using graphql url: ${GRAPHQL_ENDPOINT}`);
    const apiKey = result.config.appSync.apiKey;
    index_1.logDebug(apiKey);
    GRAPHQL_CLIENT = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, { 'x-api-key': apiKey });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    if (server) {
        yield server.stop();
    }
    yield index_1.terminateDDB(ddbEmulator, dbPath);
}));
/**
 * Test queries below
 */
test('Test getX with a two part primary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    const order1 = yield createOrder('test@gmail.com', '1');
    const getOrder1 = yield getOrder('test@gmail.com', order1.data.createOrder.createdAt);
    expect(getOrder1.data.getOrder.orderId).toEqual('1');
}));
test('Test updateX with a two part primary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    const order2 = yield createOrder('test3@gmail.com', '2');
    let getOrder2 = yield getOrder('test3@gmail.com', order2.data.createOrder.createdAt);
    expect(getOrder2.data.getOrder.orderId).toEqual('2');
    const updateOrder2 = yield updateOrder('test3@gmail.com', order2.data.createOrder.createdAt, '3');
    expect(updateOrder2.data.updateOrder.orderId).toEqual('3');
    getOrder2 = yield getOrder('test3@gmail.com', order2.data.createOrder.createdAt);
    expect(getOrder2.data.getOrder.orderId).toEqual('3');
}));
test('Test deleteX with a two part primary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    const order2 = yield createOrder('test2@gmail.com', '2');
    let getOrder2 = yield getOrder('test2@gmail.com', order2.data.createOrder.createdAt);
    expect(getOrder2.data.getOrder.orderId).toEqual('2');
    const delOrder2 = yield deleteOrder('test2@gmail.com', order2.data.createOrder.createdAt);
    expect(delOrder2.data.deleteOrder.orderId).toEqual('2');
    getOrder2 = yield getOrder('test2@gmail.com', order2.data.createOrder.createdAt);
    expect(getOrder2.data.getOrder).toBeNull();
}));
test('Test getX with a three part primary key', () => __awaiter(void 0, void 0, void 0, function* () {
    const item1 = yield createItem('1', 'PENDING', 'item1');
    const getItem1 = yield getItem('1', 'PENDING', item1.data.createItem.createdAt);
    expect(getItem1.data.getItem.orderId).toEqual('1');
    expect(getItem1.data.getItem.status).toEqual('PENDING');
}));
test('Test updateX with a three part primary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    const item2 = yield createItem('2', 'PENDING', 'item2');
    let getItem2 = yield getItem('2', 'PENDING', item2.data.createItem.createdAt);
    expect(getItem2.data.getItem.orderId).toEqual('2');
    const updateItem2 = yield updateItem('2', 'PENDING', item2.data.createItem.createdAt, 'item2.1');
    expect(updateItem2.data.updateItem.name).toEqual('item2.1');
    getItem2 = yield getItem('2', 'PENDING', item2.data.createItem.createdAt);
    expect(getItem2.data.getItem.name).toEqual('item2.1');
}));
test('Test deleteX with a three part primary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    const item3 = yield createItem('3', 'IN_TRANSIT', 'item3');
    let getItem3 = yield getItem('3', 'IN_TRANSIT', item3.data.createItem.createdAt);
    expect(getItem3.data.getItem.name).toEqual('item3');
    const delItem3 = yield deleteItem('3', 'IN_TRANSIT', item3.data.createItem.createdAt);
    expect(delItem3.data.deleteItem.name).toEqual('item3');
    getItem3 = yield getItem('3', 'IN_TRANSIT', item3.data.createItem.createdAt);
    expect(getItem3.data.getItem).toBeNull();
}));
test('Test listX with three part primary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    const hashKey = 'TEST_LIST_ID';
    yield createItem(hashKey, 'IN_TRANSIT', 'list1', '2018-01-01T00:01:01.000Z');
    yield createItem(hashKey, 'PENDING', 'list2', '2018-06-01T00:01:01.000Z');
    yield createItem(hashKey, 'PENDING', 'item3', '2018-09-01T00:01:01.000Z');
    let items = yield listItem(undefined);
    expect(items.data.listItems.items.length).toBeGreaterThan(0);
    items = yield listItem(hashKey);
    expect(items.data.listItems.items).toHaveLength(3);
    items = yield listItem(hashKey, { beginsWith: { status: 'PENDING' } });
    expect(items.data.listItems.items).toHaveLength(2);
    items = yield listItem(hashKey, { beginsWith: { status: 'IN_TRANSIT' } });
    expect(items.data.listItems.items).toHaveLength(1);
    items = yield listItem(hashKey, {
        beginsWith: { status: 'PENDING', createdAt: '2018-09' },
    });
    expect(items.data.listItems.items).toHaveLength(1);
    items = yield listItem(hashKey, {
        eq: { status: 'PENDING', createdAt: '2018-09-01T00:01:01.000Z' },
    });
    expect(items.data.listItems.items).toHaveLength(1);
    items = yield listItem(hashKey, {
        between: [
            { status: 'PENDING', createdAt: '2018-08-01' },
            { status: 'PENDING', createdAt: '2018-10-01' },
        ],
    });
    expect(items.data.listItems.items).toHaveLength(1);
    items = yield listItem(hashKey, {
        gt: { status: 'PENDING', createdAt: '2018-08-1' },
    });
    expect(items.data.listItems.items).toHaveLength(1);
    items = yield listItem(hashKey, {
        ge: { status: 'PENDING', createdAt: '2018-09-01T00:01:01.000Z' },
    });
    expect(items.data.listItems.items).toHaveLength(1);
    items = yield listItem(hashKey, {
        lt: { status: 'IN_TRANSIT', createdAt: '2018-01-02' },
    });
    expect(items.data.listItems.items).toHaveLength(1);
    items = yield listItem(hashKey, {
        le: { status: 'IN_TRANSIT', createdAt: '2018-01-01T00:01:01.000Z' },
    });
    expect(items.data.listItems.items).toHaveLength(1);
    yield deleteItem(hashKey, 'IN_TRANSIT', '2018-01-01T00:01:01.000Z');
    yield deleteItem(hashKey, 'PENDING', '2018-06-01T00:01:01.000Z');
    yield deleteItem(hashKey, 'PENDING', '2018-09-01T00:01:01.000Z');
}));
test('Test query with three part secondary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    const hashKey = 'UNKNOWN';
    yield createItem('order1', 'UNKNOWN', 'list1', '2018-01-01T00:01:01.000Z');
    yield createItem('order2', 'UNKNOWN', 'list2', '2018-06-01T00:01:01.000Z');
    yield createItem('order3', 'UNKNOWN', 'item3', '2018-09-01T00:01:01.000Z');
    let items = yield itemsByStatus(undefined);
    expect(items.data).toBeNull();
    expect(items.errors.length).toBeGreaterThan(0);
    items = yield itemsByStatus(hashKey);
    expect(items.data.itemsByStatus.items).toHaveLength(3);
    items = yield itemsByStatus(hashKey, { beginsWith: '2018-09' });
    expect(items.data.itemsByStatus.items).toHaveLength(1);
    items = yield itemsByStatus(hashKey, { eq: '2018-09-01T00:01:01.000Z' });
    expect(items.data.itemsByStatus.items).toHaveLength(1);
    items = yield itemsByStatus(hashKey, {
        between: ['2018-08-01', '2018-10-01'],
    });
    expect(items.data.itemsByStatus.items).toHaveLength(1);
    items = yield itemsByStatus(hashKey, { gt: '2018-08-01' });
    expect(items.data.itemsByStatus.items).toHaveLength(1);
    items = yield itemsByStatus(hashKey, { ge: '2018-09-01' });
    expect(items.data.itemsByStatus.items).toHaveLength(1);
    items = yield itemsByStatus(hashKey, { lt: '2018-07-01' });
    expect(items.data.itemsByStatus.items).toHaveLength(2);
    items = yield itemsByStatus(hashKey, { le: '2018-06-01' });
    expect(items.data.itemsByStatus.items).toHaveLength(1);
    items = yield itemsByStatus(undefined, { le: '2018-09-01' });
    expect(items.data).toBeNull();
    expect(items.errors.length).toBeGreaterThan(0);
    yield deleteItem('order1', hashKey, '2018-01-01T00:01:01.000Z');
    yield deleteItem('order2', hashKey, '2018-06-01T00:01:01.000Z');
    yield deleteItem('order3', hashKey, '2018-09-01T00:01:01.000Z');
}));
test('Test query with three part secondary key, where sort key is an enum.', () => __awaiter(void 0, void 0, void 0, function* () {
    const hashKey = '2018-06-01T00:01:01.000Z';
    const sortKey = 'UNKNOWN';
    yield createItem('order1', sortKey, 'list1', '2018-01-01T00:01:01.000Z');
    yield createItem('order2', sortKey, 'list2', hashKey);
    yield createItem('order3', sortKey, 'item3', '2018-09-01T00:01:01.000Z');
    let items = yield itemsByCreatedAt(undefined);
    expect(items.data).toBeNull();
    expect(items.errors.length).toBeGreaterThan(0);
    items = yield itemsByCreatedAt(hashKey);
    expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
    items = yield itemsByCreatedAt(hashKey, { beginsWith: sortKey });
    expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
    items = yield itemsByCreatedAt(hashKey, { eq: sortKey });
    expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
    items = yield itemsByCreatedAt(hashKey, { between: [sortKey, sortKey] });
    expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
    items = yield itemsByCreatedAt(hashKey, { gt: sortKey });
    expect(items.data.itemsByCreatedAt.items).toHaveLength(0);
    items = yield itemsByCreatedAt(hashKey, { ge: sortKey });
    expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
    items = yield itemsByCreatedAt(hashKey, { lt: sortKey });
    expect(items.data.itemsByCreatedAt.items).toHaveLength(0);
    items = yield itemsByCreatedAt(hashKey, { le: sortKey });
    expect(items.data.itemsByCreatedAt.items).toHaveLength(1);
    items = yield itemsByCreatedAt(undefined, { le: sortKey });
    expect(items.data).toBeNull();
    expect(items.errors.length).toBeGreaterThan(0);
    yield deleteItem('order1', sortKey, '2018-01-01T00:01:01.000Z');
    yield deleteItem('order2', sortKey, hashKey);
    yield deleteItem('order3', sortKey, '2018-09-01T00:01:01.000Z');
}));
test('Test update mutation validation with three part secondary key.', () => __awaiter(void 0, void 0, void 0, function* () {
    yield createShippingUpdate('order1', 'item1', 'PENDING', 'name1');
    const items = yield getShippingUpdates('order1');
    expect(items.data.shippingUpdates.items).toHaveLength(1);
    const item = items.data.shippingUpdates.items[0];
    expect(item.name).toEqual('name1');
    const itemsWithFilter = yield getShippingUpdatesWithNameFilter('order1', 'name1');
    expect(itemsWithFilter.data.shippingUpdates.items).toHaveLength(1);
    const itemWithFilter = itemsWithFilter.data.shippingUpdates.items[0];
    expect(itemWithFilter.name).toEqual('name1');
    const itemsWithUnknownFilter = yield getShippingUpdatesWithNameFilter('order1', 'unknownname');
    expect(itemsWithUnknownFilter.data.shippingUpdates.items).toHaveLength(0);
    const updateResponseMissingLastSortKey = yield updateShippingUpdate({
        id: item.id,
        orderId: 'order1',
        itemId: 'item1',
        name: 'name2',
    });
    expect(updateResponseMissingLastSortKey.data.updateShippingUpdate).toBeNull();
    expect(updateResponseMissingLastSortKey.errors).toHaveLength(1);
    const updateResponseMissingFirstSortKey = yield updateShippingUpdate({
        id: item.id,
        orderId: 'order1',
        status: 'PENDING',
        name: 'name3',
    });
    expect(updateResponseMissingFirstSortKey.data.updateShippingUpdate).toBeNull();
    expect(updateResponseMissingFirstSortKey.errors).toHaveLength(1);
    const updateResponseMissingAllSortKeys = yield updateShippingUpdate({
        id: item.id,
        orderId: 'order1',
        name: 'testing',
    });
    expect(updateResponseMissingAllSortKeys.data.updateShippingUpdate.name).toEqual('testing');
    const updateResponseMissingNoKeys = yield updateShippingUpdate({
        id: item.id,
        orderId: 'order1',
        itemId: 'item1',
        status: 'PENDING',
        name: 'testing2',
    });
    expect(updateResponseMissingNoKeys.data.updateShippingUpdate.name).toEqual('testing2');
}));
test('Test Customer Create with list member and secondary key', () => __awaiter(void 0, void 0, void 0, function* () {
    const createCustomer1 = yield createCustomer('customer1@email.com', ['thing1', 'thing2'], 'customerusr1');
    const getCustomer1 = yield getCustomer('customer1@email.com');
    expect(getCustomer1.data.getCustomer.addresslist).toEqual(['thing1', 'thing2']);
    // const items = await onCreateCustomer
}));
test('Test Customer Mutation with list member', () => __awaiter(void 0, void 0, void 0, function* () {
    const updateCustomer1 = yield updateCustomer('customer1@email.com', ['thing3', 'thing4'], 'new_customerusr1');
    const getCustomer1 = yield getCustomer('customer1@email.com');
    expect(getCustomer1.data.getCustomer.addresslist).toEqual(['thing3', 'thing4']);
}));
function createCustomer(email, addresslist, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`mutation CreateCustomer($input: CreateCustomerInput!) {
        createCustomer(input: $input) {
            email
            addresslist
            username
        }
    }`, {
            input: { email, addresslist, username },
        });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function updateCustomer(email, addresslist, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`mutation UpdateCustomer($input: UpdateCustomerInput!) {
        updateCustomer(input: $input) {
            email
            addresslist
            username
        }
    }`, {
            input: { email, addresslist, username },
        });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function getCustomer(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query GetCustomer($email: String!) {
        getCustomer(email: $email) {
            email
            addresslist
            username
        }
    }`, {
            email,
        });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function createOrder(customerEmail, orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
            customerEmail
            orderId
            createdAt
        }
    }`, {
            input: { customerEmail, orderId, createdAt: new Date().toISOString() },
        });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function updateOrder(customerEmail, createdAt, orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`mutation UpdateOrder($input: UpdateOrderInput!) {
        updateOrder(input: $input) {
            customerEmail
            orderId
            createdAt
        }
    }`, {
            input: { customerEmail, orderId, createdAt },
        });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function deleteOrder(customerEmail, createdAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`mutation DeleteOrder($input: DeleteOrderInput!) {
        deleteOrder(input: $input) {
            customerEmail
            orderId
            createdAt
        }
    }`, {
            input: { customerEmail, createdAt },
        });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function getOrder(customerEmail, createdAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query GetOrder($customerEmail: String!, $createdAt: String!) {
        getOrder(customerEmail: $customerEmail, createdAt: $createdAt) {
            customerEmail
            orderId
            createdAt
        }
    }`, { customerEmail, createdAt });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function createItem(orderId, status, name, createdAt = new Date().toISOString()) {
    return __awaiter(this, void 0, void 0, function* () {
        const input = { status, orderId, name, createdAt };
        const result = yield GRAPHQL_CLIENT.query(`mutation CreateItem($input: CreateItemInput!) {
        createItem(input: $input) {
            orderId
            status
            createdAt
            name
        }
    }`, {
            input,
        });
        index_1.logDebug(`Running create: ${JSON.stringify(input)}`);
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function updateItem(orderId, status, createdAt, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const input = { status, orderId, createdAt, name };
        const result = yield GRAPHQL_CLIENT.query(`mutation UpdateItem($input: UpdateItemInput!) {
        updateItem(input: $input) {
            orderId
            status
            createdAt
            name
        }
    }`, {
            input,
        });
        index_1.logDebug(`Running create: ${JSON.stringify(input)}`);
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function deleteItem(orderId, status, createdAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const input = { orderId, status, createdAt };
        const result = yield GRAPHQL_CLIENT.query(`mutation DeleteItem($input: DeleteItemInput!) {
        deleteItem(input: $input) {
            orderId
            status
            createdAt
            name
        }
    }`, {
            input,
        });
        index_1.logDebug(`Running delete: ${JSON.stringify(input)}`);
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function getItem(orderId, status, createdAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query GetItem($orderId: ID!, $status: Status!, $createdAt: AWSDateTime!) {
        getItem(orderId: $orderId, status: $status, createdAt: $createdAt) {
            orderId
            status
            createdAt
            name
        }
    }`, { orderId, status, createdAt });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function listItem(orderId, statusCreatedAt, limit, nextToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query ListItems($orderId: ID, $statusCreatedAt: ModelItemPrimaryCompositeKeyConditionInput, $limit: Int, $nextToken: String) {
        listItems(orderId: $orderId, statusCreatedAt: $statusCreatedAt, limit: $limit, nextToken: $nextToken) {
            items {
                orderId
                status
                createdAt
                name
            }
            nextToken
        }
    }`, { orderId, statusCreatedAt, limit, nextToken });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function itemsByStatus(status, createdAt, limit, nextToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query ListByStatus($status: Status!, $createdAt: ModelStringKeyConditionInput, $limit: Int, $nextToken: String) {
        itemsByStatus(status: $status, createdAt: $createdAt, limit: $limit, nextToken: $nextToken) {
            items {
                orderId
                status
                createdAt
                name
            }
            nextToken
        }
    }`, { status, createdAt, limit, nextToken });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function itemsByCreatedAt(createdAt, status, limit, nextToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query ListByCreatedAt($createdAt: AWSDateTime!, $status: ModelStringKeyConditionInput, $limit: Int, $nextToken: String) {
        itemsByCreatedAt(createdAt: $createdAt, status: $status, limit: $limit, nextToken: $nextToken) {
            items {
                orderId
                status
                createdAt
                name
            }
            nextToken
        }
    }`, { createdAt, status, limit, nextToken });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function createShippingUpdate(orderId, itemId, status, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const input = { status, orderId, itemId, name };
        const result = yield GRAPHQL_CLIENT.query(`mutation CreateShippingUpdate($input: CreateShippingUpdateInput!) {
        createShippingUpdate(input: $input) {
            orderId
            status
            itemId
            name
            id
        }
    }`, {
            input,
        });
        index_1.logDebug(`Running create: ${JSON.stringify(input)}`);
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function updateShippingUpdate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        // const input = { id, status, orderId, itemId, name };
        const result = yield GRAPHQL_CLIENT.query(`mutation UpdateShippingUpdate($input: UpdateShippingUpdateInput!) {
        updateShippingUpdate(input: $input) {
            orderId
            status
            itemId
            name
            id
        }
    }`, {
            input,
        });
        index_1.logDebug(`Running update: ${JSON.stringify(input)}`);
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function getShippingUpdates(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query GetShippingUpdates($orderId: ID!) {
        shippingUpdates(orderId: $orderId) {
            items {
                id
                orderId
                status
                itemId
                name
            }
            nextToken
        }
    }`, { orderId });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
function getShippingUpdatesWithNameFilter(orderId, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield GRAPHQL_CLIENT.query(`query GetShippingUpdates($orderId: ID!, $name: String) {
        shippingUpdates(orderId: $orderId, filter: { name: { eq: $name }}) {
            items {
                id
                orderId
                status
                itemId
                name
            }
            nextToken
        }
    }`, { orderId, name });
        index_1.logDebug(JSON.stringify(result, null, 4));
        return result;
    });
}
//# sourceMappingURL=key-transformer.e2e.test.js.map