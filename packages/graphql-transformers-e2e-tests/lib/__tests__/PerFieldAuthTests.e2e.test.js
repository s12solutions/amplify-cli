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
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var fs = require("fs");
var CloudFormationClient_1 = require("../CloudFormationClient");
var S3 = require("aws-sdk/clients/s3");
var CognitoClient = require("aws-sdk/clients/cognitoidentityserviceprovider");
var GraphQLClient_1 = require("../GraphQLClient");
var S3Client_1 = require("../S3Client");
var deployNestedStacks_1 = require("../deployNestedStacks");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var cognitoUtils_1 = require("../cognitoUtils");
// to deal with bug in cognito-identity-js
global.fetch = require("node-fetch");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "PerFieldAuthTests-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "per-field-auth-tests-bucket-" + BUILD_TIMESTAMP;
var LOCAL_BUILD_ROOT = '/tmp/per_field_auth_tests/';
var DEPLOYMENT_ROOT_KEY = 'deployments';
var GRAPHQL_ENDPOINT = undefined;
/**
 * Client 1 is logged in and is a member of the Admin group.
 */
var GRAPHQL_CLIENT_1 = undefined;
/**
 * Client 2 is logged in and is a member of the Devs group.
 */
var GRAPHQL_CLIENT_2 = undefined;
/**
 * Client 3 is logged in and has no group memberships.
 */
var GRAPHQL_CLIENT_3 = undefined;
var USER_POOL_ID = undefined;
var USERNAME1 = 'user1@test.com';
var USERNAME2 = 'user2@test.com';
var USERNAME3 = 'user3@test.com';
var TMP_PASSWORD = 'Password123!';
var REAL_PASSWORD = 'Password1234!';
var ADMIN_GROUP_NAME = 'Admin';
var DEVS_GROUP_NAME = 'Devs';
var PARTICIPANT_GROUP_NAME = 'Participant';
var WATCHER_GROUP_NAME = 'Watcher';
var INSTRUCTOR_GROUP_NAME = 'Instructor';
var cognitoClient = new CognitoClient({ apiVersion: '2016-04-19', region: 'us-west-2' });
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
function createBucket(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        Bucket: name,
                    };
                    awsS3Client.createBucket(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
function deleteBucket(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        Bucket: name,
                    };
                    awsS3Client.deleteBucket(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, transformer, userPoolResponse, userPoolClientResponse, userPoolClientId, out, finishedStack, getApiEndpoint, authResAfterGroup, idToken, authRes2AfterGroup, idToken2, authRes3, idToken3, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Create a stack for the post model with auth enabled.
                if (!fs.existsSync(LOCAL_BUILD_ROOT)) {
                    fs.mkdirSync(LOCAL_BUILD_ROOT);
                }
                return [4 /*yield*/, createBucket(BUCKET_NAME)];
            case 1:
                _a.sent();
                validSchema = "\n    # Owners may update their owned records.\n    # Admins may create Employee records.\n    # Any authenticated user may view Employee ids & emails.\n    # Owners and members of \"Admin\" group may see employee salaries.\n    # Owners of \"Admin\" group may create and update employee salaries.\n    type Employee @model (\n        subscriptions: {\n            level: public\n        }\n    ) @auth(rules: [\n        { allow: owner, ownerField: \"email\", operations: [update] },\n        { allow: groups, groups: [\"Admin\"], operations: [create,update,delete]}\n    ]) {\n        id: ID!\n\n        # The only field that can be updated by the owner.\n        bio: String\n\n        # Fields with ownership conditions take precendence to the Object @auth.\n        # That means that both the @auth on Object AND the @auth on the field must\n        # be satisfied.\n\n        # Owners & \"Admin\"s may view employee email addresses. Only \"Admin\"s may create/update.\n        # TODO: { allow: authenticated } would be useful here so that any employee could view.\n        email: String @auth(rules: [\n            { allow: groups, groups: [\"Admin\"], operations: [create, update, read]}\n            { allow: owner, ownerField: \"email\", operations: [read]}\n        ])\n\n        # The owner & \"Admin\"s may view the salary. Only \"Admins\" may create/update.\n        salary: Int @auth(rules: [\n            { allow: groups, groups: [\"Admin\"], operations: [create, update, read]}\n            { allow: owner, ownerField: \"email\", operations: [read]}\n        ])\n\n        # The delete operation means you cannot update the value to \"null\" or \"undefined\".\n        # Since delete operations are at the object level, this actually adds auth rules to the update mutation.\n        notes: String @auth(rules: [{ allow: owner, ownerField: \"email\", operations: [delete] }])\n    }\n\n    type Student @model\n    @auth(rules: [\n        {allow: owner}\n        {allow: groups, groups: [\"Instructor\"]}\n    ]) {\n        id: String,\n        name: String,\n        bio: String,\n        notes: String @auth(rules: [{allow: owner}])\n    }\n\n    type Post @model\n        @auth(rules: [{ allow: groups, groups: [\"Admin\"] },\n                      { allow: owner, ownerField: \"owner1\", operations: [read, create] }])\n    {\n        id: ID!\n        owner1: String! @auth(rules: [{allow: owner, ownerField: \"notAllowed\", operations: [update]}])\n        text: String @auth(rules: [{ allow: owner, ownerField: \"owner1\", operations : [update]}])\n    }\n    ";
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_connection_transformer_1.default(),
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
                return [4 /*yield*/, cognitoUtils_1.createUserPool(cognitoClient, "UserPool" + STACK_NAME)];
            case 2:
                userPoolResponse = _a.sent();
                USER_POOL_ID = userPoolResponse.UserPool.Id;
                return [4 /*yield*/, cognitoUtils_1.createUserPoolClient(cognitoClient, USER_POOL_ID, "UserPool" + STACK_NAME)];
            case 3:
                userPoolClientResponse = _a.sent();
                userPoolClientId = userPoolClientResponse.UserPoolClient.ClientId;
                _a.label = 4;
            case 4:
                _a.trys.push([4, 23, , 24]);
                out = transformer.transform(validSchema);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { AuthCognitoUserPoolId: USER_POOL_ID }, LOCAL_BUILD_ROOT, BUCKET_NAME, DEPLOYMENT_ROOT_KEY, BUILD_TIMESTAMP)];
            case 5:
                finishedStack = _a.sent();
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                GRAPHQL_ENDPOINT = getApiEndpoint(finishedStack.Outputs);
                console.log("Using graphql url: " + GRAPHQL_ENDPOINT);
                // Verify we have all the details
                expect(GRAPHQL_ENDPOINT).toBeTruthy();
                expect(USER_POOL_ID).toBeTruthy();
                expect(userPoolClientId).toBeTruthy();
                // Configure Amplify, create users, and sign in.
                cognitoUtils_1.configureAmplify(USER_POOL_ID, userPoolClientId);
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 6:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 7:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, ADMIN_GROUP_NAME)];
            case 8:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, PARTICIPANT_GROUP_NAME)];
            case 9:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, WATCHER_GROUP_NAME)];
            case 10:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, DEVS_GROUP_NAME)];
            case 11:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.createGroup(USER_POOL_ID, INSTRUCTOR_GROUP_NAME)];
            case 12:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(ADMIN_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 13:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(PARTICIPANT_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 14:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(WATCHER_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 15:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(DEVS_GROUP_NAME, USERNAME2, USER_POOL_ID)];
            case 16:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(INSTRUCTOR_GROUP_NAME, USERNAME1, USER_POOL_ID)];
            case 17:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.addUserToGroup(INSTRUCTOR_GROUP_NAME, USERNAME2, USER_POOL_ID)];
            case 18:
                _a.sent();
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
            case 19:
                authResAfterGroup = _a.sent();
                idToken = authResAfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_1 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken });
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
            case 20:
                authRes2AfterGroup = _a.sent();
                idToken2 = authRes2AfterGroup.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_2 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken2 });
                return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME3, TMP_PASSWORD, REAL_PASSWORD)];
            case 21:
                authRes3 = _a.sent();
                idToken3 = authRes3.getIdToken().getJwtToken();
                GRAPHQL_CLIENT_3 = new GraphQLClient_1.GraphQLClient(GRAPHQL_ENDPOINT, { Authorization: idToken3 });
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, 5000); })];
            case 22:
                // Wait for any propagation to avoid random
                // "The security token included in the request is invalid" errors
                _a.sent();
                return [3 /*break*/, 24];
            case 23:
                e_1 = _a.sent();
                console.error(e_1);
                expect(true).toEqual(false);
                return [3 /*break*/, 24];
            case 24: return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_2, e_3;
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
                e_2 = _a.sent();
                if (e_2.code === 'ValidationError' && e_2.message === "Stack with id " + STACK_NAME + " does not exist") {
                    // The stack was deleted. This is good.
                    expect(true).toEqual(true);
                    console.log('Successfully deleted stack ' + STACK_NAME);
                }
                else {
                    console.error(e_2);
                    throw e_2;
                }
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                e_3 = _a.sent();
                console.error("Failed to empty S3 bucket: " + e_3);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
/**
 * Tests
 */
test('Test that only Admins can create Employee records.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser1, tryToCreateAsNonAdmin, tryToCreateAsNonAdmin2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createEmployee(input: { email: \"user2@test.com\", salary: 100 }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 1:
                createUser1 = _a.sent();
                console.log(createUser1);
                expect(createUser1.data.createEmployee.email).toEqual("user2@test.com");
                expect(createUser1.data.createEmployee.salary).toEqual(100);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        createEmployee(input: { email: \"user2@test.com\", salary: 101 }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 2:
                tryToCreateAsNonAdmin = _a.sent();
                console.log(tryToCreateAsNonAdmin);
                expect(tryToCreateAsNonAdmin.data.createEmployee).toBeNull();
                expect(tryToCreateAsNonAdmin.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("mutation {\n        createEmployee(input: { email: \"user2@test.com\", salary: 101 }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 3:
                tryToCreateAsNonAdmin2 = _a.sent();
                console.log(tryToCreateAsNonAdmin2);
                expect(tryToCreateAsNonAdmin2.data.createEmployee).toBeNull();
                expect(tryToCreateAsNonAdmin2.errors).toHaveLength(1);
                return [2 /*return*/];
        }
    });
}); });
test('Test that only Admins may update salary & email.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser1, employeeId, tryToUpdateAsNonAdmin, tryToUpdateAsNonAdmin2, tryToUpdateAsNonAdmin3, updateAsAdmin, updateAsAdmin2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createEmployee(input: { email: \"user2@test.com\", salary: 100 }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 1:
                createUser1 = _a.sent();
                console.log(createUser1);
                employeeId = createUser1.data.createEmployee.id;
                expect(employeeId).not.toBeNull();
                expect(createUser1.data.createEmployee.email).toEqual("user2@test.com");
                expect(createUser1.data.createEmployee.salary).toEqual(100);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", salary: 101 }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 2:
                tryToUpdateAsNonAdmin = _a.sent();
                console.log(tryToUpdateAsNonAdmin);
                expect(tryToUpdateAsNonAdmin.data.updateEmployee).toBeNull();
                expect(tryToUpdateAsNonAdmin.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", email: \"someonelese@gmail.com\" }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 3:
                tryToUpdateAsNonAdmin2 = _a.sent();
                console.log(tryToUpdateAsNonAdmin2);
                expect(tryToUpdateAsNonAdmin2.data.updateEmployee).toBeNull();
                expect(tryToUpdateAsNonAdmin2.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", email: \"someonelese@gmail.com\" }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 4:
                tryToUpdateAsNonAdmin3 = _a.sent();
                console.log(tryToUpdateAsNonAdmin3);
                expect(tryToUpdateAsNonAdmin3.data.updateEmployee).toBeNull();
                expect(tryToUpdateAsNonAdmin3.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", email: \"someonelese@gmail.com\" }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 5:
                updateAsAdmin = _a.sent();
                console.log(updateAsAdmin);
                expect(updateAsAdmin.data.updateEmployee.email).toEqual("someonelese@gmail.com");
                expect(updateAsAdmin.data.updateEmployee.salary).toEqual(100);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", salary: 99 }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 6:
                updateAsAdmin2 = _a.sent();
                console.log(updateAsAdmin2);
                expect(updateAsAdmin2.data.updateEmployee.email).toEqual("someonelese@gmail.com");
                expect(updateAsAdmin2.data.updateEmployee.salary).toEqual(99);
                return [2 /*return*/];
        }
    });
}); });
test('Test that owners may update their bio.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser1, employeeId, tryToUpdateAsNonAdmin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createEmployee(input: { email: \"user2@test.com\", salary: 100 }) {\n            id\n            email\n            salary\n        }\n    }", {})];
            case 1:
                createUser1 = _a.sent();
                console.log(createUser1);
                employeeId = createUser1.data.createEmployee.id;
                expect(employeeId).not.toBeNull();
                expect(createUser1.data.createEmployee.email).toEqual("user2@test.com");
                expect(createUser1.data.createEmployee.salary).toEqual(100);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", bio: \"Does cool stuff.\" }) {\n            id\n            email\n            salary\n            bio\n        }\n    }", {})];
            case 2:
                tryToUpdateAsNonAdmin = _a.sent();
                console.log(tryToUpdateAsNonAdmin);
                expect(tryToUpdateAsNonAdmin.data.updateEmployee.bio).toEqual("Does cool stuff.");
                expect(tryToUpdateAsNonAdmin.data.updateEmployee.email).toEqual("user2@test.com");
                expect(tryToUpdateAsNonAdmin.data.updateEmployee.salary).toEqual(100);
                return [2 /*return*/];
        }
    });
}); });
test('Test that everyone may view employee bios.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser1, employeeId, getAsNonAdmin, listAsNonAdmin, seenId, _i, _a, item;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createEmployee(input: { email: \"user3@test.com\", salary: 100, bio: \"Likes long walks on the beach\" }) {\n            id\n            email\n            salary\n            bio\n        }\n    }", {})];
            case 1:
                createUser1 = _b.sent();
                console.log(createUser1);
                employeeId = createUser1.data.createEmployee.id;
                expect(employeeId).not.toBeNull();
                expect(createUser1.data.createEmployee.email).toEqual("user3@test.com");
                expect(createUser1.data.createEmployee.salary).toEqual(100);
                expect(createUser1.data.createEmployee.bio).toEqual('Likes long walks on the beach');
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        getEmployee(id: \"" + employeeId + "\") {\n            id\n            email\n            bio\n        }\n    }", {})];
            case 2:
                getAsNonAdmin = _b.sent();
                console.log(getAsNonAdmin);
                // Should not be able to view the email as the non owner
                expect(getAsNonAdmin.data.getEmployee.email).toBeNull();
                // Should be able to view the bio.
                expect(getAsNonAdmin.data.getEmployee.bio).toEqual('Likes long walks on the beach');
                expect(getAsNonAdmin.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        listEmployees {\n            items {\n                id\n                bio\n            }\n        }\n    }", {})];
            case 3:
                listAsNonAdmin = _b.sent();
                console.log(listAsNonAdmin);
                expect(listAsNonAdmin.data.listEmployees.items.length).toBeGreaterThan(1);
                seenId = false;
                for (_i = 0, _a = listAsNonAdmin.data.listEmployees.items; _i < _a.length; _i++) {
                    item = _a[_i];
                    if (item.id === employeeId) {
                        seenId = true;
                        expect(item.bio).toEqual('Likes long walks on the beach');
                    }
                }
                expect(seenId).toEqual(true);
                return [2 /*return*/];
        }
    });
}); });
test('Test that only owners may "delete" i.e. update the field to null.', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createUser1, employeeId, tryToDeleteUserNotes, updateNewsWithNotes, updateAsAdmin, deleteNotes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        createEmployee(input: { email: \"user3@test.com\", salary: 200, notes: \"note1\" }) {\n            id\n            email\n            salary\n            notes\n        }\n    }", {})];
            case 1:
                createUser1 = _a.sent();
                console.log(createUser1);
                employeeId = createUser1.data.createEmployee.id;
                expect(employeeId).not.toBeNull();
                expect(createUser1.data.createEmployee.email).toEqual("user3@test.com");
                expect(createUser1.data.createEmployee.salary).toEqual(200);
                expect(createUser1.data.createEmployee.notes).toEqual('note1');
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", notes: null }) {\n            id\n            notes\n        }\n    }", {})];
            case 2:
                tryToDeleteUserNotes = _a.sent();
                console.log(tryToDeleteUserNotes);
                expect(tryToDeleteUserNotes.data.updateEmployee).toBeNull();
                expect(tryToDeleteUserNotes.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", notes: \"something else\" }) {\n            id\n            notes\n        }\n    }", {})];
            case 3:
                updateNewsWithNotes = _a.sent();
                expect(updateNewsWithNotes.data.updateEmployee.notes).toEqual('something else');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", notes: null }) {\n            id\n            notes\n        }\n    }", {})];
            case 4:
                updateAsAdmin = _a.sent();
                expect(updateAsAdmin.data.updateEmployee).toBeNull();
                expect(updateAsAdmin.errors).toHaveLength(1);
                return [4 /*yield*/, GRAPHQL_CLIENT_3.query("mutation {\n        updateEmployee(input: { id: \"" + employeeId + "\", notes: null }) {\n            id\n            notes\n        }\n    }", {})];
            case 5:
                deleteNotes = _a.sent();
                expect(deleteNotes.data.updateEmployee.notes).toBeNull();
                return [2 /*return*/];
        }
    });
}); });
test('Test with auth with subscriptions on default behavior', function () { return __awaiter(void 0, void 0, void 0, function () {
    var secureNote1, createStudent2, createStudent1queryID, queryForStudent2, queryAsStudent1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                secureNote1 = "secureNote1";
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("mutation {\n        createStudent(input: {bio: \"bio1\", name: \"student1\", notes: \"" + secureNote1 + "\"}) {\n            id\n            bio\n            name\n            notes\n            owner\n        }\n    }", {})];
            case 1:
                createStudent2 = _a.sent();
                console.log(createStudent2);
                expect(createStudent2.data.createStudent.id).toBeDefined();
                createStudent1queryID = createStudent2.data.createStudent.id;
                expect(createStudent2.data.createStudent.bio).toEqual('bio1');
                expect(createStudent2.data.createStudent.notes).toBeNull();
                return [4 /*yield*/, GRAPHQL_CLIENT_2.query("query {\n        getStudent(id: \"" + createStudent1queryID + "\") {\n            bio\n            id\n            name\n            notes\n            owner\n        }\n    }", {})];
            case 2:
                queryForStudent2 = _a.sent();
                console.log(queryForStudent2);
                expect(queryForStudent2.data.getStudent.notes).toEqual(secureNote1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("query {\n        getStudent(id: \"" + createStudent1queryID + "\") {\n            bio\n            id\n            name\n            notes\n            owner\n        }\n    }", {})];
            case 3:
                queryAsStudent1 = _a.sent();
                console.log(queryAsStudent1);
                expect(queryAsStudent1.data.getStudent.notes).toBeNull();
                return [2 /*return*/];
        }
    });
}); });
test('AND per-field dynamic auth rule test', function () { return __awaiter(void 0, void 0, void 0, function () {
    var createPostResponse, postID1, badUpdatePostResponse, correctUpdatePostResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation CreatePost {\n        createPost(input: {owner1: \"" + USERNAME1 + "\", text: \"mytext\"}) {\n          id\n          text\n          owner1\n        }\n      }")];
            case 1:
                createPostResponse = _a.sent();
                console.log(createPostResponse);
                postID1 = createPostResponse.data.createPost.id;
                expect(postID1).toBeDefined();
                expect(createPostResponse.data.createPost.text).toEqual('mytext');
                expect(createPostResponse.data.createPost.owner1).toEqual(USERNAME1);
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation UpdatePost {\n        updatePost(input: {id: \"" + postID1 + "\", text: \"newText\", owner1: \"" + USERNAME1 + "\"}) {\n          id\n          owner1\n          text\n        }\n      }\n      ")];
            case 2:
                badUpdatePostResponse = _a.sent();
                console.log(badUpdatePostResponse);
                expect(badUpdatePostResponse.errors[0].errorType).toEqual('DynamoDB:ConditionalCheckFailedException');
                return [4 /*yield*/, GRAPHQL_CLIENT_1.query("mutation UpdatePost {\n        updatePost(input: {id: \"" + postID1 + "\", text: \"newText\"}) {\n          id\n          owner1\n          text\n        }\n      }")];
            case 3:
                correctUpdatePostResponse = _a.sent();
                console.log(correctUpdatePostResponse);
                expect(correctUpdatePostResponse.data.updatePost.owner1).toEqual(USERNAME1);
                expect(correctUpdatePostResponse.data.updatePost.text).toEqual('newText');
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=PerFieldAuthTests.e2e.test.js.map