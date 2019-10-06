"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_amplify_1 = require("aws-amplify");
var aws_appsync_1 = require("aws-appsync");
var graphql_tag_1 = require("graphql-tag");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var graphql_key_transformer_1 = require("graphql-key-transformer");
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var fs = require("fs");
var CloudFormationClient_1 = require("../CloudFormationClient");
var CognitoClient = require("aws-sdk/clients/cognitoidentityserviceprovider");
var S3 = require("aws-sdk/clients/s3");
var S3Client_1 = require("../S3Client");
var path = require("path");
var deployNestedStacks_1 = require("../deployNestedStacks");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var cognitoUtils_1 = require("../cognitoUtils");
var role_1 = require("cloudform-types/types/iam/role");
var userPoolClient_1 = require("cloudform-types/types/cognito/userPoolClient");
var identityPool_1 = require("cloudform-types/types/cognito/identityPool");
var identityPoolRoleAttachment_1 = require("cloudform-types/types/cognito/identityPoolRoleAttachment");
var AWS = require("aws-sdk");
// to deal with bug in cognito-identity-js
global.fetch = require("node-fetch");
// To overcome of the way of how AmplifyJS picks up currentUserCredentials
var anyAWS = AWS;
if (anyAWS && anyAWS.config && anyAWS.config.credentials) {
    delete anyAWS.config.credentials;
}
jest.setTimeout(2000000);
var REGION = 'us-west-2';
var cf = new CloudFormationClient_1.CloudFormationClient(REGION);
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "MultiAuthModelAuthTransformerTest-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-multi-auth-transformer-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/multi_auth_model_auth_transform_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
var AUTH_ROLE_NAME = STACK_NAME + "-authRole";
var UNAUTH_ROLE_NAME = STACK_NAME + "-unauthRole";
var IDENTITY_POOL_NAME = "MultiAuthModelAuthTransformerTest_" + BUILD_TIMESTAMP + "_identity_pool";
var USER_POOL_CLIENTWEB_NAME = "multiauth_" + BUILD_TIMESTAMP + "_clientweb";
var USER_POOL_CLIENT_NAME = "multiauth_" + BUILD_TIMESTAMP + "_client";
var GRAPHQL_ENDPOINT = undefined;
var APIKEY_GRAPHQL_CLIENT = undefined;
var USER_POOL_AUTH_CLIENT = undefined;
var IAM_UNAUTHCLIENT = undefined;
var USER_POOL_ID = undefined;
var USERNAME1 = 'user1@test.com';
var TMP_PASSWORD = 'Password123!';
var REAL_PASSWORD = 'Password1234!';
var cognitoClient = new CognitoClient({ apiVersion: '2016-04-19', region: REGION });
var customS3Client = new S3Client_1.S3Client(REGION);
var awsS3Client = new S3({ region: REGION });
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
function deleteDirectory(directory) {
    var files = fs.readdirSync(directory);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var contentPath = path.join(directory, file);
        if (fs.lstatSync(contentPath).isDirectory()) {
            deleteDirectory(contentPath);
            fs.rmdirSync(contentPath);
        }
        else {
            fs.unlinkSync(contentPath);
        }
    }
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, e_1, userPoolResponse, userPoolClientResponse, userPoolClientId, out, authRole, unauthRole, identityPool, identityPoolRoleMap, userPoolClientWeb, userPoolClient, _i, _a, key, _b, _c, stackKey, stack, _d, _e, key, params, finishedStack, getApiEndpoint, getApiKey, apiKey, getIdentityPoolId, identityPoolId, unauthCredentials, authRes, idToken_1, e_2;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                validSchema = "\n    # Allow anyone to access. This is translated into API_KEY.\n    type PostPublic @model @auth(rules: [{ allow: public }]) {\n        id: ID!\n        title: String\n    }\n\n    # Allow anyone to access. This is translated to IAM with unauth role.\n    type PostPublicIAM @model @auth(rules: [{ allow: public, provider: iam }]) {\n        id: ID!\n        title: String\n    }\n\n    # Allow anyone with a valid Amazon Cognito UserPools JWT to access.\n    type PostPrivate @model @auth(rules: [{ allow: private }]) {\n        id: ID!\n        title: String\n    }\n\n    # Allow anyone with a sigv4 signed request with relevant policy to access.\n    type PostPrivateIAM @model @auth(rules: [{ allow: private, provider: iam }]) {\n        id: ID!\n        title: String\n    }\n\n    # I have a model that is protected by userPools by default.\n    # I want to call createPost from my lambda.\n    type PostOwnerIAM @model\n    @auth (\n        rules: [\n            # The cognito user pool owner can CRUD.\n            { allow: owner },\n            # A lambda function using IAM can call Mutation.createPost.\n            { allow: private, provider: iam, operations: [create] }\n        ]\n    )\n    {\n        id: ID!\n        title: String\n        owner: String\n    }\n\n    type PostSecretFieldIAM @model\n    @auth (\n        rules: [\n            # The cognito user pool and can CRUD.\n            { allow: private }\n        ]\n    )\n    {\n        id: ID!\n        title: String\n        owner: String\n        secret: String\n            @auth (\n                rules: [\n                    # Only a lambda function using IAM can create/update this field\n                    { allow: private, provider: iam, operations: [create, update] }\n                ]\n            )\n    }\n\n    type PostConnection @model @auth(rules:[{allow: public}]){\n        id: ID!\n        title: String!\n        comments: [CommentConnection] @connection(name: \"PostComments\")\n    }\n\n    type CommentConnection @model {\n        id: ID!\n        content: String!\n        post: PostConnection @connection(name: \"PostComments\")\n    }\n\n    type PostIAMWithKeys @model\n    @auth (\n        rules: [\n            # API Key can CRUD\n            { allow: public }\n            # IAM can read\n            { allow: public, provider: iam, operations: [read] }\n        ]\n    )\n    @key (name: \"byDate\", fields: [\"type\", \"date\"], queryField: \"getPostIAMWithKeysByDate\")\n    {\n        id: ID!\n        title: String\n        type: String\n        date: AWSDateTime\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_connection_transformer_1.default(),
                        new graphql_key_transformer_1.default(),
                        new graphql_auth_transformer_1.default({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: 'AMAZON_COGNITO_USER_POOLS'
                                },
                                additionalAuthenticationProviders: [
                                    {
                                        authenticationType: 'API_KEY',
                                        apiKeyConfig: {
                                            description: 'E2E Test API Key',
                                            apiKeyExpirationDays: 300
                                        }
                                    },
                                    {
                                        authenticationType: 'AWS_IAM'
                                    },
                                ],
                            }
                        })
                    ]
                });
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 4]);
                return [4 /*yield*/, awsS3Client.createBucket({ Bucket: BUCKET_NAME }).promise()];
            case 2:
                _f.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _f.sent();
                console.error("Failed to create bucket: " + e_1);
                return [3 /*break*/, 4];
            case 4: return [4 /*yield*/, cognitoUtils_1.createUserPool(cognitoClient, "UserPool" + STACK_NAME)];
            case 5:
                userPoolResponse = _f.sent();
                USER_POOL_ID = userPoolResponse.UserPool.Id;
                return [4 /*yield*/, cognitoUtils_1.createUserPoolClient(cognitoClient, USER_POOL_ID, "UserPool" + STACK_NAME)];
            case 6:
                userPoolClientResponse = _f.sent();
                userPoolClientId = userPoolClientResponse.UserPoolClient.ClientId;
                _f.label = 7;
            case 7:
                _f.trys.push([7, 12, , 13]);
                out = transformer.transform(validSchema);
                authRole = new role_1.default({
                    RoleName: AUTH_ROLE_NAME,
                    AssumeRolePolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Sid: '',
                                Effect: 'Allow',
                                Principal: {
                                    Federated: 'cognito-identity.amazonaws.com'
                                },
                                Action: 'sts:AssumeRoleWithWebIdentity',
                                Condition: {
                                    'ForAnyValue:StringLike': {
                                        'cognito-identity.amazonaws.com:amr': 'authenticated'
                                    }
                                }
                            }
                        ]
                    }
                });
                unauthRole = new role_1.default({
                    RoleName: UNAUTH_ROLE_NAME,
                    AssumeRolePolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Sid: '',
                                Effect: 'Allow',
                                Principal: {
                                    Federated: 'cognito-identity.amazonaws.com'
                                },
                                Action: 'sts:AssumeRoleWithWebIdentity',
                                Condition: {
                                    'ForAnyValue:StringLike': {
                                        'cognito-identity.amazonaws.com:amr': 'unauthenticated'
                                    }
                                }
                            }
                        ]
                    },
                    Policies: [
                        new role_1.default.Policy({
                            PolicyName: 'appsync-unauthrole-policy',
                            PolicyDocument: {
                                Version: '2012-10-17',
                                Statement: [
                                    {
                                        Effect: 'Allow',
                                        Action: [
                                            'appsync:GraphQL'
                                        ],
                                        Resource: [{
                                                'Fn::Join': [
                                                    '',
                                                    [
                                                        'arn:aws:appsync:',
                                                        { Ref: 'AWS::Region' },
                                                        ':',
                                                        { Ref: 'AWS::AccountId' },
                                                        ':apis/',
                                                        {
                                                            'Fn::GetAtt': [
                                                                'GraphQLAPI',
                                                                'ApiId'
                                                            ]
                                                        },
                                                        '/*',
                                                    ],
                                                ],
                                            }],
                                    }
                                ],
                            },
                        }),
                    ]
                });
                identityPool = new identityPool_1.default({
                    IdentityPoolName: IDENTITY_POOL_NAME,
                    CognitoIdentityProviders: [
                        {
                            ClientId: {
                                Ref: 'UserPoolClient'
                            },
                            ProviderName: {
                                'Fn::Sub': [
                                    'cognito-idp.${region}.amazonaws.com/${client}',
                                    {
                                        'region': {
                                            Ref: 'AWS::Region'
                                        },
                                        'client': USER_POOL_ID
                                    }
                                ]
                            }
                        },
                        {
                            ClientId: {
                                Ref: 'UserPoolClientWeb'
                            },
                            ProviderName: {
                                'Fn::Sub': [
                                    'cognito-idp.${region}.amazonaws.com/${client}',
                                    {
                                        'region': {
                                            Ref: 'AWS::Region'
                                        },
                                        'client': USER_POOL_ID
                                    }
                                ]
                            }
                        },
                    ],
                    AllowUnauthenticatedIdentities: true
                });
                identityPoolRoleMap = new identityPoolRoleAttachment_1.default({
                    IdentityPoolId: { Ref: 'IdentityPool' },
                    Roles: {
                        'unauthenticated': { 'Fn::GetAtt': ['UnauthRole', 'Arn'] },
                        'authenticated': { 'Fn::GetAtt': ['AuthRole', 'Arn'] }
                    }
                });
                userPoolClientWeb = new userPoolClient_1.default({
                    ClientName: USER_POOL_CLIENTWEB_NAME,
                    RefreshTokenValidity: 30,
                    UserPoolId: USER_POOL_ID
                });
                userPoolClient = new userPoolClient_1.default({
                    ClientName: USER_POOL_CLIENT_NAME,
                    GenerateSecret: true,
                    RefreshTokenValidity: 30,
                    UserPoolId: USER_POOL_ID
                });
                out.rootStack.Resources.IdentityPool = identityPool;
                out.rootStack.Resources.IdentityPoolRoleMap = identityPoolRoleMap;
                out.rootStack.Resources.UserPoolClientWeb = userPoolClientWeb;
                out.rootStack.Resources.UserPoolClient = userPoolClient;
                out.rootStack.Outputs.IdentityPoolId = { Value: { Ref: 'IdentityPool' } };
                out.rootStack.Outputs.IdentityPoolName = { Value: { 'Fn::GetAtt': ['IdentityPool', 'Name'] } };
                out.rootStack.Resources.AuthRole = authRole;
                out.rootStack.Outputs.AuthRoleArn = { Value: { 'Fn::GetAtt': ['AuthRole', 'Arn'] } };
                out.rootStack.Resources.UnauthRole = unauthRole;
                out.rootStack.Outputs.UnauthRoleArn = { Value: { 'Fn::GetAtt': ['UnauthRole', 'Arn'] } };
                // Since we're doing the policy here we've to remove the transformer generated artifacts from
                // the generated stack.
                delete out.rootStack.Resources[graphql_transformer_common_1.ResourceConstants.RESOURCES.UnauthRolePolicy];
                delete out.rootStack.Parameters.unauthRoleName;
                delete out.rootStack.Resources[graphql_transformer_common_1.ResourceConstants.RESOURCES.AuthRolePolicy];
                delete out.rootStack.Parameters.authRoleName;
                for (_i = 0, _a = Object.keys(out.rootStack.Resources); _i < _a.length; _i++) {
                    key = _a[_i];
                    if (out.rootStack.Resources[key].Properties &&
                        out.rootStack.Resources[key].Properties.Parameters &&
                        out.rootStack.Resources[key].Properties.Parameters.unauthRoleName) {
                        delete out.rootStack.Resources[key].Properties.Parameters.unauthRoleName;
                    }
                    if (out.rootStack.Resources[key].Properties &&
                        out.rootStack.Resources[key].Properties.Parameters &&
                        out.rootStack.Resources[key].Properties.Parameters.authRoleName) {
                        delete out.rootStack.Resources[key].Properties.Parameters.authRoleName;
                    }
                }
                for (_b = 0, _c = Object.keys(out.stacks); _b < _c.length; _b++) {
                    stackKey = _c[_b];
                    stack = out.stacks[stackKey];
                    for (_d = 0, _e = Object.keys(stack.Resources); _d < _e.length; _d++) {
                        key = _e[_d];
                        if (stack.Parameters &&
                            stack.Parameters.unauthRoleName) {
                            delete stack.Parameters.unauthRoleName;
                        }
                        if (stack.Parameters &&
                            stack.Parameters.authRoleName) {
                            delete stack.Parameters.authRoleName;
                        }
                        if (stack.Resources[key].Properties &&
                            stack.Resources[key].Properties.Parameters &&
                            stack.Resources[key].Properties.Parameters.unauthRoleName) {
                            delete stack.Resources[key].Properties.Parameters.unauthRoleName;
                        }
                        if (stack.Resources[key].Properties &&
                            stack.Resources[key].Properties.Parameters &&
                            stack.Resources[key].Properties.Parameters.authRoleName) {
                            delete stack.Resources[key].Properties.Parameters.authRoleName;
                        }
                    }
                }
                params = {
                    CreateAPIKey: '1',
                    AuthCognitoUserPoolId: USER_POOL_ID
                };
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, params, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)];
            case 8:
                finishedStack = _f.sent();
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                GRAPHQL_ENDPOINT = getApiEndpoint(finishedStack.Outputs);
                console.log("Using graphql url: " + GRAPHQL_ENDPOINT);
                apiKey = getApiKey(finishedStack.Outputs);
                console.log("API KEY: " + apiKey);
                expect(apiKey).toBeTruthy();
                getIdentityPoolId = outputValueSelector('IdentityPoolId');
                identityPoolId = getIdentityPoolId(finishedStack.Outputs);
                expect(identityPoolId).toBeTruthy();
                console.log("Identity Pool Id: " + identityPoolId);
                console.log("User pool Id: " + USER_POOL_ID);
                console.log("User pool ClientId: " + userPoolClientId);
                // Verify we have all the details
                expect(GRAPHQL_ENDPOINT).toBeTruthy();
                expect(USER_POOL_ID).toBeTruthy();
                expect(userPoolClientId).toBeTruthy();
                // Configure Amplify, create users, and sign in.
                cognitoUtils_1.configureAmplify(USER_POOL_ID, userPoolClientId, identityPoolId);
                return [4 /*yield*/, aws_amplify_1.Auth.currentCredentials()];
            case 9:
                unauthCredentials = _f.sent();
                IAM_UNAUTHCLIENT = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: REGION,
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.AWS_IAM,
                        credentials: {
                            accessKeyId: unauthCredentials.accessKeyId,
                            secretAccessKey: unauthCredentials.secretAccessKey
                        }
                    },
                    offlineConfig: {
                        keyPrefix: 'iam'
                    },
                    disableOffline: true,
                });
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 10:
                authRes = _f.sent();
                idToken_1 = authRes.getIdToken().getJwtToken();
                USER_POOL_AUTH_CLIENT = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: REGION,
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                        jwtToken: function () { return idToken_1; }
                    },
                    offlineConfig: {
                        keyPrefix: 'userPools'
                    },
                    disableOffline: true,
                });
                APIKEY_GRAPHQL_CLIENT = new aws_appsync_1.default({
                    url: GRAPHQL_ENDPOINT,
                    region: REGION,
                    auth: {
                        type: aws_appsync_1.AUTH_TYPE.API_KEY,
                        apiKey: apiKey
                    },
                    offlineConfig: {
                        keyPrefix: 'apikey'
                    },
                    disableOffline: true,
                });
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, 5000); })];
            case 11:
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                _f.sent();
                return [3 /*break*/, 13];
            case 12:
                e_2 = _f.sent();
                console.error(e_2);
                expect(true).toEqual(false);
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_3, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                console.log('Deleting stack ' + STACK_NAME);
                return [4 /*yield*/, cf.deleteStack(STACK_NAME)];
            case 1:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.deleteUserPool(cognitoClient, USER_POOL_ID)];
            case 2:
                _a.sent();
                return [4 /*yield*/, cf.waitForStack(STACK_NAME)];
            case 3:
                _a.sent();
                console.log('Successfully deleted stack ' + STACK_NAME);
                return [3 /*break*/, 5];
            case 4:
                e_3 = _a.sent();
                if (e_3.code === 'ValidationError' && e_3.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_3);
                    expect(true).toEqual(false);
                }
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                e_4 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_4);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
/**
 * Test queries below
 */
test("Test 'public' authStrategy", function () { return __awaiter(void 0, void 0, void 0, function () {
    var createMutation, getQuery, response, postId, e_5, e_6, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                createMutation = graphql_tag_1.default("mutation {\n            createPostPublic(input: { title: \"Hello, World!\" }) {\n                id\n                title\n            }\n        }");
                getQuery = graphql_tag_1.default("query ($id: ID!) {\n            getPostPublic(id: $id) {\n                id\n                title\n            }\n        }");
                return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.mutate({
                        mutation: createMutation,
                        fetchPolicy: 'no-cache',
                    })];
            case 1:
                response = _a.sent();
                expect(response.data.createPostPublic.id).toBeDefined();
                expect(response.data.createPostPublic.title).toEqual('Hello, World!');
                postId = response.data.createPostPublic.id;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 3:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 5];
            case 4:
                e_5 = _a.sent();
                expect(e_5.message).toMatch('GraphQL error: Not Authorized to access getPostPublic on type Query');
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, IAM_UNAUTHCLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 6:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 8];
            case 7:
                e_6 = _a.sent();
                expect(e_6.message).toMatch('GraphQL error: Not Authorized to access getPostPublic on type Query');
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 10];
            case 9:
                e_7 = _a.sent();
                console.error(e_7);
                expect(true).toEqual(false);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
test("Test 'public' provider: 'iam' authStrategy", function () { return __awaiter(void 0, void 0, void 0, function () {
    var createMutation, getQuery, response, postId, e_8, e_9, e_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                createMutation = graphql_tag_1.default("mutation {\n            createPostPublicIAM(input: { title: \"Hello, World!\" }) {\n                id\n                title\n            }\n        }");
                getQuery = graphql_tag_1.default("query ($id: ID!) {\n            getPostPublicIAM(id: $id) {\n                id\n                title\n            }\n        }");
                return [4 /*yield*/, IAM_UNAUTHCLIENT.mutate({
                        mutation: createMutation,
                        fetchPolicy: 'no-cache',
                    })];
            case 1:
                response = _a.sent();
                expect(response.data.createPostPublicIAM.id).toBeDefined();
                expect(response.data.createPostPublicIAM.title).toEqual('Hello, World!');
                postId = response.data.createPostPublicIAM.id;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 3:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 5];
            case 4:
                e_8 = _a.sent();
                expect(e_8.message).toMatch('GraphQL error: Not Authorized to access getPostPublicIAM on type Query');
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 6:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 8];
            case 7:
                e_9 = _a.sent();
                expect(e_9.message).toMatch('GraphQL error: Not Authorized to access getPostPublicIAM on type Query');
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 10];
            case 9:
                e_10 = _a.sent();
                console.error(e_10);
                expect(true).toEqual(false);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
test("Test 'private' authStrategy", function () { return __awaiter(void 0, void 0, void 0, function () {
    var createMutation, getQuery, response, postId, e_11, e_12, e_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                createMutation = graphql_tag_1.default("mutation {\n            createPostPrivate(input: { title: \"Hello, World!\" }) {\n                id\n                title\n            }\n        }");
                getQuery = graphql_tag_1.default("query ($id: ID!) {\n            getPostPrivate(id: $id) {\n                id\n                title\n            }\n        }");
                return [4 /*yield*/, USER_POOL_AUTH_CLIENT.mutate({
                        mutation: createMutation,
                        fetchPolicy: 'no-cache',
                    })];
            case 1:
                response = _a.sent();
                expect(response.data.createPostPrivate.id).toBeDefined();
                expect(response.data.createPostPrivate.title).toEqual('Hello, World!');
                postId = response.data.createPostPrivate.id;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 3:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 5];
            case 4:
                e_11 = _a.sent();
                expect(e_11.message).toMatch('GraphQL error: Not Authorized to access getPostPrivate on type Query');
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, IAM_UNAUTHCLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 6:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 8];
            case 7:
                e_12 = _a.sent();
                expect(e_12.message).toMatch('GraphQL error: Not Authorized to access getPostPrivate on type Query');
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 10];
            case 9:
                e_13 = _a.sent();
                console.error(e_13);
                expect(true).toEqual(false);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
test("Test 'private' provider: 'iam' authStrategy", function () { return __awaiter(void 0, void 0, void 0, function () {
    var createMutation, getQuery, response, postId, e_14, e_15, e_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                createMutation = graphql_tag_1.default("mutation {\n            createPostPrivateIAM(input: { title: \"Hello, World!\" }) {\n                id\n                title\n            }\n        }");
                getQuery = graphql_tag_1.default("query ($id: ID!) {\n            getPostPrivateIAM(id: $id) {\n                id\n                title\n            }\n        }");
                return [4 /*yield*/, IAM_UNAUTHCLIENT.mutate({
                        mutation: createMutation,
                        fetchPolicy: 'no-cache',
                    })];
            case 1:
                response = _a.sent();
                expect(response.data.createPostPrivateIAM.id).toBeDefined();
                expect(response.data.createPostPrivateIAM.title).toEqual('Hello, World!');
                postId = response.data.createPostPrivateIAM.id;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 3:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 5];
            case 4:
                e_14 = _a.sent();
                expect(e_14.message).toMatch('GraphQL error: Not Authorized to access getPostPrivateIAM on type Query');
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postId
                        }
                    })];
            case 6:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 8];
            case 7:
                e_15 = _a.sent();
                expect(e_15.message).toMatch('GraphQL error: Not Authorized to access getPostPrivateIAM on type Query');
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 10];
            case 9:
                e_16 = _a.sent();
                console.error(e_16);
                expect(true).toEqual(false);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
test("Test 'private' provider: 'iam' authStrategy", function () { return __awaiter(void 0, void 0, void 0, function () {
    var createMutation, getQuery, response, postIdOwner, responseIAM, postIdIAM, responseGetUserPool, e_17, e_18, e_19, e_20;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 14, , 15]);
                createMutation = graphql_tag_1.default("mutation {\n            createPostOwnerIAM(input: { title: \"Hello, World!\" }) {\n                id\n                title\n                owner\n            }\n        }");
                getQuery = graphql_tag_1.default("query ($id: ID!) {\n            getPostOwnerIAM(id: $id) {\n                id\n                title\n                owner\n            }\n        }");
                return [4 /*yield*/, USER_POOL_AUTH_CLIENT.mutate({
                        mutation: createMutation,
                        fetchPolicy: 'no-cache',
                    })];
            case 1:
                response = _a.sent();
                expect(response.data.createPostOwnerIAM.id).toBeDefined();
                expect(response.data.createPostOwnerIAM.title).toEqual('Hello, World!');
                expect(response.data.createPostOwnerIAM.owner).toEqual(USERNAME1);
                postIdOwner = response.data.createPostOwnerIAM.id;
                return [4 /*yield*/, IAM_UNAUTHCLIENT.mutate({
                        mutation: createMutation,
                        fetchPolicy: 'no-cache',
                    })];
            case 2:
                responseIAM = _a.sent();
                expect(responseIAM.data.createPostOwnerIAM.id).toBeDefined();
                expect(responseIAM.data.createPostOwnerIAM.title).toEqual('Hello, World!');
                expect(responseIAM.data.createPostOwnerIAM.owner).toBeNull();
                postIdIAM = responseIAM.data.createPostOwnerIAM.id;
                return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postIdOwner
                        }
                    })];
            case 3:
                responseGetUserPool = _a.sent();
                expect(responseGetUserPool.data.getPostOwnerIAM.id).toBeDefined();
                expect(responseGetUserPool.data.getPostOwnerIAM.title).toEqual('Hello, World!');
                expect(responseGetUserPool.data.getPostOwnerIAM.owner).toEqual(USERNAME1);
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postIdIAM
                        }
                    })];
            case 5:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 7];
            case 6:
                e_17 = _a.sent();
                expect(e_17.message).toMatch('GraphQL error: Not Authorized to access getPostOwnerIAM on type Query');
                return [3 /*break*/, 7];
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, IAM_UNAUTHCLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postIdOwner
                        }
                    })];
            case 8:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 10];
            case 9:
                e_18 = _a.sent();
                expect(e_18.message).toMatch('GraphQL error: Not Authorized to access getPostOwnerIAM on type Query');
                return [3 /*break*/, 10];
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.query({
                        query: getQuery,
                        variables: {
                            id: postIdOwner
                        }
                    })];
            case 11:
                _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 13];
            case 12:
                e_19 = _a.sent();
                expect(e_19.message).toMatch('GraphQL error: Not Authorized to access getPostOwnerIAM on type Query');
                return [3 /*break*/, 13];
            case 13: return [3 /*break*/, 15];
            case 14:
                e_20 = _a.sent();
                console.error(e_20);
                expect(true).toEqual(false);
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); });
describe("Test IAM protected field operations", function () {
    // This test reuses the unauth role, but any IAM credentials would work
    // in real world scenarios, we've to see if provider override works.
    var createMutation = graphql_tag_1.default("mutation {\n        createPostSecretFieldIAM(input: { title: \"Hello, World!\"  }) {\n            id\n            title\n        }\n    }");
    var createMutationWithSecret = graphql_tag_1.default("mutation {\n        createPostSecretFieldIAM(input: { title: \"Hello, World!\", secret: \"42\" }) {\n            id\n            title\n            secret\n        }\n    }");
    var getQuery = graphql_tag_1.default("query ($id: ID!) {\n        getPostSecretFieldIAM(id: $id) {\n            id\n            title\n        }\n    }");
    var getQueryWithSecret = graphql_tag_1.default("query ($id: ID!) {\n        getPostSecretFieldIAM(id: $id) {\n            id\n            title\n            secret\n        }\n    }");
    var postIdNoSecret = '';
    var postIdSecret = '';
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, responseIAMSecret, e_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    response = _a.sent();
                    postIdNoSecret = response.data.createPostSecretFieldIAM.id;
                    return [4 /*yield*/, IAM_UNAUTHCLIENT.mutate({
                            mutation: createMutationWithSecret,
                            fetchPolicy: 'no-cache',
                        })];
                case 2:
                    responseIAMSecret = _a.sent();
                    postIdSecret = responseIAMSecret.data.createPostSecretFieldIAM.id;
                    return [3 /*break*/, 4];
                case 3:
                    e_21 = _a.sent();
                    console.error(e_21);
                    expect(true).toEqual(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it('Get UserPool - Succeed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var responseGetUserPool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            id: postIdNoSecret
                        }
                    })];
                case 1:
                    responseGetUserPool = _a.sent();
                    expect(responseGetUserPool.data.getPostSecretFieldIAM.id).toBeDefined();
                    expect(responseGetUserPool.data.getPostSecretFieldIAM.title).toEqual('Hello, World!');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get UserPool with secret - Fail', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    return [4 /*yield*/, expect(USER_POOL_AUTH_CLIENT.query({
                            query: getQueryWithSecret,
                            fetchPolicy: 'no-cache',
                            variables: {
                                id: postIdSecret
                            }
                        })).rejects.toThrow('GraphQL error: Not Authorized to access secret on type PostSecretFieldIAM')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get IAM with secret - Fail (only create and update)', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    return [4 /*yield*/, expect(IAM_UNAUTHCLIENT.query({
                            query: getQueryWithSecret,
                            fetchPolicy: 'no-cache',
                            variables: {
                                id: postIdSecret
                            }
                        })).rejects.toThrow('GraphQL error: Not Authorized to access getPostSecretFieldIAM on type Query')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("Connection tests with @auth on type", function () {
    var createPostMutation = graphql_tag_1.default("mutation {\n        createPostConnection(input: { title: \"Hello, World!\" }) {\n            id\n            title\n        }\n    }");
    var createCommentMutation = graphql_tag_1.default("mutation ( $postId: ID! ) {\n        createCommentConnection(input: { content: \"Comment\", commentConnectionPostId: $postId }) {\n            id\n            content\n        }\n    }");
    var getPostQuery = graphql_tag_1.default("query ( $postId: ID! ) {\n        getPostConnection ( id: $postId ) {\n            id\n            title\n        }\n    }\n    ");
    var getPostQueryWithComments = graphql_tag_1.default("query ( $postId: ID! ) {\n        getPostConnection ( id: $postId ) {\n            id\n            title\n            comments {\n                items {\n                    id\n                    content\n                }\n            }\n        }\n    }\n    ");
    var getCommentQuery = graphql_tag_1.default("query ( $commentId: ID! ) {\n        getCommentConnection ( id: $commentId ) {\n            id\n            content\n        }\n    }\n    ");
    var getCommentWithPostQuery = graphql_tag_1.default("query ( $commentId: ID! ) {\n        getCommentConnection ( id: $commentId ) {\n            id\n            content\n            post {\n                id\n                title\n            }\n        }\n    }\n    ");
    var postId = '';
    var commentId = '';
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, commentResponse, e_22;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.mutate({
                            mutation: createPostMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    response = _a.sent();
                    postId = response.data.createPostConnection.id;
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT.mutate({
                            mutation: createCommentMutation,
                            fetchPolicy: 'no-cache',
                            variables: {
                                postId: postId
                            }
                        })];
                case 2:
                    commentResponse = _a.sent();
                    commentId = commentResponse.data.createCommentConnection.id;
                    return [3 /*break*/, 4];
                case 3:
                    e_22 = _a.sent();
                    console.error(e_22);
                    expect(true).toEqual(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it('Create a Post with UserPool - Fail', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    return [4 /*yield*/, expect(USER_POOL_AUTH_CLIENT.mutate({
                            mutation: createPostMutation,
                            fetchPolicy: 'no-cache'
                        })).rejects.toThrow('GraphQL error: Not Authorized to access createPostConnection on type Mutation')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Add a comment with ApiKey - Fail', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    return [4 /*yield*/, expect(APIKEY_GRAPHQL_CLIENT.mutate({
                            mutation: createCommentMutation,
                            fetchPolicy: 'no-cache',
                            variables: {
                                postId: postId
                            }
                        })).rejects.toThrow('Not Authorized to access createCommentConnection on type Mutation')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get Post with ApiKey - Succeed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var responseGetPost;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.query({
                        query: getPostQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            postId: postId
                        }
                    })];
                case 1:
                    responseGetPost = _a.sent();
                    expect(responseGetPost.data.getPostConnection.id).toEqual(postId);
                    expect(responseGetPost.data.getPostConnection.title).toEqual('Hello, World!');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get Post+Comments with ApiKey - Fail', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    return [4 /*yield*/, expect(APIKEY_GRAPHQL_CLIENT.query({
                            query: getPostQueryWithComments,
                            fetchPolicy: 'no-cache',
                            variables: {
                                postId: postId
                            }
                        })).rejects.toThrow('Not Authorized to access items on type ModelCommentConnectionConnection')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get Post with UserPool - Fail', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    return [4 /*yield*/, expect(USER_POOL_AUTH_CLIENT.query({
                            query: getPostQuery,
                            fetchPolicy: 'no-cache',
                            variables: {
                                postId: postId
                            }
                        })).rejects.toThrow('Not Authorized to access getPostConnection on type Query')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get Comment with UserPool - Succeed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var responseGetComment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getCommentQuery,
                        fetchPolicy: 'no-cache',
                        variables: {
                            commentId: commentId
                        }
                    })];
                case 1:
                    responseGetComment = _a.sent();
                    expect(responseGetComment.data.getCommentConnection.id).toEqual(commentId);
                    expect(responseGetComment.data.getCommentConnection.content).toEqual('Comment');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get Comment with ApiKey - Fail', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expect.assertions(1);
                    return [4 /*yield*/, expect(APIKEY_GRAPHQL_CLIENT.query({
                            query: getCommentQuery,
                            fetchPolicy: 'no-cache',
                            variables: {
                                commentId: commentId
                            }
                        })).rejects.toThrow('Not Authorized to access getCommentConnection on type Query')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Get Comment with Post with UserPool - Succeed, but null for Post field', function () { return __awaiter(void 0, void 0, void 0, function () {
        var responseGetComment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, USER_POOL_AUTH_CLIENT.query({
                        query: getCommentWithPostQuery,
                        errorPolicy: 'all',
                        fetchPolicy: 'no-cache',
                        variables: {
                            commentId: commentId
                        }
                    })];
                case 1:
                    responseGetComment = _a.sent();
                    expect(responseGetComment.data.getCommentConnection.id).toEqual(commentId);
                    expect(responseGetComment.data.getCommentConnection.content).toEqual('Comment');
                    expect(responseGetComment.data.getCommentConnection.post).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("IAM Tests", function () {
    var createMutation = graphql_tag_1.default("mutation {\n        createPostIAMWithKeys(input: { title: \"Hello, World!\", type: \"Post\", date: \"2019-01-01T00:00:00Z\" }) {\n            id\n            title\n            type\n            date\n        }\n    }");
    var getPostIAMWithKeysByDate = graphql_tag_1.default("query {\n        getPostIAMWithKeysByDate(type: \"Post\") {\n            items {\n                id\n                title\n                type\n                date\n            }\n        }\n    }");
    var postId = '';
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, e_23;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, APIKEY_GRAPHQL_CLIENT.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    response = _a.sent();
                    postId = response.data.createPostIAMWithKeys.id;
                    return [3 /*break*/, 3];
                case 2:
                    e_23 = _a.sent();
                    console.error(e_23);
                    expect(true).toEqual(false);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    it('Execute @key query - Succeed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, post;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, IAM_UNAUTHCLIENT.query({
                        query: getPostIAMWithKeysByDate,
                        fetchPolicy: 'no-cache',
                    })];
                case 1:
                    response = _a.sent();
                    expect(response.data.getPostIAMWithKeysByDate.items).toBeDefined();
                    expect(response.data.getPostIAMWithKeysByDate.items.length).toEqual(1);
                    post = response.data.getPostIAMWithKeysByDate.items[0];
                    expect(post.id).toEqual(postId);
                    expect(post.title).toEqual('Hello, World!');
                    expect(post.type).toEqual('Post');
                    expect(post.date).toEqual('2019-01-01T00:00:00Z');
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=MultiAuthModelAuthTransformer.e2e.test.js.map