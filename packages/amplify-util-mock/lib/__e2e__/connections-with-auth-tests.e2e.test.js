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
const graphql_connection_transformer_1 = require("graphql-connection-transformer");
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const graphql_transformer_core_1 = require("graphql-transformer-core");
const cognito_utils_1 = require("./utils/cognito-utils");
const graphql_client_1 = require("./utils/graphql-client");
const index_1 = require("./utils/index");
global.fetch = require('node-fetch');
jest.setTimeout(2000000);
let GRAPHQL_ENDPOINT = undefined;
/**
 * Client 1 is logged in and is a member of the Admin group.
 */
let GRAPHQL_CLIENT_1 = undefined;
/**
 * Client 2 is logged in and is a member of the Devs group.
 */
let GRAPHQL_CLIENT_2 = undefined;
/**
 * Client 3 is logged in and has no group memberships.
 */
let GRAPHQL_CLIENT_3 = undefined;
let USER_POOL_ID = 'y9CqgkEJe';
const USERNAME1 = 'user1@test.com';
const USERNAME2 = 'user2@test.com';
const USERNAME3 = 'user3@test.com';
const ADMIN_GROUP_NAME = 'Admin';
const DEVS_GROUP_NAME = 'Devs';
const PARTICIPANT_GROUP_NAME = 'Participant';
const WATCHER_GROUP_NAME = 'Watcher';
let ddbEmulator = null;
let dbPath = null;
let server;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const validSchema = `type Post @model(
    subscriptions: {
        level: public
})@auth(rules: [{ allow: owner }]) {
    id: ID!
    title: String!
    author: User @connection(name: "UserPosts", keyField: "owner")
    owner: String
}
type User @model(
    subscriptions: {
        level: public
    }) @auth(rules: [{ allow: owner }]) {
    id: ID!
    posts: [Post!]! @connection(name: "UserPosts", keyField: "owner")
}
type FieldProtected @model(
    subscriptions: {
        level: public
}){
    id: ID!
    owner: String
    ownerOnly: String @auth(rules: [{ allow: owner }])
}
type OpenTopLevel @model(
    subscriptions: {
        level: public
}) {
    id: ID!
    name: String
    owner: String
    protected: [ConnectionProtected] @connection(name: "ProtectedConnection")
}
type ConnectionProtected @model(
    subscriptions: {
        level: public
    }
    queries: null
)@auth(rules: [{ allow: owner }]) {
    id: ID!
    name: String
    owner: String
    topLevel: OpenTopLevel @connection(name: "ProtectedConnection")
}
    `;
    const transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_connection_transformer_1.default(),
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
        // Verify we have all the details
        expect(GRAPHQL_ENDPOINT).toBeTruthy();
        const idToken = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME1, USERNAME1, [
            ADMIN_GROUP_NAME,
            WATCHER_GROUP_NAME,
            PARTICIPANT_GROUP_NAME,
        ]);
        GRAPHQL_CLIENT_1 = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, {
            Authorization: idToken,
        });
        const idToken2 = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME2, USERNAME2, [
            DEVS_GROUP_NAME,
        ]);
        GRAPHQL_CLIENT_2 = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, {
            Authorization: idToken2,
        });
        const idToken3 = cognito_utils_1.signUpAddToGroupAndGetJwtToken(USER_POOL_ID, USERNAME3, USERNAME3, []);
        GRAPHQL_CLIENT_3 = new graphql_client_1.GraphQLClient(GRAPHQL_ENDPOINT, {
            Authorization: idToken3,
        });
        // Wait for any propagation to avoid random
        // "The security token included in the request is invalid" errors
        yield new Promise(res => setTimeout(() => res(), 5000));
    }
    catch (e) {
        console.error(e);
        throw e;
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
        throw e;
    }
}));
/**
 * Tests
 */
test('Test creating a post and immediately view it via the User.posts connection.', () => __awaiter(void 0, void 0, void 0, function* () {
    const createUser1 = yield GRAPHQL_CLIENT_1.query(`mutation {
      createUser(input: { id: "user1@test.com" }) {
          id
      }
  }`, {});
    index_1.logDebug(createUser1);
    expect(createUser1.data.createUser.id).toEqual('user1@test.com');
    const response = yield GRAPHQL_CLIENT_1.query(`mutation {
      createPost(input: { title: "Hello, World!" }) {
          id
          title
          owner
      }
  }`, {});
    index_1.logDebug(response);
    expect(response.data.createPost.id).toBeDefined();
    expect(response.data.createPost.title).toEqual('Hello, World!');
    expect(response.data.createPost.owner).toBeDefined();
    const getResponse = yield GRAPHQL_CLIENT_1.query(`query {
      getUser(id: "user1@test.com") {
          posts {
              items {
                  id
                  title
                  owner
                  author {
                      id
                  }
              }
          }
      }
  }`, {});
    index_1.logDebug(JSON.stringify(getResponse, null, 4));
    expect(getResponse.data.getUser.posts.items[0].id).toBeDefined();
    expect(getResponse.data.getUser.posts.items[0].title).toEqual('Hello, World!');
    expect(getResponse.data.getUser.posts.items[0].owner).toEqual('user1@test.com');
    expect(getResponse.data.getUser.posts.items[0].author.id).toEqual('user1@test.com');
}));
test('Testing reading an owner protected field as a non owner', () => __awaiter(void 0, void 0, void 0, function* () {
    const response1 = yield GRAPHQL_CLIENT_1.query(`mutation {
      createFieldProtected(input: { id: "1", owner: "${USERNAME1}", ownerOnly: "owner-protected" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response1);
    expect(response1.data.createFieldProtected.id).toEqual('1');
    expect(response1.data.createFieldProtected.owner).toEqual(USERNAME1);
    expect(response1.data.createFieldProtected.ownerOnly).toEqual('owner-protected');
    const response2 = yield GRAPHQL_CLIENT_2.query(`query {
      getFieldProtected(id: "1") {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response2);
    expect(response2.data.getFieldProtected.ownerOnly).toBeNull();
    expect(response2.errors).toHaveLength(1);
    const response3 = yield GRAPHQL_CLIENT_1.query(`query {
      getFieldProtected(id: "1") {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response3);
    expect(response3.data.getFieldProtected.id).toEqual('1');
    expect(response3.data.getFieldProtected.owner).toEqual(USERNAME1);
    expect(response3.data.getFieldProtected.ownerOnly).toEqual('owner-protected');
}));
test('Test that @connection resolvers respect @model read operations.', () => __awaiter(void 0, void 0, void 0, function* () {
    const response1 = yield GRAPHQL_CLIENT_1.query(`mutation {
      createOpenTopLevel(input: { id: "1", owner: "${USERNAME1}", name: "open" }) {
          id
          owner
          name
      }
  }`, {});
    index_1.logDebug(response1);
    expect(response1.data.createOpenTopLevel.id).toEqual('1');
    expect(response1.data.createOpenTopLevel.owner).toEqual(USERNAME1);
    expect(response1.data.createOpenTopLevel.name).toEqual('open');
    const response2 = yield GRAPHQL_CLIENT_2.query(`mutation {
      createConnectionProtected(input: { id: "1", owner: "${USERNAME2}", name: "closed", connectionProtectedTopLevelId: "1" }) {
          id
          owner
          name
      }
  }`, {});
    index_1.logDebug(response2);
    expect(response2.data.createConnectionProtected.id).toEqual('1');
    expect(response2.data.createConnectionProtected.owner).toEqual(USERNAME2);
    expect(response2.data.createConnectionProtected.name).toEqual('closed');
    const response3 = yield GRAPHQL_CLIENT_1.query(`query {
      getOpenTopLevel(id: "1") {
          id
          protected {
              items {
                  id
                  name
                  owner
              }
          }
      }
  }`, {});
    index_1.logDebug(response3);
    expect(response3.data.getOpenTopLevel.id).toEqual('1');
    expect(response3.data.getOpenTopLevel.protected.items).toHaveLength(0);
    const response4 = yield GRAPHQL_CLIENT_2.query(`query {
      getOpenTopLevel(id: "1") {
          id
          protected {
              items {
                  id
                  name
                  owner
              }
          }
      }
  }`, {});
    index_1.logDebug(response4);
    expect(response4.data.getOpenTopLevel.id).toEqual('1');
    expect(response4.data.getOpenTopLevel.protected.items).toHaveLength(1);
}));
// Per field auth in mutations
test('Test that owners cannot set the field of a FieldProtected object unless authorized.', () => __awaiter(void 0, void 0, void 0, function* () {
    const response1 = yield GRAPHQL_CLIENT_1.query(`mutation {
      createFieldProtected(input: { id: "2", owner: "${USERNAME1}", ownerOnly: "owner-protected" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(JSON.stringify(response1));
    expect(response1.data.createFieldProtected.id).toEqual('2');
    expect(response1.data.createFieldProtected.owner).toEqual(USERNAME1);
    expect(response1.data.createFieldProtected.ownerOnly).toEqual('owner-protected');
    const response2 = yield GRAPHQL_CLIENT_1.query(`mutation {
      createFieldProtected(input: { id: "3", owner: "${USERNAME2}", ownerOnly: "owner-protected" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response2);
    expect(response2.data.createFieldProtected).toBeNull();
    expect(response2.errors).toHaveLength(1);
    // The auth rule is on ownerOnly. Omitting the "ownerOnly" field will
    // not trigger the @auth check
    const response3 = yield GRAPHQL_CLIENT_1.query(`mutation {
      createFieldProtected(input: { id: "4", owner: "${USERNAME2}" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response3);
    expect(response3.data.createFieldProtected.id).toEqual('4');
    expect(response3.data.createFieldProtected.owner).toEqual(USERNAME2);
    // The length is one because the 'ownerOnly' field is protected on reads.
    // Since the caller is not the owner this will throw after the mutation succeeds
    // and return partial results.
    expect(response3.errors).toHaveLength(1);
}));
test('Test that owners cannot update the field of a FieldProtected object unless authorized.', () => __awaiter(void 0, void 0, void 0, function* () {
    const response1 = yield GRAPHQL_CLIENT_1.query(`mutation {
      createFieldProtected(input: { owner: "${USERNAME1}", ownerOnly: "owner-protected" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(JSON.stringify(response1));
    expect(response1.data.createFieldProtected.id).not.toBeNull();
    expect(response1.data.createFieldProtected.owner).toEqual(USERNAME1);
    expect(response1.data.createFieldProtected.ownerOnly).toEqual('owner-protected');
    const response2 = yield GRAPHQL_CLIENT_2.query(`mutation {
      updateFieldProtected(input: { id: "${response1.data.createFieldProtected.id}", ownerOnly: "owner2-protected" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response2);
    expect(response2.data.updateFieldProtected).toBeNull();
    expect(response2.errors).toHaveLength(1);
    // The auth rule is on ownerOnly. Omitting the "ownerOnly" field will
    // not trigger the @auth check
    const response3 = yield GRAPHQL_CLIENT_1.query(`mutation {
      updateFieldProtected(input: { id: "${response1.data.createFieldProtected.id}", ownerOnly: "updated" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response3);
    expect(response3.data.updateFieldProtected.id).toEqual(response1.data.createFieldProtected.id);
    expect(response3.data.updateFieldProtected.owner).toEqual(USERNAME1);
    expect(response3.data.updateFieldProtected.ownerOnly).toEqual('updated');
    // This request should succeed since we are not updating the protected field.
    const response4 = yield GRAPHQL_CLIENT_3.query(`mutation {
      updateFieldProtected(input: { id: "${response1.data.createFieldProtected.id}", owner: "${USERNAME3}" }) {
          id
          owner
          ownerOnly
      }
  }`, {});
    index_1.logDebug(response4);
    expect(response4.data.updateFieldProtected.id).toEqual(response1.data.createFieldProtected.id);
    expect(response4.data.updateFieldProtected.owner).toEqual(USERNAME3);
    expect(response4.data.updateFieldProtected.ownerOnly).toEqual('updated');
}));
//# sourceMappingURL=connections-with-auth-tests.e2e.test.js.map