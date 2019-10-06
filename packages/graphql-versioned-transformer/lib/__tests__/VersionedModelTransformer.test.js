"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var VersionedModelTransformer_1 = require("../VersionedModelTransformer");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var getInputType = function (schemaDoc) { return function (name) {
    return schemaDoc.definitions.find(function (d) { return d.kind !== graphql_1.Kind.SCHEMA_DEFINITION ? d.name.value === name : false; });
}; };
var getInputField = function (input, field) { return input.fields.find(function (f) { return f.name.value === field; }); };
var getType = function (schemaDoc) { return function (name) {
    return schemaDoc.definitions.find(function (d) { return d.kind !== graphql_1.Kind.SCHEMA_DEFINITION ? d.name.value === name : false; });
}; };
var getField = function (input, field) { return input.fields.find(function (f) { return f.name.value === field; }); };
test('Test VersionedModelTransformer validation happy case', function () {
    var validSchema = "\n    type Post @model @versioned {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new VersionedModelTransformer_1.VersionedModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    // tslint:disable-next-line
    var schemaDoc = graphql_1.parse(out.schema);
    expect(out).toBeDefined();
    expect(getField(getType(schemaDoc)('Post'), 'version')).toBeDefined();
    expect(getInputField(getInputType(schemaDoc)('CreatePostInput'), 'version')).toBeUndefined();
    expect(getInputField(getInputType(schemaDoc)('UpdatePostInput'), 'expectedVersion')).toBeDefined();
    expect(getInputField(getInputType(schemaDoc)('DeletePostInput'), 'expectedVersion')).toBeDefined();
    // Use e2e tests to test resolver logic.
});
test('Test VersionedModelTransformer validation fails when provided version field of wrong type.', function () {
    var validSchema = "\n    type Post @model @versioned {\n        id: ID!\n        title: String!\n        version: String!\n        createdAt: String\n        updatedAt: String\n    }\n    ";
    try {
        var transformer = new graphql_transformer_core_1.default({
            transformers: [
                new graphql_dynamodb_transformer_1.default(),
                new VersionedModelTransformer_1.VersionedModelTransformer()
            ]
        });
        var out = transformer.transform(validSchema);
    }
    catch (e) {
        expect(e.name).toEqual('TransformerContractError');
    }
});
test('Test VersionedModelTransformer version field replaced by non-null if provided as nullable.', function () {
    var validSchema = "\n    type Post @model @versioned {\n        id: ID!\n        title: String!\n        version: Int\n        createdAt: String\n        updatedAt: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new VersionedModelTransformer_1.VersionedModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    var sdl = out.schema;
    var schemaDoc = graphql_1.parse(sdl);
    var versionField = getField(getType(schemaDoc)('Post'), 'version');
    expect(versionField).toBeDefined();
    expect(versionField.type.kind).toEqual(graphql_1.Kind.NON_NULL_TYPE);
});
//# sourceMappingURL=VersionedModelTransformer.test.js.map