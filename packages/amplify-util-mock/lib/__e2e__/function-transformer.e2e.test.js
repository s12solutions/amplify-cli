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
const graphql_function_transformer_1 = require("graphql-function-transformer");
const graphql_transformer_core_1 = require("graphql-transformer-core");
const graphql_client_1 = require("./utils/graphql-client");
const index_1 = require("./utils/index");
jest.setTimeout(2000000);
const ECHO_FUNCTION_NAME = `echoFunction`;
const HELLO_FUNCTION_NAME = `hello`;
let GRAPHQL_CLIENT = undefined;
let server;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const validSchema = `
    type Query {
        echo(msg: String!): Context @function(name: "${ECHO_FUNCTION_NAME}")
        duplicate(msg: String!): Context @function(name: "${ECHO_FUNCTION_NAME}")
        pipeline(msg: String!): String
            @function(name: "${ECHO_FUNCTION_NAME}")
            @function(name: "${HELLO_FUNCTION_NAME}")
        pipelineReverse(msg: String!): Context
            @function(name: "${HELLO_FUNCTION_NAME}")
            @function(name: "${ECHO_FUNCTION_NAME}")
    }
    type Context {
        arguments: Arguments
        typeName: String
        fieldName: String
    }
    type Arguments {
        msg: String!
    }
    `;
    try {
        const transformer = new graphql_transformer_core_1.default({
            transformers: [new graphql_dynamodb_transformer_1.default(), new graphql_function_transformer_1.default()],
        });
        const out = transformer.transform(validSchema);
        const result = yield index_1.deploy(out);
        server = result.simulator;
        const endpoint = server.url + '/graphql';
        index_1.logDebug(`Using graphql url: ${endpoint}`);
        const apiKey = result.config.appSync.apiKey;
        GRAPHQL_CLIENT = new graphql_client_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
    }
    catch (e) {
        index_1.logDebug(e);
        console.warn(`Could not setup function: ${e}`);
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (server) {
            yield server.stop();
        }
    }
    catch (e) {
        console.error(e);
        expect(true).toEqual(false);
    }
}));
/**
 * Test queries below
 */
test('Test simple echo function', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT.query(`query {
        echo(msg: "Hello") {
            arguments {
                msg
            }
            typeName
            fieldName
        }
    }`, {});
    index_1.logDebug(JSON.stringify(response, null, 4));
    expect(response.data.echo.arguments.msg).toEqual('Hello');
    expect(response.data.echo.typeName).toEqual('Query');
    expect(response.data.echo.fieldName).toEqual('echo');
}));
test('Test simple duplicate function', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT.query(`query {
        duplicate(msg: "Hello") {
            arguments {
                msg
            }
            typeName
            fieldName
        }
    }`, {});
    index_1.logDebug(JSON.stringify(response, null, 4));
    expect(response.data.duplicate.arguments.msg).toEqual('Hello');
    expect(response.data.duplicate.typeName).toEqual('Query');
    expect(response.data.duplicate.fieldName).toEqual('duplicate');
}));
test('Test pipeline of @function(s)', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT.query(`query {
        pipeline(msg: "IGNORED")
    }`, {});
    index_1.logDebug(JSON.stringify(response, null, 4));
    expect(response.data.pipeline).toEqual('Hello, world!');
}));
test('Test pipelineReverse of @function(s)', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield GRAPHQL_CLIENT.query(`query {
        pipelineReverse(msg: "Hello") {
            arguments {
                msg
            }
            typeName
            fieldName
        }
    }`, {});
    index_1.logDebug(JSON.stringify(response, null, 4));
    expect(response.data.pipelineReverse.arguments.msg).toEqual('Hello');
    expect(response.data.pipelineReverse.typeName).toEqual('Query');
    expect(response.data.pipelineReverse.fieldName).toEqual('pipelineReverse');
}));
//# sourceMappingURL=function-transformer.e2e.test.js.map