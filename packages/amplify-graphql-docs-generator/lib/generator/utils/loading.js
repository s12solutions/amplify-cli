"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const graphql_1 = require("graphql");
const path_1 = require("path");
function loadSchema(schemaPath) {
    if (path_1.extname(schemaPath) === '.json') {
        return loadIntrospectionSchema(schemaPath);
    }
    return loadSDLSchema(schemaPath);
}
exports.loadSchema = loadSchema;
function loadIntrospectionSchema(schemaPath) {
    if (!fs.existsSync(schemaPath)) {
        throw new Error(`Cannot find GraphQL schema file: ${schemaPath}`);
    }
    const schemaData = require(schemaPath);
    if (!schemaData.data && !schemaData.__schema) {
        throw new Error('GraphQL schema file should contain a valid GraphQL introspection query result');
    }
    return graphql_1.buildClientSchema(schemaData.data ? schemaData.data : schemaData);
}
function loadSDLSchema(schemaPath) {
    const authDirectivePath = path_1.normalize(path_1.join(__dirname, '../../..', 'awsApppSyncDirectives.graphql'));
    const doc = loadAndMergeQueryDocuments([authDirectivePath, schemaPath]);
    return graphql_1.buildASTSchema(doc);
}
function loadAndMergeQueryDocuments(inputPaths, tagName = 'gql') {
    const sources = inputPaths
        .map(inputPath => {
        const body = fs.readFileSync(inputPath, 'utf8');
        if (!body) {
            return null;
        }
        return new graphql_1.Source(body, inputPath);
    })
        .filter(source => source);
    return graphql_1.concatAST(sources.map(source => graphql_1.parse(source)));
}
exports.loadAndMergeQueryDocuments = loadAndMergeQueryDocuments;
//# sourceMappingURL=loading.js.map