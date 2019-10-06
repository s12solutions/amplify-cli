"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_elasticsearch_transformer_1 = require("graphql-elasticsearch-transformer");
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var graphql_http_transformer_1 = require("graphql-http-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var graphql_function_transformer_1 = require("graphql-function-transformer");
var testUtil_1 = require("../testUtil");
var userType = "\ntype User @model @auth(rules: [{ allow: owner }]) {\n    id: ID!\n    name: String\n    posts: [UserPost] @connection(name: \"UserPostsUser\")\n    profpic: String @http(url: \"https://www.profpic.org/this/is/a/fake/url\")\n}";
var userPostType = "\ntype UserPost @model {\n    id: ID!\n    user: User @connection(name: \"UserPostsUser\")\n    post: Post @connection(name: \"UserPostsPost\")\n}\n";
var postType = "\ntype Post @model @searchable {\n    id: ID!\n    name: String\n    authors: [UserPost] @connection(name: \"UserPostsPost\")\n    score: Int @function(name: \"scorefunc\")\n}\n";
/**
 * We test this schema with the same set of rules multiple times. This protects against a subtle bug in the stack mapping
 * that caused the order to impact the stack that a resource got mapped to.
 */
test('Test that every resource exists in the correct stack given a complex schema with overlapping names.', function () {
    var schema = [userType, userPostType, postType].join('\n');
    transpileAndCheck(schema);
});
test('Test that every resource exists in the correct stack given a complex schema with overlapping names. Rotation 1.', function () {
    var schema = [userPostType, postType, userType].join('\n');
    transpileAndCheck(schema);
});
test('Test that every resource exists in the correct stack given a complex schema with overlapping names. Rotation 2.', function () {
    var schema = [postType, userType, userPostType].join('\n');
    transpileAndCheck(schema);
});
function transpileAndCheck(schema) {
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.default(),
            new graphql_http_transformer_1.default(),
            new graphql_elasticsearch_transformer_1.default(),
            new graphql_connection_transformer_1.default(),
            new graphql_function_transformer_1.default,
            new graphql_auth_transformer_1.default({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: "AMAZON_COGNITO_USER_POOLS"
                    },
                    additionalAuthenticationProviders: []
                }
            }),
        ]
    });
    var out = transformer.transform(schema);
    // Check root
    testUtil_1.expectExactKeys(out.rootStack.Resources, new Set([
        'GraphQLAPI', 'GraphQLAPIKey', 'GraphQLSchema', 'User', 'UserPost',
        'Post', 'ConnectionStack', 'SearchableStack', 'FunctionDirectiveStack',
        'HttpStack', 'NoneDataSource'
    ]));
    testUtil_1.expectExactKeys(out.rootStack.Outputs, new Set(['GraphQLAPIIdOutput', 'GraphQLAPIEndpointOutput', 'GraphQLAPIKeyOutput']));
    // Check User
    testUtil_1.expectExactKeys(out.stacks.User.Resources, new Set([
        'UserTable', 'UserIAMRole', 'UserDataSource', 'GetUserResolver',
        'ListUserResolver', 'CreateUserResolver', 'UpdateUserResolver',
        'DeleteUserResolver', 'SubscriptiononCreateUserResolver', 'SubscriptiononDeleteUserResolver',
        'SubscriptiononUpdateUserResolver'
    ]));
    testUtil_1.expectExactKeys(out.stacks.User.Outputs, new Set(['GetAttUserTableStreamArn', 'GetAttUserDataSourceName', 'GetAttUserTableName']));
    // Check UserPost
    testUtil_1.expectExactKeys(out.stacks.UserPost.Resources, new Set([
        'UserPostTable', 'UserPostIAMRole', 'UserPostDataSource', 'GetUserPostResolver',
        'ListUserPostResolver', 'CreateUserPostResolver', 'UpdateUserPostResolver',
        'DeleteUserPostResolver'
    ]));
    testUtil_1.expectExactKeys(out.stacks.UserPost.Outputs, new Set(['GetAttUserPostTableStreamArn', 'GetAttUserPostDataSourceName', 'GetAttUserPostTableName']));
    // Check Post
    testUtil_1.expectExactKeys(out.stacks.Post.Resources, new Set([
        'PostTable', 'PostIAMRole', 'PostDataSource', 'GetPostResolver',
        'ListPostResolver', 'CreatePostResolver', 'UpdatePostResolver',
        'DeletePostResolver'
    ]));
    testUtil_1.expectExactKeys(out.stacks.Post.Outputs, new Set(['GetAttPostTableStreamArn', 'GetAttPostDataSourceName', 'GetAttPostTableName']));
    // Check SearchableStack
    testUtil_1.expectExactKeys(out.stacks.SearchableStack.Resources, new Set([
        'ElasticSearchAccessIAMRole', 'ElasticSearchDataSource', 'ElasticSearchDomain', 'ElasticSearchStreamingLambdaIAMRole',
        'ElasticSearchStreamingLambdaFunction', 'SearchablePostLambdaMapping', 'SearchPostResolver'
    ]));
    testUtil_1.expectExactKeys(out.stacks.SearchableStack.Outputs, new Set(['ElasticsearchDomainArn', 'ElasticsearchDomainEndpoint']));
    // Check connections
    testUtil_1.expectExactKeys(out.stacks.ConnectionStack.Resources, new Set(['UserpostsResolver', 'UserPostuserResolver', 'UserPostpostResolver', 'PostauthorsResolver']));
    testUtil_1.expectExactKeys(out.stacks.ConnectionStack.Outputs, new Set([]));
    // Check function stack
    testUtil_1.expectExactKeys(out.stacks.FunctionDirectiveStack.Resources, new Set(['ScorefuncLambdaDataSourceRole', 'ScorefuncLambdaDataSource', 'InvokeScorefuncLambdaDataSource', 'PostscoreResolver']));
    testUtil_1.expectExactKeys(out.stacks.ConnectionStack.Outputs, new Set([]));
    // Check http stack
    testUtil_1.expectExactKeys(out.stacks.HttpStack.Resources, new Set(['httpswwwprofpicorgDataSource', 'UserprofpicResolver']));
    testUtil_1.expectExactKeys(out.stacks.HttpStack.Outputs, new Set([]));
}
//# sourceMappingURL=TestComplexStackMappingsLocal.e2e.test.js.map