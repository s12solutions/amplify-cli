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
    // GetAttGraphQLAPIId
    var out = transformer.transform(validSchema);
    // fs.writeFileSync('./out.json', JSON.stringify(out, null, 4));
    var mainStack = out.rootStack;
    var postStack = out.stacks.Post;
    expect(mainStack).toBeDefined();
    expect(postStack).toBeDefined();
    var schema = out.schema;
    expect(schema).toBeDefined();
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
//# sourceMappingURL=NestedStacksTest.e2e.test.js.map