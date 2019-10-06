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
const graphql_auth_transformer_1 = require("graphql-auth-transformer");
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const graphql_transformer_core_1 = require("graphql-transformer-core");
const cognito_utils_1 = require("./utils/cognito-utils");
const graphql_client_1 = require("./utils/graphql-client");
const index_1 = require("./utils/index");
jest.setTimeout(2000000);
global.fetch = require('node-fetch');
let GRAPHQL_ENDPOINT = undefined;
let ddbEmulator = null;
let dbPath = null;
let server;
/**
 * Client 1 is logged in and is a member of the Admin group.
 */
let GRAPHQL_CLIENT_1 = undefined;
/**
 * Client 1 is logged in and is a member of the Admin group via an access token.
 */
let GRAPHQL_CLIENT_1_ACCESS = undefined;
/**
 * Client 2 is logged in and is a member of the Devs group.
 */
let GRAPHQL_CLIENT_2 = undefined;
/**
 * Client 3 is logged in and has no group memberships.
 */
let GRAPHQL_CLIENT_3 = undefined;
const USER_POOL_ID = 'fake_user_pool';
const USERNAME1 = 'user1@test.com';
const USERNAME2 = 'user2@test.com';
const USERNAME3 = 'user3@test.com';
const ADMIN_GROUP_NAME = 'Admin';
const DEVS_GROUP_NAME = 'Devs';
const PARTICIPANT_GROUP_NAME = 'Participant';
const WATCHER_GROUP_NAME = 'Watcher';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Create a stack for the post model with auth enabled.
    const validSchema = `
    type Post @model @auth(rules: [{ allow: owner }]) {
        id: ID!
        title: String!
        createdAt: String
        updatedAt: String
        owner: String
    }
    type Salary @model @auth(
        rules: [
            {allow: owner},
            {allow: groups, groups: ["Admin"]}
        ]
    ) {
        id: ID!
        wage: Int
        owner: String
    }
    type AdminNote @model @auth(
        rules: [
            {allow: groups, groups: ["Admin"]}
        ]
    ) {
        id: ID!
        content: String!
    }
    type ManyGroupProtected @model @auth(rules: [{allow: groups, groupsField: "groups"}]) {
        id: ID!
        value: Int
        groups: [String]
    }
    type SingleGroupProtected @model @auth(rules: [{allow: groups, groupsField: "group"}]) {
        id: ID!
        value: Int
        group: String
    }
    type PWProtected
        @auth(rules: [
            {allow: groups, groupsField: "participants", mutations: [update, delete], queries: [get, list]},
            {allow: groups, groupsField: "watchers", mutations: [], queries: [get, list]}
        ])
        @model
    {
        id: ID!
        content: String!
        participants: String
        watchers: String
    }
    type AllThree
        @auth(rules: [
            {allow: owner, identityField: "username" },
            {allow: owner, ownerField: "editors", identityField: "cognito:username" },
            {allow: groups, groups: ["Admin"]},
            {allow: groups, groups: ["Execs"]},
            {allow: groups, groupsField: "groups"},
            {allow: groups, groupsField: "alternativeGroup"}
        ])
        @model
    {
        id: ID!
        owner: String
        editors: [String]
        groups: [String]
        alternativeGroup: String
    }
    # The owner should always start with https://cognito-idp
    type TestIdentity @model @auth(rules: [{ allow: owner, identityField: "iss" }]) {
        id: ID!
        title: String!
        owner: String
    }
    type OwnerReadProtected @model @auth(rules: [{ allow: owner, operations: [read] }]) {
        id: ID!
        content: String
        owner: String
    }
    type OwnerCreateUpdateDeleteProtected @model @auth(rules: [{ allow: owner, operations: [create, update, delete] }]) {
        id: ID!
        content: String
        owner: String
    }
    `;
    const transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_auth_transformer_1.default({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
                    },
                    additionalAuthenticationProviders: [],
                },
            }),
        ],
    });
    try {
        const out = transformer.transform(validSchema);
        let ddbClient;
        ({ dbPath, emulator: ddbEmulator, client: ddbClient } = yield index_1.launchDDBLocal());
        const result = yield index_1.deploy(out, ddbClient);
        server = result.simulator;
        GRAPHQL_ENDPOINT = server.url + '/graphql';
        index_1.logDebug(`Using graphql url: ${GRAPHQL_ENDPOINT}`);
        const apiKey = result.config.appSync.apiKey;
        const idToken = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME1, USERNAME1, [
            ADMIN_GROUP_NAME,
            PARTICIPANT_GROUP_NAME,
            WATCHER_GROUP_NAME,
        ]);
        GRAPHQL_CLIENT_1 = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, {
            Authorization: idToken,
        });
        const accessToken = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME1, USERNAME1, [ADMIN_GROUP_NAME, PARTICIPANT_GROUP_NAME, WATCHER_GROUP_NAME], 'access');
        GRAPHQL_CLIENT_1_ACCESS = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, {
            Authorization: accessToken,
        });
        const idToken2 = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME2, USERNAME2, [
            DEVS_GROUP_NAME,
        ]);
        GRAPHQL_CLIENT_2 = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, {
            Authorization: idToken2,
        });
        const idToken3 = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME2, USERNAME3, []);
        GRAPHQL_CLIENT_3 = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, {
            Authorization: idToken3,
        });
        // Wait for any propagation to avoid random
        // "The security token included in the request is invalid" errors
        yield new Promise(res => setTimeout(() => res(), 5000));
    }
    catch (e) {
        console.error(e);
        expect(true).toEqual(false);
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (server) {
            yield server.stop();
        }
        yield index_1.terminateDDB(ddbEmulator, dbPath);
    }
    catch (e) {
        console.error(e);
        expect(true).toEqual(false);
    }
}));
/**
 * Test queries below
 */
test('Test createPost mutation', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    index_1.logDebug(response);
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.createdAt).toBeDefined();
    expect(response.data.createPost.updatedAt).toBeDefined();
    expect(response.data.createPost.owner).toEqual(USERNAME1);
    index_1.logDebug('Using access token based client\n');
    const response2 = yield GRAPHQL_CLIENT_1_ACCESS.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    index_1.logDebug(response2);
    expect(response2.data.createPost.id).toBeDefined();
    expect(response2.data.createPost.title).toEqual('Hello, World!');
    expect(response2.data.createPost.createdAt).toBeDefined();
    expect(response2.data.createPost.updatedAt).toBeDefined();
    expect(response2.data.createPost.owner).toEqual(USERNAME1);
}));
test('Test getPost query when authorized', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    index_1.logDebug(response);
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.createdAt).toBeDefined();
    expect(response.data.createPost.updatedAt).toBeDefined();
    expect(response.data.createPost.owner).toEqual(USERNAME1);
    const getResponse = yield GRAPHQL_CLIENT_1.query(`query {
        getPost(id: "${response.data.createPost.id}") {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    index_1.logDebug(getResponse);
    expect(getResponse.data.getPost.id).toBeDefined();
    expect(getResponse.data.getPost.title).toEqual('Hello, World!');
    expect(getResponse.data.getPost.createdAt).toBeDefined();
    expect(getResponse.data.getPost.updatedAt).toBeDefined();
    expect(getResponse.data.getPost.owner).toEqual(USERNAME1);
    const getResponseAccess = yield GRAPHQL_CLIENT_1_ACCESS.query(`query {
        getPost(id: "${response.data.createPost.id}") {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(getResponseAccess.data.getPost.id).toBeDefined();
    expect(getResponseAccess.data.getPost.title).toEqual('Hello, World!');
    expect(getResponseAccess.data.getPost.createdAt).toBeDefined();
    expect(getResponseAccess.data.getPost.updatedAt).toBeDefined();
    expect(getResponseAccess.data.getPost.owner).toEqual(USERNAME1);
}));
test('Test getPost query when not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.createdAt).toBeDefined();
    expect(response.data.createPost.updatedAt).toBeDefined();
    expect(response.data.createPost.owner).toBeDefined();
    const getResponse = yield GRAPHQL_CLIENT_2.query(`query {
        getPost(id: "${response.data.createPost.id}") {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(getResponse.data.getPost).toEqual(null);
    expect(getResponse.errors.length).toEqual(1);
    expect(getResponse.errors[0].errorType).toEqual('Unauthorized');
}));
test('Test updatePost mutation when authorized', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.createdAt).toBeDefined();
    expect(response.data.createPost.updatedAt).toBeDefined();
    expect(response.data.createPost.owner).toEqual(USERNAME1);
    const updateResponse = yield GRAPHQL_CLIENT_1.query(`mutation {
        updatePost(input: { id: "${response.data.createPost.id}", title: "Bye, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(updateResponse.data.updatePost.id).toEqual(response.data.createPost.id);
    expect(updateResponse.data.updatePost.title).toEqual('Bye, World!');
    expect(updateResponse.data.updatePost.updatedAt > response.data.createPost.updatedAt).toEqual(true);
    const updateResponseAccess = yield GRAPHQL_CLIENT_1_ACCESS.query(`mutation {
        updatePost(input: { id: "${response.data.createPost.id}", title: "Bye, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(updateResponseAccess.data.updatePost.id).toEqual(response.data.createPost.id);
    expect(updateResponseAccess.data.updatePost.title).toEqual('Bye, World!');
    expect(updateResponseAccess.data.updatePost.updatedAt > response.data.createPost.updatedAt).toEqual(true);
}));
test('Test updatePost mutation when not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.createdAt).toBeDefined();
    expect(response.data.createPost.updatedAt).toBeDefined();
    expect(response.data.createPost.owner).toBeDefined();
    const updateResponse = yield GRAPHQL_CLIENT_2.query(`mutation {
        updatePost(input: { id: "${response.data.createPost.id}", title: "Bye, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(updateResponse.data.updatePost).toEqual(null);
    expect(updateResponse.errors.length).toEqual(1);
    index_1.logDebug(updateResponse);
    expect(updateResponse.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
}));
test('Test deletePost mutation when authorized', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.createdAt).toBeDefined();
    expect(response.data.createPost.updatedAt).toBeDefined();
    expect(response.data.createPost.owner).toEqual(USERNAME1);
    const deleteResponse = yield GRAPHQL_CLIENT_1.query(`mutation {
        deletePost(input: { id: "${response.data.createPost.id}" }) {
            id
        }
    }`, {});
    expect(deleteResponse.data.deletePost.id).toEqual(response.data.createPost.id);
    const responseAccess = yield GRAPHQL_CLIENT_1_ACCESS.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(responseAccess.data.createPost.id).toBeDefined();
    expect(responseAccess.data.createPost.title).toEqual('Hello, World!');
    expect(responseAccess.data.createPost.createdAt).toBeDefined();
    expect(responseAccess.data.createPost.updatedAt).toBeDefined();
    expect(responseAccess.data.createPost.owner).toEqual(USERNAME1);
    const deleteResponseAccess = yield GRAPHQL_CLIENT_1_ACCESS.query(`mutation {
        deletePost(input: { id: "${responseAccess.data.createPost.id}" }) {
            id
        }
    }`, {});
    expect(deleteResponseAccess.data.deletePost.id).toEqual(responseAccess.data.createPost.id);
}));
test('Test deletePost mutation when not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "Hello, World!" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.createdAt).toBeDefined();
    expect(response.data.createPost.updatedAt).toBeDefined();
    expect(response.data.createPost.owner).toEqual(USERNAME1);
    const deleteResponse = yield GRAPHQL_CLIENT_2.query(`mutation {
        deletePost(input: { id: "${response.data.createPost.id}" }) {
            id
        }
    }`, {});
    expect(deleteResponse.data.deletePost).toEqual(null);
    expect(deleteResponse.errors.length).toEqual(1);
    expect(deleteResponse.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
}));
test('Test listPosts query when authorized', () => __awaiter(void 0, void 0, void 0, function* () {
    const firstPost = yield GRAPHQL_CLIENT_1.query(`mutation {
        createPost(input: { title: "testing list" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    expect(firstPost.data.createPost.id).toBeDefined();
    expect(firstPost.data.createPost.title).toEqual('testing list');
    expect(firstPost.data.createPost.createdAt).toBeDefined();
    expect(firstPost.data.createPost.updatedAt).toBeDefined();
    expect(firstPost.data.createPost.owner).toEqual(USERNAME1);
    const secondPost = yield GRAPHQL_CLIENT_2.query(`mutation {
        createPost(input: { title: "testing list" }) {
            id
            title
            createdAt
            updatedAt
            owner
        }
    }`, {});
    // There are two posts but only 1 created by me.
    const listResponse = yield GRAPHQL_CLIENT_1.query(`query {
        listPosts(filter: { title: { eq: "testing list" } }, limit: 25) {
            items {
                id
            }
        }
    }`, {});
    index_1.logDebug(JSON.stringify(listResponse, null, 4));
    expect(listResponse.data.listPosts.items.length).toEqual(1);
    const listResponseAccess = yield GRAPHQL_CLIENT_1_ACCESS.query(`query {
        listPosts(filter: { title: { eq: "testing list" } }, limit: 25) {
            items {
                id
            }
        }
    }`, {});
    index_1.logDebug(JSON.stringify(listResponseAccess, null, 4));
    expect(listResponseAccess.data.listPosts.items.length).toEqual(1);
}));
/**
 * Static Group Auth
 */
test(`Test createSalary w/ Admin group protection authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSalary(input: { wage: 10 }) {
            id
            wage
        }
    }
    `);
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(10);
}));
test(`Test update my own salary without admin permission`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createSalary(input: { wage: 10 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.wage).toEqual(10);
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateSalary(input: { id: "${req.data.createSalary.id}", wage: 14 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req2, null, 4));
    expect(req2.data.updateSalary.wage).toEqual(14);
}));
test(`Test updating someone else's salary as an admin`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createSalary(input: { wage: 11 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(11);
    const req2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        updateSalary(input: { id: "${req.data.createSalary.id}", wage: 12 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req2, null, 4));
    expect(req2.data.updateSalary.id).toEqual(req.data.createSalary.id);
    expect(req2.data.updateSalary.wage).toEqual(12);
}));
test(`Test updating someone else's salary when I am not admin.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSalary(input: { wage: 13 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(13);
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateSalary(input: { id: "${req.data.createSalary.id}", wage: 14 }) {
            id
            wage
        }
    }
    `);
    expect(req2.data.updateSalary).toEqual(null);
    expect(req2.errors.length).toEqual(1);
    expect(req2.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
}));
test(`Test deleteSalary w/ Admin group protection authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSalary(input: { wage: 15 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(15);
    const req2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        deleteSalary(input: { id: "${req.data.createSalary.id}" }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req2, null, 4));
    expect(req2.data.deleteSalary.id).toEqual(req.data.createSalary.id);
    expect(req2.data.deleteSalary.wage).toEqual(15);
}));
test(`Test deleteSalary w/ Admin group protection not authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSalary(input: { wage: 16 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(16);
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        deleteSalary(input: { id: "${req.data.createSalary.id}" }) {
            id
            wage
        }
    }
    `);
    expect(req2.data.deleteSalary).toEqual(null);
    expect(req2.errors.length).toEqual(1);
    expect(req2.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
}));
test(`Test and Admin can get a salary created by any user`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createSalary(input: { wage: 15 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(15);
    const req2 = yield GRAPHQL_CLIENT_1.query(`
    query {
        getSalary(id: "${req.data.createSalary.id}") {
            id
            wage
        }
    }
    `);
    expect(req2.data.getSalary.id).toEqual(req.data.createSalary.id);
    expect(req2.data.getSalary.wage).toEqual(15);
}));
test(`Test owner can create and get a salary when not admin`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createSalary(input: { wage: 15 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(15);
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    query {
        getSalary(id: "${req.data.createSalary.id}") {
            id
            wage
        }
    }
    `);
    expect(req2.data.getSalary.id).toEqual(req.data.createSalary.id);
    expect(req2.data.getSalary.wage).toEqual(15);
}));
test(`Test getSalary w/ Admin group protection not authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSalary(input: { wage: 16 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(16);
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    query {
        getSalary(id: "${req.data.createSalary.id}") {
            id
            wage
        }
    }
    `);
    expect(req2.data.getSalary).toEqual(null);
    expect(req2.errors.length).toEqual(1);
    expect(req2.errors[0].errorType).toEqual('Unauthorized');
}));
test(`Test listSalarys w/ Admin group protection authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSalary(input: { wage: 101 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(101);
    const req2 = yield GRAPHQL_CLIENT_1.query(`
    query {
        listSalarys(filter: { wage: { eq: 101 }}) {
            items {
                id
                wage
            }
        }
    }
    `);
    expect(req2.data.listSalarys.items.length).toEqual(1);
    expect(req2.data.listSalarys.items[0].id).toEqual(req.data.createSalary.id);
    expect(req2.data.listSalarys.items[0].wage).toEqual(101);
}));
test(`Test listSalarys w/ Admin group protection not authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSalary(input: { wage: 102 }) {
            id
            wage
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSalary.id).toBeDefined();
    expect(req.data.createSalary.wage).toEqual(102);
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    query {
        listSalarys(filter: { wage: { eq: 102 }}) {
            items {
                id
                wage
            }
        }
    }
    `);
    expect(req2.data.listSalarys.items).toEqual([]);
}));
/**
 * Dynamic Group Auth
 */
test(`Test createManyGroupProtected w/ dynamic group protection authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createManyGroupProtected(input: { value: 10, groups: ["Admin"] }) {
            id
            value
            groups
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createManyGroupProtected.id).toBeDefined();
    expect(req.data.createManyGroupProtected.value).toEqual(10);
    expect(req.data.createManyGroupProtected.groups).toEqual(['Admin']);
}));
test(`Test createManyGroupProtected w/ dynamic group protection when not authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createManyGroupProtected(input: { value: 10, groups: ["Admin"] }) {
            id
            value
            groups
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createManyGroupProtected).toEqual(null);
    expect(req.errors.length).toEqual(1);
    expect(req.errors[0].errorType).toEqual('Unauthorized');
}));
test(`Test createSingleGroupProtected w/ dynamic group protection authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createSingleGroupProtected(input: { value: 10, group: "Admin" }) {
            id
            value
            group
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSingleGroupProtected.id).toBeDefined();
    expect(req.data.createSingleGroupProtected.value).toEqual(10);
    expect(req.data.createSingleGroupProtected.group).toEqual('Admin');
}));
test(`Test createSingleGroupProtected w/ dynamic group protection when not authorized`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createSingleGroupProtected(input: { value: 10, group: "Admin" }) {
            id
            value
            group
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createSingleGroupProtected).toEqual(null);
    expect(req.errors.length).toEqual(1);
    expect(req.errors[0].errorType).toEqual('Unauthorized');
}));
test(`Test listPWProtecteds when the user is authorized.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createPWProtected(input: { content: "Foobie", participants: "${PARTICIPANT_GROUP_NAME}", watchers: "${WATCHER_GROUP_NAME}" }) {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createPWProtected).toBeTruthy();
    const uReq = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        updatePWProtected(input: { id: "${req.data.createPWProtected.id}", content: "Foobie2" }) {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(uReq, null, 4));
    expect(uReq.data.updatePWProtected).toBeTruthy();
    const req2 = yield GRAPHQL_CLIENT_1.query(`
    query {
        listPWProtecteds {
            items {
                id
                content
                participants
                watchers
            }
            nextToken
        }
    }
    `);
    expect(req2.data.listPWProtecteds.items.length).toEqual(1);
    expect(req2.data.listPWProtecteds.items[0].id).toEqual(req.data.createPWProtected.id);
    expect(req2.data.listPWProtecteds.items[0].content).toEqual('Foobie2');
    const req3 = yield GRAPHQL_CLIENT_1.query(`
    query {
        getPWProtected(id: "${req.data.createPWProtected.id}") {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req3, null, 4));
    expect(req3.data.getPWProtected).toBeTruthy();
    const dReq = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        deletePWProtected(input: { id: "${req.data.createPWProtected.id}" }) {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(dReq, null, 4));
    expect(dReq.data.deletePWProtected).toBeTruthy();
}));
test(`Test Protecteds when the user is not authorized.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createPWProtected(input: { content: "Barbie", participants: "${PARTICIPANT_GROUP_NAME}", watchers: "${WATCHER_GROUP_NAME}" }) {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createPWProtected).toBeTruthy();
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    query {
        listPWProtecteds {
            items {
                id
                content
                participants
                watchers
            }
            nextToken
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req2, null, 4));
    expect(req2.data.listPWProtecteds.items.length).toEqual(0);
    expect(req2.data.listPWProtecteds.nextToken).toBeNull();
    const uReq = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updatePWProtected(input: { id: "${req.data.createPWProtected.id}", content: "Foobie2" }) {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(uReq, null, 4));
    expect(uReq.data.updatePWProtected).toBeNull();
    const req3 = yield GRAPHQL_CLIENT_2.query(`
    query {
        getPWProtected(id: "${req.data.createPWProtected.id}") {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req3, null, 4));
    expect(req3.data.getPWProtected).toBeNull();
    const dReq = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        deletePWProtected(input: { id: "${req.data.createPWProtected.id}" }) {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(dReq, null, 4));
    expect(dReq.data.deletePWProtected).toBeNull();
    // The record should still exist after delete.
    const getReq = yield GRAPHQL_CLIENT_1.query(`
    query {
        getPWProtected(id: "${req.data.createPWProtected.id}") {
            id
            content
            participants
            watchers
        }
    }
    `);
    index_1.logDebug(JSON.stringify(getReq, null, 4));
    expect(getReq.data.getPWProtected).toBeTruthy();
}));
test(`Test creating, updating, and deleting an admin note as an admin`, () => __awaiter(void 0, void 0, void 0, function* () {
    const req = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAdminNote(input: { content: "Hello" }) {
            id
            content
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.data.createAdminNote.id).toBeDefined();
    expect(req.data.createAdminNote.content).toEqual('Hello');
    const req2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        updateAdminNote(input: { id: "${req.data.createAdminNote.id}", content: "Hello 2" }) {
            id
            content
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req2, null, 4));
    expect(req2.data.updateAdminNote.id).toEqual(req.data.createAdminNote.id);
    expect(req2.data.updateAdminNote.content).toEqual('Hello 2');
    const req3 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        deleteAdminNote(input: { id: "${req.data.createAdminNote.id}" }) {
            id
            content
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req3, null, 4));
    expect(req3.data.deleteAdminNote.id).toEqual(req.data.createAdminNote.id);
    expect(req3.data.deleteAdminNote.content).toEqual('Hello 2');
}));
test(`Test creating, updating, and deleting an admin note as a non admin`, () => __awaiter(void 0, void 0, void 0, function* () {
    const adminReq = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAdminNote(input: { content: "Hello" }) {
            id
            content
        }
    }
    `);
    index_1.logDebug(JSON.stringify(adminReq, null, 4));
    expect(adminReq.data.createAdminNote.id).toBeDefined();
    expect(adminReq.data.createAdminNote.content).toEqual('Hello');
    const req = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAdminNote(input: { content: "Hello" }) {
            id
            content
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req, null, 4));
    expect(req.errors.length).toEqual(1);
    expect(req.errors[0].errorType).toEqual('Unauthorized');
    const req2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateAdminNote(input: { id: "${adminReq.data.createAdminNote.id}", content: "Hello 2" }) {
            id
            content
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req2, null, 4));
    expect(req2.errors.length).toEqual(1);
    expect(req2.errors[0].errorType).toEqual('Unauthorized');
    const req3 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        deleteAdminNote(input: { id: "${adminReq.data.createAdminNote.id}" }) {
            id
            content
        }
    }
    `);
    index_1.logDebug(JSON.stringify(req3, null, 4));
    expect(req3.errors.length).toEqual(1);
    expect(req3.errors[0].errorType).toEqual('Unauthorized');
}));
/**
 * Get Query Tests
 */
test(`Test getAllThree as admin.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    const fetchOwnedBy2AsAdmin = yield GRAPHQL_CLIENT_1.query(`
    query {
        getAllThree(id: "${ownedBy2.data.createAllThree.id}") {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedBy2AsAdmin, null, 4));
    expect(fetchOwnedBy2AsAdmin.data.getAllThree).toBeTruthy();
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test getAllThree as owner.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    const fetchOwnedBy2AsOwner = yield GRAPHQL_CLIENT_2.query(`
    query {
        getAllThree(id: "${ownedBy2.data.createAllThree.id}") {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedBy2AsOwner, null, 4));
    expect(fetchOwnedBy2AsOwner.data.getAllThree).toBeTruthy();
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test getAllThree as one of a set of editors.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            editors: ["user2@test.com"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    const fetchOwnedBy2AsEditor = yield GRAPHQL_CLIENT_2.query(`
    query {
        getAllThree(id: "${ownedBy2.data.createAllThree.id}") {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedBy2AsEditor, null, 4));
    expect(fetchOwnedBy2AsEditor.data.getAllThree).toBeTruthy();
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test getAllThree as a member of a dynamic group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByAdmins = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            groups: ["Devs"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdmins, null, 4));
    expect(ownedByAdmins.data.createAllThree).toBeTruthy();
    const fetchOwnedByAdminsAsAdmin = yield GRAPHQL_CLIENT_2.query(`
    query {
        getAllThree(id: "${ownedByAdmins.data.createAllThree.id}") {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
    expect(fetchOwnedByAdminsAsAdmin.data.getAllThree).toBeTruthy();
    const fetchOwnedByAdminsAsNonAdmin = yield GRAPHQL_CLIENT_3.query(`
    query {
        getAllThree(id: "${ownedByAdmins.data.createAllThree.id}") {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
    expect(fetchOwnedByAdminsAsNonAdmin.errors.length).toEqual(1);
    expect(fetchOwnedByAdminsAsNonAdmin.errors[0].errorType).toEqual('Unauthorized');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByAdmins.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
}));
test(`Test getAllThree as a member of the alternative group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByAdmins = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdmins, null, 4));
    expect(ownedByAdmins.data.createAllThree).toBeTruthy();
    const fetchOwnedByAdminsAsAdmin = yield GRAPHQL_CLIENT_2.query(`
    query {
        getAllThree(id: "${ownedByAdmins.data.createAllThree.id}") {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
    expect(fetchOwnedByAdminsAsAdmin.data.getAllThree).toBeTruthy();
    const fetchOwnedByAdminsAsNonAdmin = yield GRAPHQL_CLIENT_3.query(`
    query {
        getAllThree(id: "${ownedByAdmins.data.createAllThree.id}") {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
    expect(fetchOwnedByAdminsAsNonAdmin.errors.length).toEqual(1);
    expect(fetchOwnedByAdminsAsNonAdmin.errors[0].errorType).toEqual('Unauthorized');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByAdmins.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
}));
/**
 * List Query Tests
 */
test(`Test listAllThrees as admin.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    const fetchOwnedBy2AsAdmin = yield GRAPHQL_CLIENT_1.query(`
    query {
        listAllThrees {
            items {
                id
                owner
                editors
                groups
                alternativeGroup
            }
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedBy2AsAdmin, null, 4));
    expect(fetchOwnedBy2AsAdmin.data.listAllThrees.items).toHaveLength(1);
    expect(fetchOwnedBy2AsAdmin.data.listAllThrees.items[0].id).toEqual(ownedBy2.data.createAllThree.id);
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test listAllThrees as owner.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    const fetchOwnedBy2AsOwner = yield GRAPHQL_CLIENT_2.query(`
    query {
        listAllThrees {
            items {
                id
                owner
                editors
                groups
                alternativeGroup
            }
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedBy2AsOwner, null, 4));
    expect(fetchOwnedBy2AsOwner.data.listAllThrees.items).toHaveLength(1);
    expect(fetchOwnedBy2AsOwner.data.listAllThrees.items[0].id).toEqual(ownedBy2.data.createAllThree.id);
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test listAllThrees as one of a set of editors.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            editors: ["user2@test.com"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    const fetchOwnedBy2AsEditor = yield GRAPHQL_CLIENT_2.query(`
    query {
        listAllThrees {
            items {
                id
                owner
                editors
                groups
                alternativeGroup
            }
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedBy2AsEditor, null, 4));
    expect(fetchOwnedBy2AsEditor.data.listAllThrees.items).toHaveLength(1);
    expect(fetchOwnedBy2AsEditor.data.listAllThrees.items[0].id).toEqual(ownedBy2.data.createAllThree.id);
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test listAllThrees as a member of a dynamic group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByAdmins = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            groups: ["Devs"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdmins, null, 4));
    expect(ownedByAdmins.data.createAllThree).toBeTruthy();
    const fetchOwnedByAdminsAsAdmin = yield GRAPHQL_CLIENT_2.query(`
    query {
        listAllThrees {
            items {
                id
                owner
                editors
                groups
                alternativeGroup
            }
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
    expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items).toHaveLength(1);
    expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items[0].id).toEqual(ownedByAdmins.data.createAllThree.id);
    const fetchOwnedByAdminsAsNonAdmin = yield GRAPHQL_CLIENT_3.query(`
    query {
        listAllThrees {
            items {
                id
                owner
                editors
                groups
                alternativeGroup
            }
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
    expect(fetchOwnedByAdminsAsNonAdmin.data.listAllThrees.items).toHaveLength(0);
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByAdmins.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
}));
test(`Test getAllThree as a member of the alternative group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByAdmins = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdmins, null, 4));
    expect(ownedByAdmins.data.createAllThree).toBeTruthy();
    const fetchOwnedByAdminsAsAdmin = yield GRAPHQL_CLIENT_2.query(`
    query {
        listAllThrees {
            items {
                id
                owner
                editors
                groups
                alternativeGroup
            }
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsAdmin, null, 4));
    expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items).toHaveLength(1);
    expect(fetchOwnedByAdminsAsAdmin.data.listAllThrees.items[0].id).toEqual(ownedByAdmins.data.createAllThree.id);
    const fetchOwnedByAdminsAsNonAdmin = yield GRAPHQL_CLIENT_3.query(`
    query {
        listAllThrees {
            items {
                id
                owner
                editors
                groups
                alternativeGroup
            }
        }
    }
    `);
    index_1.logDebug(JSON.stringify(fetchOwnedByAdminsAsNonAdmin, null, 4));
    expect(fetchOwnedByAdminsAsNonAdmin.data.listAllThrees.items).toHaveLength(0);
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByAdmins.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
}));
/**
 * Create Mutation Tests
 */
test(`Test createAllThree as admin.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    // set by input
    expect(ownedBy2.data.createAllThree.owner).toEqual('user2@test.com');
    // auto filled as logged in user.
    expect(ownedBy2.data.createAllThree.editors[0]).toEqual('user1@test.com');
    expect(ownedBy2.data.createAllThree.groups).toBeNull();
    expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
    const ownedBy2NoEditors = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com",
            editors: []
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2NoEditors, null, 4));
    expect(ownedBy2NoEditors.data.createAllThree).toBeTruthy();
    // set by input
    expect(ownedBy2NoEditors.data.createAllThree.owner).toEqual('user2@test.com');
    // set by input
    expect(ownedBy2NoEditors.data.createAllThree.editors).toHaveLength(0);
    expect(ownedBy2NoEditors.data.createAllThree.groups).toBeNull();
    expect(ownedBy2NoEditors.data.createAllThree.alternativeGroup).toBeNull();
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
    const deleteReq2 = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2NoEditors.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq2, null, 4));
    expect(deleteReq2.data.deleteAllThree.id).toEqual(ownedBy2NoEditors.data.createAllThree.id);
}));
test(`Test createAllThree as owner.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com",
            editors: []
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    expect(ownedBy2.data.createAllThree.owner).toEqual('user2@test.com');
    expect(ownedBy2.data.createAllThree.editors).toHaveLength(0);
    expect(ownedBy2.data.createAllThree.groups).toBeNull();
    expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
    const ownedBy1 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: "user1@test.com",
            editors: []
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy1, null, 4));
    expect(ownedBy1.errors.length).toEqual(1);
    expect(ownedBy1.errors[0].errorType).toEqual('Unauthorized');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test createAllThree as one of a set of editors.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: ["user2@test.com"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    expect(ownedBy2.data.createAllThree.owner).toBeNull();
    expect(ownedBy2.data.createAllThree.editors[0]).toEqual('user2@test.com');
    expect(ownedBy2.data.createAllThree.groups).toBeNull();
    expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
    const ownedBy2WithDefaultOwner = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            editors: ["user2@test.com"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2WithDefaultOwner, null, 4));
    expect(ownedBy2WithDefaultOwner.data.createAllThree).toBeTruthy();
    expect(ownedBy2WithDefaultOwner.data.createAllThree.owner).toEqual('user2@test.com');
    expect(ownedBy2WithDefaultOwner.data.createAllThree.editors[0]).toEqual('user2@test.com');
    expect(ownedBy2WithDefaultOwner.data.createAllThree.groups).toBeNull();
    expect(ownedBy2WithDefaultOwner.data.createAllThree.alternativeGroup).toBeNull();
    const ownedByEditorsUnauthed = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: ["user1@test.com"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByEditorsUnauthed, null, 4));
    expect(ownedByEditorsUnauthed.errors.length).toEqual(1);
    expect(ownedByEditorsUnauthed.errors[0].errorType).toEqual('Unauthorized');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
    const deleteReq2 = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2WithDefaultOwner.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq2, null, 4));
    expect(deleteReq2.data.deleteAllThree.id).toEqual(ownedBy2WithDefaultOwner.data.createAllThree.id);
}));
test(`Test createAllThree as a member of a dynamic group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByDevs = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            groups: ["Devs"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByDevs, null, 4));
    expect(ownedByDevs.data.createAllThree).toBeTruthy();
    expect(ownedByDevs.data.createAllThree.owner).toBeNull();
    expect(ownedByDevs.data.createAllThree.editors).toHaveLength(0);
    expect(ownedByDevs.data.createAllThree.groups[0]).toEqual('Devs');
    expect(ownedByDevs.data.createAllThree.alternativeGroup).toBeNull();
    const ownedByAdminsUnauthed = yield GRAPHQL_CLIENT_3.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            groups: ["Devs"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdminsUnauthed, null, 4));
    expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
    expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('Unauthorized');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByDevs.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByDevs.data.createAllThree.id);
}));
test(`Test createAllThree as a member of the alternative group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByAdmins = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdmins, null, 4));
    expect(ownedByAdmins.data.createAllThree).toBeTruthy();
    expect(ownedByAdmins.data.createAllThree.owner).toBeNull();
    expect(ownedByAdmins.data.createAllThree.editors).toHaveLength(0);
    expect(ownedByAdmins.data.createAllThree.alternativeGroup).toEqual('Devs');
    const ownedByAdminsUnauthed = yield GRAPHQL_CLIENT_3.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            alternativeGroup: "Admin"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdminsUnauthed, null, 4));
    expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
    expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('Unauthorized');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByAdmins.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByAdmins.data.createAllThree.id);
}));
/**
 * Update Mutation Tests
 */
test(`Test updateAllThree and deleteAllThree as admin.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            editors: []
            owner: "user2@test.com"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    // set by input
    expect(ownedBy2.data.createAllThree.owner).toEqual('user2@test.com');
    // auto filled as logged in user.
    expect(ownedBy2.data.createAllThree.editors).toHaveLength(0);
    expect(ownedBy2.data.createAllThree.groups).toBeNull();
    expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
    const ownedByTwoUpdate = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        updateAllThree(input: {
            id: "${ownedBy2.data.createAllThree.id}",
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByTwoUpdate, null, 4));
    expect(ownedByTwoUpdate.data.updateAllThree).toBeTruthy();
    // set by input
    expect(ownedByTwoUpdate.data.updateAllThree.owner).toEqual('user2@test.com');
    // set by input
    expect(ownedByTwoUpdate.data.updateAllThree.editors).toHaveLength(0);
    expect(ownedByTwoUpdate.data.updateAllThree.groups).toBeNull();
    expect(ownedByTwoUpdate.data.updateAllThree.alternativeGroup).toEqual('Devs');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test updateAllThree and deleteAllThree as owner.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: "user2@test.com",
            editors: []
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    expect(ownedBy2.data.createAllThree.owner).toEqual('user2@test.com');
    expect(ownedBy2.data.createAllThree.editors).toHaveLength(0);
    expect(ownedBy2.data.createAllThree.groups).toBeNull();
    expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
    const ownedBy2Update = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateAllThree(input: {
            id: "${ownedBy2.data.createAllThree.id}",
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2Update, null, 4));
    expect(ownedBy2Update.data.updateAllThree).toBeTruthy();
    // set by input
    expect(ownedBy2Update.data.updateAllThree.owner).toEqual('user2@test.com');
    // set by input
    expect(ownedBy2Update.data.updateAllThree.editors).toHaveLength(0);
    expect(ownedBy2Update.data.updateAllThree.groups).toBeNull();
    expect(ownedBy2Update.data.updateAllThree.alternativeGroup).toEqual('Devs');
    const deleteReq = yield GRAPHQL_CLIENT_2.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test updateAllThree and deleteAllThree as one of a set of editors.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: ["user2@test.com"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createAllThree).toBeTruthy();
    expect(ownedBy2.data.createAllThree.owner).toBeNull();
    expect(ownedBy2.data.createAllThree.editors[0]).toEqual('user2@test.com');
    expect(ownedBy2.data.createAllThree.groups).toBeNull();
    expect(ownedBy2.data.createAllThree.alternativeGroup).toBeNull();
    const ownedByUpdate = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateAllThree(input: {
            id: "${ownedBy2.data.createAllThree.id}",
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByUpdate, null, 4));
    expect(ownedByUpdate.data.updateAllThree).toBeTruthy();
    // set by input
    expect(ownedByUpdate.data.updateAllThree.owner).toBeNull();
    // set by input
    expect(ownedByUpdate.data.updateAllThree.editors[0]).toEqual('user2@test.com');
    expect(ownedByUpdate.data.updateAllThree.groups).toBeNull();
    expect(ownedByUpdate.data.updateAllThree.alternativeGroup).toEqual('Devs');
    const deleteReq = yield GRAPHQL_CLIENT_2.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedBy2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedBy2.data.createAllThree.id);
}));
test(`Test updateAllThree and deleteAllThree as a member of a dynamic group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByDevs = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            groups: ["Devs"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByDevs, null, 4));
    expect(ownedByDevs.data.createAllThree).toBeTruthy();
    expect(ownedByDevs.data.createAllThree.owner).toBeNull();
    expect(ownedByDevs.data.createAllThree.editors).toHaveLength(0);
    expect(ownedByDevs.data.createAllThree.groups[0]).toEqual('Devs');
    expect(ownedByDevs.data.createAllThree.alternativeGroup).toBeNull();
    const ownedByUpdate = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateAllThree(input: {
            id: "${ownedByDevs.data.createAllThree.id}",
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByUpdate, null, 4));
    expect(ownedByUpdate.data.updateAllThree).toBeTruthy();
    // set by input
    expect(ownedByUpdate.data.updateAllThree.owner).toBeNull();
    // set by input
    expect(ownedByUpdate.data.updateAllThree.editors).toHaveLength(0);
    expect(ownedByUpdate.data.updateAllThree.groups[0]).toEqual('Devs');
    expect(ownedByUpdate.data.updateAllThree.alternativeGroup).toEqual('Devs');
    const ownedByAdminsUnauthed = yield GRAPHQL_CLIENT_3.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            groups: ["Devs"]
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdminsUnauthed, null, 4));
    expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
    expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('Unauthorized');
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByDevs.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByDevs.data.createAllThree.id);
}));
test(`Test updateAllThree and deleteAllThree as a member of the alternative group.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedByDevs = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByDevs, null, 4));
    expect(ownedByDevs.data.createAllThree).toBeTruthy();
    expect(ownedByDevs.data.createAllThree.owner).toBeNull();
    expect(ownedByDevs.data.createAllThree.editors).toHaveLength(0);
    expect(ownedByDevs.data.createAllThree.alternativeGroup).toEqual('Devs');
    const ownedByUpdate = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateAllThree(input: {
            id: "${ownedByDevs.data.createAllThree.id}",
            alternativeGroup: "Admin"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByUpdate, null, 4));
    expect(ownedByUpdate.data.updateAllThree).toBeTruthy();
    // set by input
    expect(ownedByUpdate.data.updateAllThree.owner).toBeNull();
    // set by input
    expect(ownedByUpdate.data.updateAllThree.editors).toHaveLength(0);
    expect(ownedByUpdate.data.updateAllThree.groups).toBeNull();
    expect(ownedByUpdate.data.updateAllThree.alternativeGroup).toEqual('Admin');
    const ownedByAdminsUnauthed = yield GRAPHQL_CLIENT_2.query(`
    mutation {
        updateAllThree(input: {
            id: "${ownedByDevs.data.createAllThree.id}",
            alternativeGroup: "Dev"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByAdminsUnauthed, null, 4));
    expect(ownedByAdminsUnauthed.errors.length).toEqual(1);
    expect(ownedByAdminsUnauthed.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
    const ownedByDevs2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createAllThree(input: {
            owner: null,
            editors: [],
            alternativeGroup: "Devs"
        }) {
            id
            owner
            editors
            groups
            alternativeGroup
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedByDevs2, null, 4));
    expect(ownedByDevs2.data.createAllThree).toBeTruthy();
    expect(ownedByDevs2.data.createAllThree.owner).toBeNull();
    expect(ownedByDevs2.data.createAllThree.editors).toHaveLength(0);
    expect(ownedByDevs2.data.createAllThree.alternativeGroup).toEqual('Devs');
    const deleteReq2 = yield GRAPHQL_CLIENT_2.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByDevs2.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq2, null, 4));
    expect(deleteReq2.data.deleteAllThree.id).toEqual(ownedByDevs2.data.createAllThree.id);
    const deleteReq = yield GRAPHQL_CLIENT_1.query(`
        mutation {
            deleteAllThree(input: { id: "${ownedByDevs.data.createAllThree.id}" }) {
                id
            }
        }
    `);
    index_1.logDebug(JSON.stringify(deleteReq, null, 4));
    expect(deleteReq.data.deleteAllThree.id).toEqual(ownedByDevs.data.createAllThree.id);
}));
test(`Test createTestIdentity as admin.`, () => __awaiter(void 0, void 0, void 0, function* () {
    const ownedBy2 = yield GRAPHQL_CLIENT_1.query(`
    mutation {
        createTestIdentity(input: {
            title: "Test title"
        }) {
            id
            title
            owner
        }
    }
    `);
    index_1.logDebug(JSON.stringify(ownedBy2, null, 4));
    expect(ownedBy2.data.createTestIdentity).toBeTruthy();
    expect(ownedBy2.data.createTestIdentity.title).toEqual('Test title');
    expect(ownedBy2.data.createTestIdentity.owner.slice(0, 19)).toEqual('https://cognito-idp');
    // user 2 should be able to update because they share the same issuer.
    const update = yield GRAPHQL_CLIENT_3.query(`
    mutation {
        updateTestIdentity(input: {
            id: "${ownedBy2.data.createTestIdentity.id}",
            title: "Test title update"
        }) {
            id
            title
            owner
        }
    }
    `);
    index_1.logDebug(JSON.stringify(update, null, 4));
    expect(update.data.updateTestIdentity).toBeTruthy();
    expect(update.data.updateTestIdentity.title).toEqual('Test title update');
    expect(update.data.updateTestIdentity.owner.slice(0, 19)).toEqual('https://cognito-idp');
    // user 2 should be able to get because they share the same issuer.
    const getReq = yield GRAPHQL_CLIENT_3.query(`
    query {
        getTestIdentity(id: "${ownedBy2.data.createTestIdentity.id}") {
            id
            title
            owner
        }
    }
    `);
    index_1.logDebug(JSON.stringify(getReq, null, 4));
    expect(getReq.data.getTestIdentity).toBeTruthy();
    expect(getReq.data.getTestIdentity.title).toEqual('Test title update');
    expect(getReq.data.getTestIdentity.owner.slice(0, 19)).toEqual('https://cognito-idp');
    const listResponse = yield GRAPHQL_CLIENT_3.query(`query {
        listTestIdentitys(filter: { title: { eq: "Test title update" } }, limit: 100) {
            items {
                id
                title
                owner
            }
        }
    }`, {});
    const relevantPost = listResponse.data.listTestIdentitys.items.find(p => p.id === getReq.data.getTestIdentity.id);
    index_1.logDebug(JSON.stringify(listResponse, null, 4));
    expect(relevantPost).toBeTruthy();
    expect(relevantPost.title).toEqual('Test title update');
    expect(relevantPost.owner.slice(0, 19)).toEqual('https://cognito-idp');
    // user 2 should be able to delete because they share the same issuer.
    const delReq = yield GRAPHQL_CLIENT_3.query(`
    mutation {
        deleteTestIdentity(input: {
            id: "${ownedBy2.data.createTestIdentity.id}"
        }) {
            id
            title
            owner
        }
    }
    `);
    index_1.logDebug(JSON.stringify(delReq, null, 4));
    expect(delReq.data.deleteTestIdentity).toBeTruthy();
    expect(delReq.data.deleteTestIdentity.title).toEqual('Test title update');
    expect(delReq.data.deleteTestIdentity.owner.slice(0, 19)).toEqual('https://cognito-idp');
}));
/**
 * Test 'operations' argument
 */
test("Test get and list with 'read' operation set", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createOwnerReadProtected(input: { content: "Hello, World!", owner: "${USERNAME1}" }) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response);
    expect(response.data.createOwnerReadProtected.id).toBeDefined();
    expect(response.data.createOwnerReadProtected.content).toEqual('Hello, World!');
    expect(response.data.createOwnerReadProtected.owner).toEqual(USERNAME1);
    const response2 = yield GRAPHQL_CLIENT_2.query(`query {
        getOwnerReadProtected(id: "${response.data.createOwnerReadProtected.id}") {
            id content owner
        }
    }`, {});
    index_1.logDebug(response2);
    expect(response2.data.getOwnerReadProtected).toBeNull();
    expect(response2.errors).toHaveLength(1);
    const response3 = yield GRAPHQL_CLIENT_1.query(`query {
        getOwnerReadProtected(id: "${response.data.createOwnerReadProtected.id}") {
            id content owner
        }
    }`, {});
    index_1.logDebug(response3);
    expect(response3.data.getOwnerReadProtected.id).toBeDefined();
    expect(response3.data.getOwnerReadProtected.content).toEqual('Hello, World!');
    expect(response3.data.getOwnerReadProtected.owner).toEqual(USERNAME1);
    const response4 = yield GRAPHQL_CLIENT_1.query(`query {
        listOwnerReadProtecteds {
            items {
                id content owner
            }
        }
    }`, {});
    index_1.logDebug(response4);
    expect(response4.data.listOwnerReadProtecteds.items.length).toBeGreaterThanOrEqual(1);
    const response5 = yield GRAPHQL_CLIENT_2.query(`query {
        listOwnerReadProtecteds {
            items {
                id content owner
            }
        }
    }`, {});
    index_1.logDebug(response5);
    expect(response5.data.listOwnerReadProtecteds.items).toHaveLength(0);
}));
test("Test createOwnerCreateUpdateDeleteProtected with 'create' operation set", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createOwnerCreateUpdateDeleteProtected(input: { content: "Hello, World!", owner: "${USERNAME1}" }) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response);
    expect(response.data.createOwnerCreateUpdateDeleteProtected.id).toBeDefined();
    expect(response.data.createOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
    expect(response.data.createOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
    const response2 = yield GRAPHQL_CLIENT_1.query(`mutation {
        createOwnerCreateUpdateDeleteProtected(input: { content: "Hello, World!", owner: "${USERNAME2}" }) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response2);
    expect(response2.data.createOwnerCreateUpdateDeleteProtected).toBeNull();
    expect(response2.errors).toHaveLength(1);
}));
test("Test updateOwnerCreateUpdateDeleteProtected with 'update' operation set", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createOwnerCreateUpdateDeleteProtected(input: { content: "Hello, World!", owner: "${USERNAME1}" }) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response);
    expect(response.data.createOwnerCreateUpdateDeleteProtected.id).toBeDefined();
    expect(response.data.createOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
    expect(response.data.createOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
    const response2 = yield GRAPHQL_CLIENT_2.query(`mutation {
        updateOwnerCreateUpdateDeleteProtected(
            input: {
                id: "${response.data.createOwnerCreateUpdateDeleteProtected.id}",
                content: "Bye, World!"
            }
        ) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response2);
    expect(response2.data.updateOwnerCreateUpdateDeleteProtected).toBeNull();
    expect(response2.errors).toHaveLength(1);
    const response3 = yield GRAPHQL_CLIENT_1.query(`mutation {
        updateOwnerCreateUpdateDeleteProtected(
            input: {
                id: "${response.data.createOwnerCreateUpdateDeleteProtected.id}",
                content: "Bye, World!"
            }
        ) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response3);
    expect(response3.data.updateOwnerCreateUpdateDeleteProtected.id).toBeDefined();
    expect(response3.data.updateOwnerCreateUpdateDeleteProtected.content).toEqual('Bye, World!');
    expect(response3.data.updateOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
}));
test("Test deleteOwnerCreateUpdateDeleteProtected with 'update' operation set", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
        createOwnerCreateUpdateDeleteProtected(input: { content: "Hello, World!", owner: "${USERNAME1}" }) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response);
    expect(response.data.createOwnerCreateUpdateDeleteProtected.id).toBeDefined();
    expect(response.data.createOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
    expect(response.data.createOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
    const response2 = yield GRAPHQL_CLIENT_2.query(`mutation {
        deleteOwnerCreateUpdateDeleteProtected(
            input: {
                id: "${response.data.createOwnerCreateUpdateDeleteProtected.id}"
            }
        ) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response2);
    expect(response2.data.deleteOwnerCreateUpdateDeleteProtected).toBeNull();
    expect(response2.errors).toHaveLength(1);
    const response3 = yield GRAPHQL_CLIENT_1.query(`mutation {
        deleteOwnerCreateUpdateDeleteProtected(
            input: {
                id: "${response.data.createOwnerCreateUpdateDeleteProtected.id}"
            }
        ) {
            id
            content
            owner
        }
    }`, {});
    index_1.logDebug(response3);
    expect(response3.data.deleteOwnerCreateUpdateDeleteProtected.id).toBeDefined();
    expect(response3.data.deleteOwnerCreateUpdateDeleteProtected.content).toEqual('Hello, World!');
    expect(response3.data.deleteOwnerCreateUpdateDeleteProtected.owner).toEqual(USERNAME1);
}));
//# sourceMappingURL=model-auth-transformer.e2e.test.js.map