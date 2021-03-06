"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const graphql_1 = require("graphql");
const errors_1 = require("./errors");
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
        throw new errors_1.ToolError(`Cannot find GraphQL schema file: ${schemaPath}`);
    }
    const schemaData = require(schemaPath);
    if (!schemaData.data && !schemaData.__schema) {
        throw new errors_1.ToolError('GraphQL schema file should contain a valid GraphQL introspection query result');
    }
    return graphql_1.buildClientSchema(schemaData.data ? schemaData.data : schemaData);
}
function loadSDLSchema(schemaPath) {
    const authDirectivePath = path_1.normalize(path_1.join(__dirname, '..', 'awsApppSyncDirectives.graphql'));
    const doc = loadAndMergeQueryDocuments([authDirectivePath, schemaPath]);
    return graphql_1.buildASTSchema(doc);
}
function extractDocumentFromJavascript(content, tagName = 'gql') {
    const re = new RegExp(tagName + '\\s*`([^`/]*)`', 'g');
    let match;
    const matches = [];
    while ((match = re.exec(content))) {
        const doc = match[1].replace(/\${[^}]*}/g, '');
        matches.push(doc);
    }
    const doc = matches.join('\n');
    return doc.length ? doc : null;
}
function loadAndMergeQueryDocuments(inputPaths, tagName = 'gql') {
    const sources = inputPaths
        .map(inputPath => {
        const body = fs.readFileSync(inputPath, 'utf8');
        if (!body) {
            return null;
        }
        if (inputPath.endsWith('.jsx') || inputPath.endsWith('.js') || inputPath.endsWith('.tsx') || inputPath.endsWith('.ts')) {
            const doc = extractDocumentFromJavascript(body.toString(), tagName);
            return doc ? new graphql_1.Source(doc, inputPath) : null;
        }
        return new graphql_1.Source(body, inputPath);
    })
        .filter((source) => Boolean(source));
    const parsedSources = sources.map(source => {
        try {
            return graphql_1.parse(source);
        }
        catch (err) {
            const relativePathToInput = path_1.relative(process.cwd(), source.name);
            throw new errors_1.ToolError(`Could not parse graphql operations in ${relativePathToInput}\n  Failed on : ${source.body}`);
        }
    });
    return graphql_1.concatAST(parsedSources);
}
exports.loadAndMergeQueryDocuments = loadAndMergeQueryDocuments;
//# sourceMappingURL=loading.js.map