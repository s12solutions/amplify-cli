"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var ModelConnectionTransformer_1 = require("../ModelConnectionTransformer");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_key_transformer_1 = require("graphql-key-transformer");
test('ModelConnectionTransformer should fail if connection was called on an object that is not a Model type.', function () {
    var validSchema = "\n    type Test {\n        id: ID!\n        email: String!\n        testObj: Test1 @connection(fields: [\"email\"])\n    }\n\n    type Test1 @model {\n        id: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer(),
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError("@connection must be on an @model object type field.");
});
test('ModelConnectionTransformer should fail if connection was with an object that is not a Model type.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        testObj: Test1 @connection(fields: [\"email\"])\n    }\n\n    type Test1 {\n        id: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError("Object type Test1 must be annotated with @model.");
});
test('ModelConnectionTransformer should fail if the field type where the directive is called is incorrect.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        testObj: Test2 @connection(fields: [\"email\"])\n    }\n\n    type Test1 @model {\n        id: iD!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError('Type "Test2" not found in document.');
});
test('ModelConnectionTransformer should fail if an empty list of fields is passed in.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String\n        testObj: Test1 @connection(fields: [])\n    }\n\n    type Test1 @model {\n        id: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError('No fields passed in to @connection directive.');
});
test('ModelConnectionTransformer should fail if any of the fields passed in are not in the Parent model.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String\n        testObj: [Test1] @connection(fields: [\"id\", \"name\"])\n    }\n\n    type Test1\n        @model\n        @key(fields: [\"id\", \"name\"])\n    {\n        id: ID!\n        friendID: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError('name is not a field in Test');
});
test('ModelConnectionTransformer should fail if the query is not run on the default table when connection is trying to connect a single object.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String\n        testObj: Test1 @connection(keyName: \"notDefault\", fields: [\"id\"])\n    }\n\n    type Test1\n        @model\n        @key(name: \"notDefault\", fields: [\"friendID\"])\n    {\n        id: ID!\n        friendID: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () {
        return transformer.transform(validSchema);
    }).toThrowError('Connection is to a single object but the keyName notDefault was provided which does not reference the default table.');
});
test('ModelConnectionTransformer should fail if keyName provided does not exist.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String\n        testObj: [Test1] @connection(keyName: \"notDefault\", fields: [\"id\"])\n    }\n\n    type Test1 @model {\n        id: ID!\n        friendID: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () {
        return transformer.transform(validSchema);
    }).toThrowError('Key notDefault does not exist for model Test1');
});
test('ModelConnectionTransformer should fail if first field does not match PK of table. (When using default table)', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        testObj: Test1 @connection(fields: [\"email\"])\n    }\n\n    type Test1 @model {\n        id: ID!\n        friendID: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () {
        return transformer.transform(validSchema);
    }).toThrowError('email field is not of type ID');
});
test('ModelConnectionTransformer should fail if sort key type passed in does not match default table sort key type.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        testObj: [Test1] @connection(fields: [\"id\", \"email\"])\n    }\n\n    type Test1\n        @model\n        @key(fields: [\"id\", \"friendID\"])\n    {\n        id: ID!\n        friendID: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError('email field is not of type ID');
});
test('ModelConnectionTransformer should fail if sort key type passed in does not match custom index sort key type.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        testObj: [Test1] @connection(keyName: \"testIndex\", fields: [\"id\", \"email\"])\n    }\n\n    type Test1\n        @model\n        @key(name: \"testIndex\", fields: [\"id\", \"friendID\"])\n    {\n        id: ID!\n        friendID: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError('email field is not of type ID');
});
test('ModelConnectionTransformer should fail if partition key type passed in does not match custom index partition key type.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        testObj: [Test1] @connection(keyName: \"testIndex\", fields: [\"email\", \"id\"])\n    }\n\n    type Test1\n        @model\n        @key(name: \"testIndex\", fields: [\"id\", \"friendID\"])\n    {\n        id: ID!\n        friendID: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { return transformer.transform(validSchema); }).toThrowError('email field is not of type ID');
});
test('Test ModelConnectionTransformer for One-to-One getItem case.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        otherHalf: Test1 @connection(fields: [\"id\", \"email\"])\n    }\n\n    type Test1\n        @model\n        @key(fields: [\"id\", \"email\"])\n    {\n        id: ID!\n        friendID: ID!\n        email: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Test', 'otherHalf')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var testObjType = getObjectType(schemaDoc, 'Test');
    expectFields(testObjType, ['otherHalf']);
    var relatedField = testObjType.fields.find(function (f) { return f.name.value === 'otherHalf'; });
    expect(relatedField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
});
test('Test ModelConnectionTransformer for One-to-Many query case.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        otherParts: [Test1] @connection(fields: [\"id\", \"email\"])\n    }\n\n    type Test1\n        @model\n        @key(fields: [\"id\", \"email\"])\n    {\n        id: ID!\n        friendID: ID!\n        email: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Test', 'otherParts')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var testObjType = getObjectType(schemaDoc, 'Test');
    expectFields(testObjType, ['otherParts']);
    var relatedField = testObjType.fields.find(function (f) { return f.name.value === 'otherParts'; });
    expect(relatedField.arguments.length).toEqual(4);
    expectArguments(relatedField, ['filter', 'limit', 'nextToken', 'sortDirection']);
    expect(relatedField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(relatedField.type.name.value).toEqual('ModelTest1Connection');
});
test('Test ModelConnectionTransformer for bidirectional One-to-Many query case.', function () {
    var validSchema = "\n    type Post\n        @model\n        @key(name: \"byOwner\", fields: [\"owner\", \"id\"])\n    {\n        id: ID!\n        title: String!\n        author: User @connection(fields: [\"owner\"])\n        owner: ID!\n    }\n    type User @model {\n        id: ID!\n        posts: [Post] @connection(keyName: \"byOwner\", fields: [\"id\"])\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'author')]).toBeTruthy();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('User', 'posts')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var userType = getObjectType(schemaDoc, 'User');
    expectFields(userType, ['posts']);
    var postsField = userType.fields.find(function (f) { return f.name.value === 'posts'; });
    expect(postsField.arguments.length).toEqual(5);
    expectArguments(postsField, ['id', 'filter', 'limit', 'nextToken', 'sortDirection']);
    expect(postsField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(postsField.type.name.value).toEqual('ModelPostConnection');
    var postType = getObjectType(schemaDoc, 'Post');
    expectFields(postType, ['author']);
    var userField = postType.fields.find(function (f) { return f.name.value === 'author'; });
    expect(userField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
});
test('Test ModelConnectionTransformer for One-to-Many query with a composite sort key.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        name: String!\n        otherParts: [Test1] @connection(fields: [\"id\", \"email\", \"name\"])\n    }\n\n    type Test1\n        @model\n        @key(fields: [\"id\", \"email\", \"name\"])\n    {\n        id: ID!\n        friendID: ID!\n        email: String!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Test', 'otherParts')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var testObjType = getObjectType(schemaDoc, 'Test');
    expectFields(testObjType, ['otherParts']);
    var relatedField = testObjType.fields.find(function (f) { return f.name.value === 'otherParts'; });
    expect(relatedField.arguments.length).toEqual(4);
    expectArguments(relatedField, ['filter', 'limit', 'nextToken', 'sortDirection']);
    expect(relatedField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(relatedField.type.name.value).toEqual('ModelTest1Connection');
});
test('Test ModelConnectionTransformer for One-to-Many query with a composite sort key passed in as an argument.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        name: String!\n        otherParts: [Test1] @connection(fields: [\"id\"])\n    }\n\n    type Test1\n        @model\n        @key(fields: [\"id\", \"email\", \"name\"])\n    {\n        id: ID!\n        friendID: ID!\n        email: String!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Test', 'otherParts')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var testObjType = getObjectType(schemaDoc, 'Test');
    expectFields(testObjType, ['otherParts']);
    var relatedField = testObjType.fields.find(function (f) { return f.name.value === 'otherParts'; });
    expect(relatedField.arguments.length).toEqual(5);
    expectArguments(relatedField, ['emailName', 'filter', 'limit', 'nextToken', 'sortDirection']);
    expect(relatedField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(relatedField.type.name.value).toEqual('ModelTest1Connection');
});
test('Test ModelConnectionTransformer for One-to-One getItem with composite sort key.', function () {
    var validSchema = "\n    type Test @model {\n        id: ID!\n        email: String!\n        name: String!\n        otherHalf: Test1 @connection(fields: [\"id\", \"email\", \"name\"])\n    }\n\n    type Test1\n        @model\n        @key(fields: [\"id\", \"email\", \"name\"])\n    {\n        id: ID!\n        friendID: ID!\n        email: String!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_key_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Test', 'otherHalf')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var testObjType = getObjectType(schemaDoc, 'Test');
    expectFields(testObjType, ['otherHalf']);
    var relatedField = testObjType.fields.find(function (f) { return f.name.value === 'otherHalf'; });
    expect(relatedField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
});
function getInputType(doc, type) {
    return doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === type; });
}
// Taken from ModelConnectionTransformer.test.ts
function getObjectType(doc, type) {
    return doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && def.name.value === type; });
}
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
function expectArguments(field, args) {
    var _loop_2 = function (argName) {
        var foundArg = field.arguments.find(function (a) { return a.name.value === argName; });
        expect(foundArg).toBeDefined();
    };
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var argName = args_1[_i];
        _loop_2(argName);
    }
}
//# sourceMappingURL=NewConnectionTransformer.test.js.map