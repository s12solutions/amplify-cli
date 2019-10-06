"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var fs = require("fs");
var path = require("path");
jest.setTimeout(2000000);
test('Test custom root types with additional fields.', function () {
    var validSchema = "\n    type Query {\n        additionalQueryField: String\n    }\n    type Mutation {\n        additionalMutationField: String\n    }\n    type Subscription {\n        additionalSubscriptionField: String\n    }\n    type Post @model {\n        id: ID!\n        title: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var queryType = getObjectType(parsed, 'Query');
    expectFields(queryType, ['getPost', 'listPosts', 'additionalQueryField']);
    var mutationType = getObjectType(parsed, 'Mutation');
    expectFields(mutationType, ['createPost', 'updatePost', 'deletePost', 'additionalMutationField']);
    var subscriptionType = getObjectType(parsed, 'Subscription');
    expectFields(subscriptionType, ['onCreatePost', 'onUpdatePost', 'onDeletePost', 'additionalSubscriptionField']);
});
test('Test custom root query with no mutations/subscriptions.', function () {
    var validSchema = "\n    # If I intentionally leave out mutation/subscription then no mutations/subscriptions\n    # will be created even if @model is used.\n    schema {\n        query: Query\n    }\n    type Query {\n        additionalQueryField: String\n    }\n    type Post @model {\n        id: ID!\n        title: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var queryType = getObjectType(parsed, 'Query');
    expectFields(queryType, ['getPost', 'listPosts', 'additionalQueryField']);
    var mutationType = getObjectType(parsed, 'Mutation');
    expect(mutationType).toBeUndefined();
    var subscriptionType = getObjectType(parsed, 'Subscription');
    expect(subscriptionType).toBeUndefined();
});
test('Test custom root query & mutation with no subscriptions.', function () {
    var validSchema = "\n    # If I intentionally leave out mutation/subscription then no mutations/subscriptions\n    # will be created even if @model is used.\n    schema {\n        query: Query2\n        mutation: Mutation2\n    }\n    type Query2 {\n        additionalQueryField: String\n    }\n    type Mutation2 {\n        additionalMutationField: String\n    }\n    type Post @model {\n        id: ID!\n        title: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var queryType = getObjectType(parsed, 'Query2');
    expectFields(queryType, ['getPost', 'listPosts', 'additionalQueryField']);
    var mutationType = getObjectType(parsed, 'Mutation2');
    expectFields(mutationType, ['createPost', 'updatePost', 'deletePost', 'additionalMutationField']);
    var subscriptionType = getObjectType(parsed, 'Subscription');
    expect(subscriptionType).toBeUndefined();
});
test('Test custom root query, mutation, and subscriptions.', function () {
    var validSchema = "\n    # If I intentionally leave out mutation/subscription then no mutations/subscriptions\n    # will be created even if @model is used.\n    schema {\n        query: Query2\n        mutation: Mutation2\n        subscription: Subscription2\n    }\n    type Query2 {\n        additionalQueryField: String\n\n        authedField: String\n            @aws_auth(cognito_groups: [\"Bloggers\", \"Readers\"])\n    }\n    type Mutation2 {\n        additionalMutationField: String\n    }\n    type Subscription2 {\n        onCreateOrUpdate: Post\n            @aws_subscribe(mutations: [\"createPost\", \"updatePost\"])\n    }\n    type Post @model {\n        id: ID!\n        title: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var queryType = getObjectType(parsed, 'Query2');
    expectFields(queryType, ['getPost', 'listPosts', 'additionalQueryField', 'authedField']);
    var authedField = queryType.fields.find(function (f) { return f.name.value === 'authedField'; });
    expect(authedField.directives.length).toEqual(1);
    expect(authedField.directives[0].name.value).toEqual('aws_auth');
    var mutationType = getObjectType(parsed, 'Mutation2');
    expectFields(mutationType, ['createPost', 'updatePost', 'deletePost', 'additionalMutationField']);
    var subscriptionType = getObjectType(parsed, 'Subscription2');
    expectFields(subscriptionType, ['onCreatePost', 'onUpdatePost', 'onDeletePost', 'onCreateOrUpdate']);
});
test('Test custom roots without any directives. This should still be valid.', function () {
    var validSchema = "\n    schema {\n        query: Query2\n        mutation: Mutation2\n        subscription: Subscription2\n    }\n    type Query2 {\n        getPost: String\n    }\n    type Mutation2 {\n        putPost: String\n    }\n    type Subscription2 {\n        onPutPost: Post\n    }\n    type Post {\n        id: ID!\n        title: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var queryType = getObjectType(parsed, 'Query2');
    expectFields(queryType, ['getPost']);
    var mutationType = getObjectType(parsed, 'Mutation2');
    expectFields(mutationType, ['putPost']);
    var subscriptionType = getObjectType(parsed, 'Subscription2');
    expectFields(subscriptionType, ['onPutPost']);
});
function expectFields(type, fields) {
    var _loop_1 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
    };
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var fieldName = fields_1[_i];
        _loop_1(fieldName);
    }
}
function doNotExpectFields(type, fields) {
    var _loop_2 = function (fieldName) {
        expect(type.fields.find(function (f) { return f.name.value === fieldName; })).toBeUndefined();
    };
    for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
        var fieldName = fields_2[_i];
        _loop_2(fieldName);
    }
}
function getObjectType(doc, type) {
    return doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && def.name.value === type; });
}
function getInputType(doc, type) {
    return doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === type; });
}
function verifyInputCount(doc, type, count) {
    return doc.definitions.filter(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === type; }).length == count;
}
function cleanUpFiles(directory) {
    var files = fs.readdirSync(directory);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var dir = path.join(directory, file);
        if (!fs.lstatSync(dir).isDirectory()) {
            fs.unlinkSync(dir);
        }
        else {
            cleanUpFiles(dir);
        }
    }
    fs.rmdirSync(directory);
}
function readFile(filePath) {
    return fs.readFileSync(filePath, "utf8");
}
//# sourceMappingURL=CustomRoots.e2e.test.js.map