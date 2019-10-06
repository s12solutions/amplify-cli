"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var DynamoDBModelTransformer_1 = require("../DynamoDBModelTransformer");
test('Test DynamoDBModelTransformer validation happy case', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
});
test('Test DynamoDBModelTransformer with query overrides', function () {
    var validSchema = "type Post @model(queries: { get: \"customGetPost\", list: \"customListPost\" }) {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var createPostInput = getInputType(parsed, 'CreatePostInput');
    expectFieldsOnInputType(createPostInput, ['id', 'title', 'createdAt', 'updatedAt']);
    // This id should always be optional.
    // aka a named type node aka name.value would not be set if it were a non null node
    var idField = createPostInput.fields.find(function (f) { return f.name.value === 'id'; });
    expect(idField.type.name.value).toEqual('ID');
    var queryType = getObjectType(parsed, 'Query');
    expect(queryType).toBeDefined();
    expectFields(queryType, ['customGetPost']);
    expectFields(queryType, ['customListPost']);
    var subscriptionType = getObjectType(parsed, 'Subscription');
    expect(subscriptionType).toBeDefined();
    expectFields(subscriptionType, ['onCreatePost', 'onUpdatePost', 'onDeletePost']);
    var subField = subscriptionType.fields.find(function (f) { return f.name.value === 'onCreatePost'; });
    expect(subField.directives.length).toEqual(1);
    expect(subField.directives[0].name.value).toEqual('aws_subscribe');
});
test('Test DynamoDBModelTransformer with mutation overrides', function () {
    var validSchema = "type Post @model(mutations: { create: \"customCreatePost\", update: \"customUpdatePost\", delete: \"customDeletePost\" }) {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var mutationType = getObjectType(parsed, 'Mutation');
    expect(mutationType).toBeDefined();
    expectFields(mutationType, ['customCreatePost', 'customUpdatePost', 'customDeletePost']);
});
test('Test DynamoDBModelTransformer with only create mutations', function () {
    var validSchema = "type Post @model(mutations: { create: \"customCreatePost\" }) {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var mutationType = getObjectType(parsed, 'Mutation');
    expect(mutationType).toBeDefined();
    expectFields(mutationType, ['customCreatePost']);
    doNotExpectFields(mutationType, ['updatePost']);
});
test('Test DynamoDBModelTransformer with multiple model directives', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n\n    type User @model {\n        id: ID!\n        name: String!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var queryType = getObjectType(parsed, 'Query');
    expect(queryType).toBeDefined();
    expectFields(queryType, ['listPosts']);
    expectFields(queryType, ['listUsers']);
    var stringInputType = getInputType(parsed, 'ModelStringFilterInput');
    expect(stringInputType).toBeDefined();
    var booleanInputType = getInputType(parsed, 'ModelBooleanFilterInput');
    expect(booleanInputType).toBeDefined();
    var intInputType = getInputType(parsed, 'ModelIntFilterInput');
    expect(intInputType).toBeDefined();
    var floatInputType = getInputType(parsed, 'ModelFloatFilterInput');
    expect(floatInputType).toBeDefined();
    var idInputType = getInputType(parsed, 'ModelIDFilterInput');
    expect(idInputType).toBeDefined();
    var postInputType = getInputType(parsed, 'ModelPostFilterInput');
    expect(postInputType).toBeDefined();
    var userInputType = getInputType(parsed, 'ModelUserFilterInput');
    expect(userInputType).toBeDefined();
    expect(verifyInputCount(parsed, 'ModelStringFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelBooleanFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelIntFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelFloatFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelIDFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelPostFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelUserFilterInput', 1)).toBeTruthy();
});
test('Test DynamoDBModelTransformer with filter', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var queryType = getObjectType(parsed, 'Query');
    expect(queryType).toBeDefined();
    expectFields(queryType, ['listPosts']);
    var connectionType = getObjectType(parsed, 'ModelPostConnection');
    expect(connectionType).toBeDefined();
    expect(verifyInputCount(parsed, 'ModelStringFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelBooleanFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelIntFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelFloatFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelIDFilterInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'ModelPostFilterInput', 1)).toBeTruthy();
});
test('Test DynamoDBModelTransformer with mutations set to null', function () {
    var validSchema = "type Post @model(mutations: null) {\n          id: ID!\n          title: String!\n          createdAt: String\n          updatedAt: String\n      }\n      ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [new DynamoDBModelTransformer_1.DynamoDBModelTransformer()]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var mutationType = getObjectType(parsed, 'Mutation');
    expect(mutationType).not.toBeDefined();
});
test('Test DynamoDBModelTransformer with queries set to null', function () {
    var validSchema = "type Post @model(queries: null) {\n          id: ID!\n          title: String!\n          createdAt: String\n          updatedAt: String\n      }\n      ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [new DynamoDBModelTransformer_1.DynamoDBModelTransformer()]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var mutationType = getObjectType(parsed, 'Mutation');
    expect(mutationType).toBeDefined();
    var queryType = getObjectType(parsed, 'Query');
    expect(queryType).not.toBeDefined();
});
test('Test DynamoDBModelTransformer with subscriptions set to null', function () {
    var validSchema = "type Post @model(subscriptions: null) {\n          id: ID!\n          title: String!\n          createdAt: String\n          updatedAt: String\n      }\n      ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [new DynamoDBModelTransformer_1.DynamoDBModelTransformer()]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var mutationType = getObjectType(parsed, 'Mutation');
    expect(mutationType).toBeDefined();
    var queryType = getObjectType(parsed, 'Query');
    expect(queryType).toBeDefined();
    var subscriptionType = getObjectType(parsed, 'Subscription');
    expect(subscriptionType).not.toBeDefined();
});
test('Test DynamoDBModelTransformer with queries and mutations set to null', function () {
    var validSchema = "type Post @model(queries: null, mutations: null, subscriptions: null) {\n          id: ID!\n          title: String!\n          createdAt: String\n          updatedAt: String\n      }\n      ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [new DynamoDBModelTransformer_1.DynamoDBModelTransformer()]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var mutationType = getObjectType(parsed, 'Mutation');
    expect(mutationType).not.toBeDefined();
    var queryType = getObjectType(parsed, 'Query');
    expect(queryType).not.toBeDefined();
    var subscriptionType = getObjectType(parsed, 'Subscription');
    expect(subscriptionType).not.toBeDefined();
});
test('Test DynamoDBModelTransformer with advanced subscriptions', function () {
    var validSchema = "type Post @model(subscriptions: {\n            onCreate: [\"onFeedUpdated\", \"onCreatePost\"],\n            onUpdate: [\"onFeedUpdated\"],\n            onDelete: [\"onFeedUpdated\"]\n        }) {\n          id: ID!\n          title: String!\n          createdAt: String\n          updatedAt: String\n      }\n      ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [new DynamoDBModelTransformer_1.DynamoDBModelTransformer()]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var subscriptionType = getObjectType(parsed, 'Subscription');
    expect(subscriptionType).toBeDefined();
    expectFields(subscriptionType, ['onFeedUpdated', 'onCreatePost']);
    var subField = subscriptionType.fields.find(function (f) { return f.name.value === 'onFeedUpdated'; });
    expect(subField.directives.length).toEqual(1);
    expect(subField.directives[0].name.value).toEqual('aws_subscribe');
    var mutationsList = subField.directives[0].arguments.find(function (a) { return a.name.value === 'mutations'; }).value;
    var mutList = mutationsList.values.map(function (v) { return v.value; });
    expect(mutList.length).toEqual(3);
    expect(mutList).toContain('createPost');
    expect(mutList).toContain('updatePost');
    expect(mutList).toContain('deletePost');
});
test('Test DynamoDBModelTransformer with non-model types and enums', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n        metadata: [PostMetadata!]!\n        appearsIn: [Episode]!\n    }\n    type PostMetadata {\n        tags: Tag\n    }\n    type Tag {\n        published: Boolean\n        metadata: PostMetadata\n    }\n    enum Episode {\n        NEWHOPE\n        EMPIRE\n        JEDI\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var postMetaDataInputType = getInputType(parsed, 'PostMetadataInput');
    expect(postMetaDataInputType).toBeDefined();
    var tagInputType = getInputType(parsed, 'TagInput');
    expect(tagInputType).toBeDefined();
    expectFieldsOnInputType(tagInputType, ['metadata']);
    var createPostInputType = getInputType(parsed, 'CreatePostInput');
    expectFieldsOnInputType(createPostInputType, ['metadata', 'appearsIn']);
    var updatePostInputType = getInputType(parsed, 'UpdatePostInput');
    expectFieldsOnInputType(updatePostInputType, ['metadata', 'appearsIn']);
    var postModelObject = getObjectType(parsed, 'Post');
    var postMetaDataInputField = getFieldOnInputType(createPostInputType, 'metadata');
    var postMetaDataField = getFieldOnObjectType(postModelObject, 'metadata');
    // this checks that the non-model type was properly "unwrapped", renamed, and "rewrapped"
    // in the generated CreatePostInput type - its types should be the same as in the Post @model type
    verifyMatchingTypes(postMetaDataInputField.type, postMetaDataField.type);
    expect(verifyInputCount(parsed, 'PostMetadataInput', 1)).toBeTruthy();
    expect(verifyInputCount(parsed, 'TagInput', 1)).toBeTruthy();
});
test('Test DynamoDBModelTransformer with mutation input overrides when mutations are disabled', function () {
    var validSchema = "type Post @model(mutations: null) {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n    input CreatePostInput {\n        different: String\n    }\n    input UpdatePostInput {\n        different2: String\n    }\n    input DeletePostInput {\n        different3: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var createPostInput = getInputType(parsed, 'CreatePostInput');
    expectFieldsOnInputType(createPostInput, ['different']);
    var updatePostInput = getInputType(parsed, 'UpdatePostInput');
    expectFieldsOnInputType(updatePostInput, ['different2']);
    var deletePostInput = getInputType(parsed, 'DeletePostInput');
    expectFieldsOnInputType(deletePostInput, ['different3']);
});
test('Test DynamoDBModelTransformer with mutation input overrides when mutations are enabled', function () {
    var validSchema = "type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n    }\n    # User defined types always take precedence.\n    input CreatePostInput {\n        different: String\n    }\n    input UpdatePostInput {\n        different2: String\n    }\n    input DeletePostInput {\n        different3: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new DynamoDBModelTransformer_1.DynamoDBModelTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var definition = out.schema;
    expect(definition).toBeDefined();
    var parsed = graphql_1.parse(definition);
    var createPostInput = getInputType(parsed, 'CreatePostInput');
    expectFieldsOnInputType(createPostInput, ['different']);
    var updatePostInput = getInputType(parsed, 'UpdatePostInput');
    expectFieldsOnInputType(updatePostInput, ['different2']);
    var deletePostInput = getInputType(parsed, 'DeletePostInput');
    expectFieldsOnInputType(deletePostInput, ['different3']);
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
function expectFieldsOnInputType(type, fields) {
    var _loop_2 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
    };
    for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
        var fieldName = fields_2[_i];
        _loop_2(fieldName);
    }
}
function getFieldOnInputType(type, field) {
    return type.fields.find(function (f) { return f.name.value === field; });
}
function getFieldOnObjectType(type, field) {
    return type.fields.find(function (f) { return f.name.value === field; });
}
function doNotExpectFields(type, fields) {
    var _loop_3 = function (fieldName) {
        expect(type.fields.find(function (f) { return f.name.value === fieldName; })).toBeUndefined();
    };
    for (var _i = 0, fields_3 = fields; _i < fields_3.length; _i++) {
        var fieldName = fields_3[_i];
        _loop_3(fieldName);
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
function verifyMatchingTypes(t1, t2) {
    if (t1.kind !== t2.kind) {
        return false;
    }
    if (t1.kind !== graphql_1.Kind.NAMED_TYPE &&
        t2.kind !== graphql_1.Kind.NAMED_TYPE) {
        verifyMatchingTypes(t1.type, t2.type);
    }
    else {
        return false;
    }
}
//# sourceMappingURL=DynamoDBModelTransformer.test.js.map