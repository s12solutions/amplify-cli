"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var ModelConnectionTransformer_1 = require("../ModelConnectionTransformer");
test('Test ModelConnectionTransformer simple one to many happy case', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    // Post.comments field
    var postType = getObjectType(schemaDoc, 'Post');
    expectFields(postType, ['comments']);
    var commentField = postType.fields.find(function (f) { return f.name.value === 'comments'; });
    expect(commentField.arguments.length).toEqual(4);
    expectArguments(commentField, ['filter', 'limit', 'nextToken', 'sortDirection']);
    expect(commentField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(commentField.type.name.value).toEqual('ModelCommentConnection');
    // Check the Comment.commentPostId
    // Check the Comment.commentPostId inputs
    var commentCreateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName('Comment'));
    var connectionId = commentCreateInput.fields.find(function (f) { return f.name.value === 'postCommentsId'; });
    expect(connectionId).toBeTruthy();
    var commentUpdateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName('Comment'));
    var connectionUpdateId = commentUpdateInput.fields.find(function (f) { return f.name.value === 'postCommentsId'; });
    expect(connectionUpdateId).toBeTruthy();
});
test('Test ModelConnectionTransformer simple one to many happy case with custom keyField', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(keyField: \"postId\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    // Post.comments field
    var postType = getObjectType(schemaDoc, 'Post');
    expectFields(postType, ['comments']);
    var commentField = postType.fields.find(function (f) { return f.name.value === 'comments'; });
    expect(commentField.arguments.length).toEqual(4);
    expectArguments(commentField, ['filter', 'limit', 'nextToken', 'sortDirection']);
    expect(commentField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(commentField.type.name.value).toEqual('ModelCommentConnection');
    // Check the Comment.commentPostId
    // Check the Comment.commentPostId inputs
    var commentCreateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName('Comment'));
    var connectionId = commentCreateInput.fields.find(function (f) { return f.name.value === 'postId'; });
    expect(connectionId).toBeTruthy();
    var commentUpdateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName('Comment'));
    var connectionUpdateId = commentUpdateInput.fields.find(function (f) { return f.name.value === 'postId'; });
    expect(connectionUpdateId).toBeTruthy();
});
test('Test ModelConnectionTransformer simple one to many happy case with custom keyField', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n        comments: [Comment] @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String!\n        post: Post! @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    // Post.comments field
    var postType = getObjectType(schemaDoc, 'Post');
    expectFields(postType, ['comments']);
    var commentField = postType.fields.find(function (f) { return f.name.value === 'comments'; });
    expect(commentField.arguments.length).toEqual(4);
    expectArguments(commentField, ['filter', 'limit', 'nextToken', 'sortDirection']);
    expect(commentField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(commentField.type.name.value).toEqual('ModelCommentConnection');
    // Check the Comment.commentPostId
    // Check the Comment.commentPostId inputs
    var commentCreateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName('Comment'));
    var connectionId = commentCreateInput.fields.find(function (f) { return f.name.value === 'postId'; });
    expect(connectionId).toBeTruthy();
    expect(connectionId.type.kind).toEqual(graphql_1.Kind.NON_NULL_TYPE);
    var commentUpdateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName('Comment'));
    var connectionUpdateId = commentUpdateInput.fields.find(function (f) { return f.name.value === 'postId'; });
    expect(connectionUpdateId).toBeTruthy();
    expect(connectionUpdateId.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
});
test('Test ModelConnectionTransformer complex one to many happy case', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(name: \"PostComments\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n        post: Post @connection(name: \"PostComments\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'post')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var postType = getObjectType(schemaDoc, 'Post');
    var commentType = getObjectType(schemaDoc, 'Comment');
    // Check Post.comments field
    expectFields(postType, ['comments']);
    var commentField = postType.fields.find(function (f) { return f.name.value === 'comments'; });
    expect(commentField.arguments.length).toEqual(4);
    expectArguments(commentField, ['filter', 'limit', 'nextToken', 'sortDirection']);
    expect(commentField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(commentField.type.name.value).toEqual('ModelCommentConnection');
    // Check the Comment.commentPostId inputs
    var commentCreateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName('Comment'));
    var connectionId = commentCreateInput.fields.find(function (f) { return f.name.value === 'commentPostId'; });
    expect(connectionId).toBeTruthy();
    var commentUpdateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName('Comment'));
    var connectionUpdateId = commentUpdateInput.fields.find(function (f) { return f.name.value === 'commentPostId'; });
    expect(connectionUpdateId).toBeTruthy();
    // Check Comment.post field
    var postField = commentType.fields.find(function (f) { return f.name.value === 'post'; });
    expect(postField.arguments.length).toEqual(0);
    expect(postField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(postField.type.name.value).toEqual('Post');
});
test('Test ModelConnectionTransformer many to many should fail', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(name: \"ManyToMany\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n        posts: [Post] @connection(name: \"ManyToMany\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    try {
        transformer.transform(validSchema);
        expect(true).toEqual(false);
    }
    catch (e) {
        // Should throw bc we don't let support many to many
        expect(e).toBeTruthy();
        expect(e.name).toEqual('InvalidDirectiveError');
    }
});
test('Test ModelConnectionTransformer many to many should fail due to missing other "name"', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(name: \"ManyToMany\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n\n        # This is meant to be the other half of \"ManyToMany\" but I forgot.\n        posts: [Post] @connection\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    try {
        transformer.transform(validSchema);
        expect(true).toEqual(false);
    }
    catch (e) {
        // Should throw bc we check both halves when name is given
        expect(e).toBeTruthy();
        expect(e.name).toEqual('InvalidDirectiveError');
    }
});
test('Test ModelConnectionTransformer many to many should fail due to missing other "name"', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        things: [Thing!] @connection\n    }\n\n    type Thing @model(queries: null, mutations: null) {\n        id: ID!\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'things')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    var postType = getObjectType(schemaDoc, 'Post');
    var postConnection = getObjectType(schemaDoc, 'ModelPostConnection');
    var thingConnection = getObjectType(schemaDoc, 'ModelThingConnection');
    var thingFilterInput = getInputType(schemaDoc, 'ModelThingFilterInput');
    expect(thingFilterInput).toBeDefined();
    expect(postType).toBeDefined();
    expect(thingConnection).toBeDefined();
    expect(postConnection).toBeDefined();
});
test('Test ModelConnectionTransformer with non null @connections', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        createdAt: String\n        updatedAt: String\n        comments: [Comment] @connection(name: \"PostComments\", keyField: \"postId\")\n\n        # A non null on the one in a 1-M does enforce a non-null\n        # on the CreatePostInput\n        singleComment: Comment! @connection\n\n        # A non null on the many in a 1-M does not enforce a non-null\n        # in the CommentCreateInput because it is not explicitly implied.\n        manyComments: [Comment]! @connection\n    }\n    type Comment @model {\n        id: ID!\n        content: String!\n\n        # A non-null on the one in 1-M again enforces a non null.\n        post: Post! @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    // Post.comments field
    var postType = getObjectType(schemaDoc, 'Post');
    expectFields(postType, ['comments']);
    var commentField = postType.fields.find(function (f) { return f.name.value === 'comments'; });
    expect(commentField.arguments.length).toEqual(4);
    expectArguments(commentField, ['filter', 'limit', 'nextToken', 'sortDirection']);
    expect(commentField.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    expect(commentField.type.name.value).toEqual('ModelCommentConnection');
    // Check the Comment.commentPostId
    // Check the Comment.commentPostId inputs
    var commentCreateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName('Comment'));
    var connectionId = commentCreateInput.fields.find(function (f) { return f.name.value === 'postId'; });
    expect(connectionId).toBeTruthy();
    expect(connectionId.type.kind).toEqual(graphql_1.Kind.NON_NULL_TYPE);
    var manyCommentId = commentCreateInput.fields.find(function (f) { return f.name.value === 'postManyCommentsId'; });
    expect(manyCommentId).toBeTruthy();
    expect(manyCommentId.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    var commentUpdateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName('Comment'));
    var connectionUpdateId = commentUpdateInput.fields.find(function (f) { return f.name.value === 'postId'; });
    expect(connectionUpdateId).toBeTruthy();
    expect(connectionUpdateId.type.kind).toEqual(graphql_1.Kind.NAMED_TYPE);
    // Check the post create type
    var postCreateInput = getInputType(schemaDoc, graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName('Post'));
    var postConnectionId = postCreateInput.fields.find(function (f) { return f.name.value === 'postSingleCommentId'; });
    expect(postConnectionId).toBeTruthy();
    expect(postConnectionId.type.kind).toEqual(graphql_1.Kind.NON_NULL_TYPE);
});
test('Test ModelConnectionTransformer with sortField fails if not specified in associated type', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(name: \"PostComments\", sortField: \"createdAt\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n        post: Post @connection(name: \"PostComments\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    expect(function () { transformer.transform(validSchema); }).toThrowError();
});
test('Test ModelConnectionTransformer with sortField creates a connection resolver with a sort key condition.', function () {
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(name: \"PostComments\", sortField: \"createdAt\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n        post: Post @connection(name: \"PostComments\", sortField: \"createdAt\")\n        createdAt: AWSDateTime\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.stacks.ConnectionStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy();
    var schemaDoc = graphql_1.parse(out.schema);
    // Post.comments field
    var postType = getObjectType(schemaDoc, 'Post');
    expectFields(postType, ['comments']);
    var commentField = postType.fields.find(function (f) { return f.name.value === 'comments'; });
    expect(commentField.arguments.length).toEqual(5);
    expectArguments(commentField, ['createdAt', 'filter', 'limit', 'nextToken', 'sortDirection']);
});
test('Test ModelConnectionTransformer throws with invalid key fields', function () {
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var invalidSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(keyField: \"postId\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n\n        # Key fields must be String or ID.\n        postId: [String]\n    }\n    ";
    expect(function () { return transformer.transform(invalidSchema); }).toThrow();
    var invalidSchema2 = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n\n        # Key fields must be String or ID.\n        postId: [String]\n\n        post: Post @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    ";
    expect(function () { return transformer.transform(invalidSchema2); }).toThrow();
    var invalidSchema3 = "\n    type Post @model {\n        id: ID!\n        title: String!\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n\n        # Key fields must be String or ID.\n        postId: [String]\n\n        post: Post @connection(keyField: \"postId\")\n    }\n    ";
    expect(function () { return transformer.transform(invalidSchema3); }).toThrow();
});
test('Test ModelConnectionTransformer does not throw with valid key fields', function () {
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new ModelConnectionTransformer_1.ModelConnectionTransformer()
        ]
    });
    var validSchema = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(keyField: \"postId\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n\n        # Key fields must be String or ID.\n        postId: String\n    }\n    ";
    expect(function () { return transformer.transform(validSchema); }).toBeTruthy();
    var validSchema2 = "\n    type Post @model {\n        id: ID!\n        title: String!\n        comments: [Comment] @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n\n        # Key fields must be String or ID.\n        postId: ID\n\n        post: Post @connection(name: \"PostComments\", keyField: \"postId\")\n    }\n    ";
    expect(function () { return transformer.transform(validSchema2); }).toBeTruthy();
    var validSchema3 = "\n    type Post @model {\n        id: ID!\n        title: String!\n    }\n    type Comment @model {\n        id: ID!\n        content: String\n\n        # Key fields must be String or ID.\n        postId: String\n\n        post: Post @connection(keyField: \"postId\")\n    }\n    ";
    expect(function () { return transformer.transform(validSchema3); }).toBeTruthy();
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
function doNotExpectFields(type, fields) {
    var _loop_3 = function (fieldName) {
        expect(type.fields.find(function (f) { return f.name.value === fieldName; })).toBeUndefined();
    };
    for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
        var fieldName = fields_2[_i];
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
    return doc.definitions.filter(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === type; }).length === count;
}
//# sourceMappingURL=ModelConnectionTransformer.test.js.map