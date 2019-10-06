"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var KeyTransformer_1 = require("../KeyTransformer");
test('KeyTransformer should fail if more than 1 @key is provided without a name.', function () {
    var validSchema = "\n    type Test @key(fields: [\"id\"]) @key(fields: [\"email\"]) {\n        id: ID!\n        email: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new KeyTransformer_1.default()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError(graphql_transformer_core_1.InvalidDirectiveError);
});
test('KeyTransformer should fail if more than 1 @key is provided with the same name.', function () {
    var validSchema = "\n    type Test @key(name: \"Test\", fields: [\"id\"]) @key(name: \"Test\", fields: [\"email\"]) {\n        id: ID!\n        email: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new KeyTransformer_1.default()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError(graphql_transformer_core_1.InvalidDirectiveError);
});
test('KeyTransformer should fail if referencing a field that does not exist.', function () {
    var validSchema = "\n    type Test @key(fields: [\"someWeirdId\"]) {\n        id: ID!\n        email: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new KeyTransformer_1.default()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError(graphql_transformer_core_1.InvalidDirectiveError);
});
test('Test that a primary @key fails if pointing to nullable fields.', function () {
    var validSchema = "\n    type Test @key(fields: [\"email\"]) {\n        id: ID!\n        email: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new KeyTransformer_1.default()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError(graphql_transformer_core_1.InvalidDirectiveError);
});
test('Test that model with an LSI but no primary sort key will fail.', function () {
    var validSchema = "\n    type Test @key(fields: [\"id\"]) @key(name: \"SomeLSI\", fields: [\"id\", \"email\"]) {\n        id: ID!\n        email: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new KeyTransformer_1.default()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError(graphql_transformer_core_1.InvalidDirectiveError);
});
test('KeyTransformer should fail if a non-existing type field is defined as key field.', function () {
    var validSchema = "\n    type Test @key(name: \"Test\", fields: [\"one\"]) {\n        id: ID!\n        email: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new KeyTransformer_1.default()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError(graphql_transformer_core_1.InvalidDirectiveError);
});
//# sourceMappingURL=KeyTransformer.test.js.map