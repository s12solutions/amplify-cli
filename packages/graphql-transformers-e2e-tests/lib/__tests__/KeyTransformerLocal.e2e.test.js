"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_key_transformer_1 = require("graphql-key-transformer");
var graphql_1 = require("graphql");
var testUtil_1 = require("../testUtil");
test('Test that a primary @key with a single field changes the hash key.', function () {
    var validSchema = "\n    type Test @model @key(fields: [\"email\"]) {\n        email: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    expect(tableResource.Properties.KeySchema[0].AttributeName).toEqual('email');
    expect(tableResource.Properties.KeySchema[0].KeyType).toEqual('HASH');
    expect(tableResource.Properties.AttributeDefinitions[0].AttributeType).toEqual('S');
    var schema = graphql_1.parse(out.schema);
    var queryType = schema.definitions.find(function (def) { return def.name && def.name.value === 'Query'; });
    var getTestField = queryType.fields.find(function (f) { return f.name && f.name.value === 'getTest'; });
    expect(getTestField.arguments).toHaveLength(1);
    testUtil_1.expectArguments(getTestField, ['email']);
});
test('Test that a primary @key with 2 fields changes the hash and sort key.', function () {
    var validSchema = "\n    type Test @model @key(fields: [\"email\", \"kind\"]) {\n        email: String!\n        kind: Int!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    var hashKey = tableResource.Properties.KeySchema.find(function (o) { return o.KeyType === 'HASH'; });
    var hashKeyAttr = tableResource.Properties.AttributeDefinitions.find(function (o) { return o.AttributeName === 'email'; });
    var rangeKey = tableResource.Properties.KeySchema.find(function (o) { return o.KeyType === 'RANGE'; });
    var rangeKeyAttr = tableResource.Properties.AttributeDefinitions.find(function (o) { return o.AttributeName === 'kind'; });
    expect(tableResource.Properties.AttributeDefinitions).toHaveLength(2);
    expect(hashKey.AttributeName).toEqual('email');
    expect(rangeKey.AttributeName).toEqual('kind');
    expect(hashKeyAttr.AttributeType).toEqual('S');
    expect(rangeKeyAttr.AttributeType).toEqual('N');
    var schema = graphql_1.parse(out.schema);
    var queryType = schema.definitions.find(function (def) { return def.name && def.name.value === 'Query'; });
    var getTestField = queryType.fields.find(function (f) { return f.name && f.name.value === 'getTest'; });
    expect(getTestField.arguments).toHaveLength(2);
    testUtil_1.expectArguments(getTestField, ['email', 'kind']);
});
test('Test that a primary @key with 3 fields changes the hash and sort keys.', function () {
    var validSchema = "\n    type Test @model @key(fields: [\"email\", \"kind\", \"date\"]) {\n        email: String!\n        kind: Int!\n        date: AWSDateTime!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    var hashKey = tableResource.Properties.KeySchema.find(function (o) { return o.KeyType === 'HASH'; });
    var hashKeyAttr = tableResource.Properties.AttributeDefinitions.find(function (o) { return o.AttributeName === 'email'; });
    var rangeKey = tableResource.Properties.KeySchema.find(function (o) { return o.KeyType === 'RANGE'; });
    var rangeKeyAttr = tableResource.Properties.AttributeDefinitions.find(function (o) { return o.AttributeName === 'kind#date'; });
    expect(tableResource.Properties.AttributeDefinitions).toHaveLength(2);
    expect(hashKey.AttributeName).toEqual('email');
    expect(rangeKey.AttributeName).toEqual('kind#date');
    expect(hashKeyAttr.AttributeType).toEqual('S');
    // composite keys will always be strings.
    expect(rangeKeyAttr.AttributeType).toEqual('S');
    var schema = graphql_1.parse(out.schema);
    var queryType = schema.definitions.find(function (def) { return def.name && def.name.value === 'Query'; });
    var getTestField = queryType.fields.find(function (f) { return f.name && f.name.value === 'getTest'; });
    expect(getTestField.arguments).toHaveLength(3);
    testUtil_1.expectArguments(getTestField, ['email', 'kind', 'date']);
    var listTestField = queryType.fields.find(function (f) { return f.name && f.name.value === 'listTests'; });
    expect(listTestField.arguments).toHaveLength(6);
    testUtil_1.expectArguments(listTestField, ['email', 'kindDate', 'filter', 'nextToken', 'limit', 'sortDirection']);
});
test('Test that a secondary @key with 3 fields changes the hash and sort keys and adds a query fields correctly.', function () {
    var validSchema = "\n    type Test @model @key(name: \"GSI\", fields: [\"email\", \"kind\", \"date\"], queryField: \"listByEmailKindDate\") {\n        email: String!\n        kind: Int!\n        date: AWSDateTime!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    console.log(out.schema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    var hashKey = tableResource.Properties.KeySchema.find(function (o) { return o.KeyType === 'HASH'; });
    var hashKeyAttr = tableResource.Properties.AttributeDefinitions.find(function (o) { return o.AttributeName === 'email'; });
    expect(tableResource.Properties.AttributeDefinitions).toHaveLength(3);
    expect(hashKey.AttributeName).toEqual('id');
    expect(hashKeyAttr.AttributeType).toEqual('S');
    // composite keys will always be strings.
    var gsi = tableResource.Properties.GlobalSecondaryIndexes.find(function (o) { return o.IndexName === 'GSI'; });
    var gsiHashKey = gsi.KeySchema.find(function (o) { return o.KeyType === 'HASH'; });
    var gsiHashKeyAttr = tableResource.Properties.AttributeDefinitions.find(function (o) { return o.AttributeName === 'email'; });
    var gsiRangeKey = gsi.KeySchema.find(function (o) { return o.KeyType === 'RANGE'; });
    var gsiRangeKeyAttr = tableResource.Properties.AttributeDefinitions.find(function (o) { return o.AttributeName === 'kind#date'; });
    expect(gsiHashKey.AttributeName).toEqual('email');
    expect(gsiRangeKey.AttributeName).toEqual('kind#date');
    expect(gsiHashKeyAttr.AttributeType).toEqual('S');
    expect(gsiRangeKeyAttr.AttributeType).toEqual('S');
    var schema = graphql_1.parse(out.schema);
    var queryType = schema.definitions.find(function (def) { return def.name && def.name.value === 'Query'; });
    var getTestField = queryType.fields.find(function (f) { return f.name && f.name.value === 'getTest'; });
    expect(getTestField.arguments).toHaveLength(1);
    testUtil_1.expectArguments(getTestField, ['id']);
    var queryField = queryType.fields.find(function (f) { return f.name && f.name.value === 'listByEmailKindDate'; });
    expect(queryField.arguments).toHaveLength(6);
    testUtil_1.expectArguments(queryField, ['email', 'kindDate', 'filter', 'nextToken', 'limit', 'sortDirection']);
    var listTestField = queryType.fields.find(function (f) { return f.name && f.name.value === 'listTests'; });
    expect(listTestField.arguments).toHaveLength(3);
    testUtil_1.expectArguments(listTestField, ['filter', 'nextToken', 'limit']);
});
test('Test that a secondary @key with a single field adds a GSI.', function () {
    var validSchema = "\n    type Test @model @key(name: \"GSI_Email\", fields: [\"email\"], queryField: \"testsByEmail\") {\n        id: ID!\n        email: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    expect(tableResource.Properties.GlobalSecondaryIndexes[0].KeySchema[0].AttributeName).toEqual('email');
    expect(tableResource.Properties.GlobalSecondaryIndexes[0].KeySchema[0].KeyType).toEqual('HASH');
    expect(tableResource.Properties.AttributeDefinitions.find(function (ad) { return ad.AttributeName === 'email'; }).AttributeType).toEqual('S');
    var schema = graphql_1.parse(out.schema);
    var queryType = schema.definitions.find(function (def) { return def.name && def.name.value === 'Query'; });
    var getField = queryType.fields.find(function (f) { return f.name.value === 'getTest'; });
    expect(getField.arguments).toHaveLength(1);
    testUtil_1.expectArguments(getField, ['id']);
    var listTestsField = queryType.fields.find(function (f) { return f.name && f.name.value === 'listTests'; });
    expect(listTestsField.arguments).toHaveLength(3);
    testUtil_1.expectArguments(listTestsField, ['filter', 'nextToken', 'limit']);
    var queryIndexField = queryType.fields.find(function (f) { return f.name && f.name.value === 'testsByEmail'; });
    expect(queryIndexField.arguments).toHaveLength(5);
    testUtil_1.expectArguments(queryIndexField, ['email', 'filter', 'nextToken', 'limit', 'sortDirection']);
});
test('Test that a secondary @key with a multiple field adds an GSI.', function () {
    var validSchema = "\n    type Test @model @key(fields: [\"email\", \"createdAt\"])\n    @key(name: \"CategoryGSI\", fields: [\"category\", \"createdAt\"], queryField: \"testsByCategory\") {\n        email: String!\n        createdAt: String!\n        category: String!\n        description: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    expect(tableResource.Properties.GlobalSecondaryIndexes[0].KeySchema[0].AttributeName).toEqual('category');
    expect(tableResource.Properties.GlobalSecondaryIndexes[0].KeySchema[0].KeyType).toEqual('HASH');
    expect(tableResource.Properties.GlobalSecondaryIndexes[0].KeySchema[1].AttributeName).toEqual('createdAt');
    expect(tableResource.Properties.GlobalSecondaryIndexes[0].KeySchema[1].KeyType).toEqual('RANGE');
    expect(tableResource.Properties.AttributeDefinitions.find(function (ad) { return ad.AttributeName === 'email'; }).AttributeType).toEqual('S');
    expect(tableResource.Properties.AttributeDefinitions.find(function (ad) { return ad.AttributeName === 'category'; }).AttributeType).toEqual('S');
    expect(tableResource.Properties.AttributeDefinitions.find(function (ad) { return ad.AttributeName === 'createdAt'; }).AttributeType).toEqual('S');
    var schema = graphql_1.parse(out.schema);
    var queryType = schema.definitions.find(function (def) { return def.name && def.name.value === 'Query'; });
    var queryIndexField = queryType.fields.find(function (f) { return f.name && f.name.value === 'testsByCategory'; });
    expect(queryIndexField.arguments).toHaveLength(6);
    testUtil_1.expectArguments(queryIndexField, ['category', 'createdAt', 'filter', 'nextToken', 'limit', 'sortDirection']);
    // When using a complex primary key args are added to the list field. They are optional and if provided, will use a Query instead of a Scan.
    var listTestsField = queryType.fields.find(function (f) { return f.name && f.name.value === 'listTests'; });
    expect(listTestsField.arguments).toHaveLength(6);
    testUtil_1.expectArguments(listTestsField, ['email', 'createdAt', 'filter', 'nextToken', 'limit', 'sortDirection']);
    // Check the create, update, delete inputs.
    var createInput = schema.definitions.find(function (def) { return def.name && def.name.value === 'CreateTestInput'; });
    testUtil_1.expectNonNullFields(createInput, ['email', 'createdAt', 'category']);
    testUtil_1.expectNullableFields(createInput, ['description']);
    expect(createInput.fields).toHaveLength(4);
    var updateInput = schema.definitions.find(function (def) { return def.name && def.name.value === 'UpdateTestInput'; });
    testUtil_1.expectNonNullFields(updateInput, ['email', 'createdAt']);
    testUtil_1.expectNullableFields(updateInput, ['category', 'description']);
    expect(updateInput.fields).toHaveLength(4);
    var deleteInput = schema.definitions.find(function (def) { return def.name && def.name.value === 'DeleteTestInput'; });
    testUtil_1.expectNonNullFields(deleteInput, ['email', 'createdAt']);
    expect(deleteInput.fields).toHaveLength(2);
});
test('Test that a secondary @key with a multiple field adds an LSI.', function () {
    var validSchema = "\n    type Test \n        @model @key(fields: [\"email\", \"createdAt\"]) \n        @key(name: \"GSI_Email_UpdatedAt\", fields: [\"email\", \"updatedAt\"], queryField: \"testsByEmailByUpdatedAt\") {\n        email: String!\n        createdAt: String!\n        updatedAt: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    expect(tableResource.Properties.LocalSecondaryIndexes[0].KeySchema[0].AttributeName).toEqual('email');
    expect(tableResource.Properties.LocalSecondaryIndexes[0].KeySchema[0].KeyType).toEqual('HASH');
    expect(tableResource.Properties.LocalSecondaryIndexes[0].KeySchema[1].AttributeName).toEqual('updatedAt');
    expect(tableResource.Properties.LocalSecondaryIndexes[0].KeySchema[1].KeyType).toEqual('RANGE');
    expect(tableResource.Properties.AttributeDefinitions.find(function (ad) { return ad.AttributeName === 'email'; }).AttributeType).toEqual('S');
    expect(tableResource.Properties.AttributeDefinitions.find(function (ad) { return ad.AttributeName === 'updatedAt'; }).AttributeType).toEqual('S');
    expect(tableResource.Properties.AttributeDefinitions.find(function (ad) { return ad.AttributeName === 'createdAt'; }).AttributeType).toEqual('S');
    var schema = graphql_1.parse(out.schema);
    var queryType = schema.definitions.find(function (def) { return def.name && def.name.value === 'Query'; });
    var queryIndexField = queryType.fields.find(function (f) { return f.name && f.name.value === 'testsByEmailByUpdatedAt'; });
    expect(queryIndexField.arguments).toHaveLength(6);
    testUtil_1.expectArguments(queryIndexField, ['email', 'updatedAt', 'filter', 'nextToken', 'limit', 'sortDirection']);
    // When using a complex primary key args are added to the list field. They are optional and if provided, will use a Query instead of a Scan.
    var listTestsField = queryType.fields.find(function (f) { return f.name && f.name.value === 'listTests'; });
    expect(listTestsField.arguments).toHaveLength(6);
    testUtil_1.expectArguments(listTestsField, ['email', 'createdAt', 'filter', 'nextToken', 'limit', 'sortDirection']);
});
test('Test that a primary @key with complex fields will update the input objects.', function () {
    var validSchema = "\n    type Test @model @key(fields: [\"email\"]) {\n        email: String!\n        listInput: [String]\n        nonNullListInput: [String]!\n        nonNullListInputOfNonNullStrings: [String!]!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var tableResource = out.stacks.Test.Resources.TestTable;
    expect(tableResource).toBeDefined();
    expect(tableResource.Properties.KeySchema[0].AttributeName).toEqual('email');
    expect(tableResource.Properties.KeySchema[0].KeyType).toEqual('HASH');
    expect(tableResource.Properties.AttributeDefinitions[0].AttributeType).toEqual('S');
    var schema = graphql_1.parse(out.schema);
    var createInput = schema.definitions.find(function (def) { return def.name && def.name.value === 'CreateTestInput'; });
    var updateInput = schema.definitions.find(function (def) { return def.name && def.name.value === 'UpdateTestInput'; });
    var deleteInput = schema.definitions.find(function (def) { return def.name && def.name.value === 'DeleteTestInput'; });
    expect(createInput).toBeDefined();
    testUtil_1.expectNonNullInputValues(createInput, ['email', 'nonNullListInput', 'nonNullListInputOfNonNullStrings']);
    testUtil_1.expectNullableInputValues(createInput, ['listInput']);
    testUtil_1.expectInputValueToHandle(createInput, function (f) {
        if (f.name.value === 'nonNullListInputOfNonNullStrings') {
            return f.type.kind === graphql_1.Kind.NON_NULL_TYPE && f.type.type.kind === graphql_1.Kind.LIST_TYPE && f.type.type.type.kind === graphql_1.Kind.NON_NULL_TYPE;
        }
        else if (f.name.value === 'nonNullListInput') {
            return f.type.kind === graphql_1.Kind.NON_NULL_TYPE && f.type.type.kind === graphql_1.Kind.LIST_TYPE;
        }
        else if (f.name.value === 'listInput') {
            return f.type.kind === graphql_1.Kind.LIST_TYPE;
        }
        return true;
    });
    testUtil_1.expectNonNullInputValues(updateInput, ['email']);
    testUtil_1.expectNullableInputValues(updateInput, ['listInput', 'nonNullListInput', 'nonNullListInputOfNonNullStrings']);
    testUtil_1.expectInputValueToHandle(updateInput, function (f) {
        if (f.name.value === 'nonNullListInputOfNonNullStrings') {
            return f.type.kind === graphql_1.Kind.LIST_TYPE && f.type.type.kind === graphql_1.Kind.NON_NULL_TYPE;
        }
        else if (f.name.value === 'nonNullListInput') {
            return f.type.kind === graphql_1.Kind.LIST_TYPE;
        }
        else if (f.name.value === 'listInput') {
            return f.type.kind === graphql_1.Kind.LIST_TYPE;
        }
        return true;
    });
    testUtil_1.expectNonNullInputValues(deleteInput, ['email']);
});
//# sourceMappingURL=KeyTransformerLocal.e2e.test.js.map