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
var graphql_function_transformer_1 = require("graphql-function-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var CloudFormationClient_1 = require("../CloudFormationClient");
var GraphQLClient_1 = require("../GraphQLClient");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var deployNestedStacks_1 = require("../deployNestedStacks");
var S3Client_1 = require("../S3Client");
var S3 = require("aws-sdk/clients/s3");
var LambdaHelper_1 = require("../LambdaHelper");
var IAMHelper_1 = require("../IAMHelper");
jest.setTimeout(2000000);
var cf = new CloudFormationClient_1.CloudFormationClient('us-west-2');
var customS3Client = new S3Client_1.S3Client('us-west-2');
var awsS3Client = new S3({ region: 'us-west-2' });
var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
var STACK_NAME = "NoneEnvFunctionTransformerTests-" + BUILD_TIMESTAMP;
var BUCKET_NAME = "appsync-none-env-func-trans-test-bucket-" + BUILD_TIMESTAMP;
var LOCAL_FS_BUILD_DIR = '/tmp/none_env_function_transformer_tests/';
var S3_ROOT_DIR_KEY = 'deployments';
// Note: there is no env in the name.
var ECHO_FUNCTION_NAME = "e2e-tests-echo-" + BUILD_TIMESTAMP;
var LAMBDA_EXECUTION_ROLE_NAME = "amplify_e2e_tests_lambda_basic_none_" + BUILD_TIMESTAMP;
var LAMBDA_EXECUTION_POLICY_NAME = "amplify_e2e_tests_lambda_basic_access_none_" + BUILD_TIMESTAMP;
var LAMBDA_EXECUTION_POLICY_ARN = '';
var GRAPHQL_CLIENT = undefined;
var LAMBDA_HELPER = new LambdaHelper_1.LambdaHelper();
var IAM_HELPER = new IAMHelper_1.IAMHelper();
function outputValueSelector(key) {
    return function (outputs) {
        var output = outputs.find(function (o) { return o.OutputKey === key; });
        return output ? output.OutputValue : null;
    };
}
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var validSchema, e_1, role, policy, e_2, transformer, out, finishedStack, getApiEndpoint, getApiKey, endpoint, apiKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validSchema = "\n    type Query {\n        echoNoEnv(msg: String!): Context @function(name: \"e2e-tests-echo-" + BUILD_TIMESTAMP + "-${env}\")\n    }\n    type Context {\n        arguments: Arguments\n        typeName: String\n        fieldName: String\n    }\n    type Arguments {\n        msg: String!\n    }\n    ";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, awsS3Client.createBucket({ Bucket: BUCKET_NAME }).promise()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.warn("Could not create bucket: " + e_1);
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 12, , 13]);
                return [4 /*yield*/, IAM_HELPER.createLambdaExecutionRole(LAMBDA_EXECUTION_ROLE_NAME)];
            case 5:
                role = _a.sent();
                return [4 /*yield*/, wait(5000)];
            case 6:
                _a.sent();
                return [4 /*yield*/, IAM_HELPER.createLambdaExecutionPolicy(LAMBDA_EXECUTION_POLICY_NAME)];
            case 7:
                policy = _a.sent();
                return [4 /*yield*/, wait(5000)];
            case 8:
                _a.sent();
                LAMBDA_EXECUTION_POLICY_ARN = policy.Policy.Arn;
                return [4 /*yield*/, IAM_HELPER.attachLambdaExecutionPolicy(policy.Policy.Arn, role.Role.RoleName)];
            case 9:
                _a.sent();
                return [4 /*yield*/, wait(10000)];
            case 10:
                _a.sent();
                return [4 /*yield*/, LAMBDA_HELPER.createFunction(ECHO_FUNCTION_NAME, role.Role.Arn, 'echoFunction')];
            case 11:
                _a.sent();
                return [3 /*break*/, 13];
            case 12:
                e_2 = _a.sent();
                console.warn("Could not setup function: " + e_2);
                return [3 /*break*/, 13];
            case 13:
                transformer = new graphql_transformer_core_1.default({
                    transformers: [
                        new graphql_dynamodb_transformer_1.default(),
                        new graphql_function_transformer_1.default(),
                        new graphql_auth_transformer_1.default({
                            authConfig: {
                                defaultAuthentication: {
                                    authenticationType: "API_KEY"
                                },
                                additionalAuthenticationProviders: []
                            }
                        })
                    ]
                });
                out = transformer.transform(validSchema);
                return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, { CreateAPIKey: '1' }, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)
                    // Arbitrary wait to make sure everything is ready.
                ];
            case 14:
                finishedStack = _a.sent();
                // Arbitrary wait to make sure everything is ready.
                return [4 /*yield*/, cf.wait(5, function () { return Promise.resolve(); })];
            case 15:
                // Arbitrary wait to make sure everything is ready.
                _a.sent();
                console.log('Successfully created stack ' + STACK_NAME);
                console.log(finishedStack);
                expect(finishedStack).toBeDefined();
                getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                endpoint = getApiEndpoint(finishedStack.Outputs);
                apiKey = getApiKey(finishedStack.Outputs);
                expect(apiKey).toBeDefined();
                expect(endpoint).toBeDefined();
                GRAPHQL_CLIENT = new GraphQLClient_1.GraphQLClient(endpoint, { 'x-api-key': apiKey });
                return [2 /*return*/];
        }
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_3, e_4, e_5, e_6, e_7, e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                console.log('Deleting stack ' + STACK_NAME);
                return [4 /*yield*/, cf.deleteStack(STACK_NAME)];
            case 1:
                _a.sent();
                return [4 /*yield*/, cf.waitForStack(STACK_NAME)];
            case 2:
                _a.sent();
                console.log('Successfully deleted stack ' + STACK_NAME);
                return [3 /*break*/, 4];
            case 3:
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
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                e_4 = _a.sent();
                console.warn("Error during bucket cleanup: " + e_4);
                return [3 /*break*/, 7];
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, LAMBDA_HELPER.deleteFunction(ECHO_FUNCTION_NAME)];
            case 8:
                _a.sent();
                return [3 /*break*/, 10];
            case 9:
                e_5 = _a.sent();
                console.warn("Error during function cleanup: " + e_5);
                return [3 /*break*/, 10];
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4 /*yield*/, IAM_HELPER.detachLambdaExecutionPolicy(LAMBDA_EXECUTION_POLICY_ARN, LAMBDA_EXECUTION_ROLE_NAME)];
            case 11:
                _a.sent();
                return [3 /*break*/, 13];
            case 12:
                e_6 = _a.sent();
                console.warn("Error during policy dissociation: " + e_6);
                return [3 /*break*/, 13];
            case 13:
                _a.trys.push([13, 15, , 16]);
                return [4 /*yield*/, IAM_HELPER.deleteRole(LAMBDA_EXECUTION_ROLE_NAME)];
            case 14:
                _a.sent();
                return [3 /*break*/, 16];
            case 15:
                e_7 = _a.sent();
                console.warn("Error during role cleanup: " + e_7);
                return [3 /*break*/, 16];
            case 16:
                _a.trys.push([16, 18, , 19]);
                return [4 /*yield*/, IAM_HELPER.deletePolicy(LAMBDA_EXECUTION_POLICY_ARN)];
            case 17:
                _a.sent();
                return [3 /*break*/, 19];
            case 18:
                e_8 = _a.sent();
                console.warn("Error during policy cleanup: " + e_8);
                return [3 /*break*/, 19];
            case 19: return [2 /*return*/];
        }
    });
}); });
/**
 * Test queries below
 */
test('Test simple echo function', function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GRAPHQL_CLIENT.query("query {\n        echoNoEnv(msg: \"Hello\") {\n            arguments {\n                msg\n            }\n            typeName\n            fieldName\n        }\n    }", {})];
            case 1:
                response = _a.sent();
                console.log(JSON.stringify(response, null, 4));
                expect(response.data.echoNoEnv.arguments.msg).toEqual("Hello");
                expect(response.data.echoNoEnv.typeName).toEqual("Query");
                expect(response.data.echoNoEnv.fieldName).toEqual("echoNoEnv");
                return [2 /*return*/];
        }
    });
}); });
function wait(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { return resolve(); }, ms);
    });
}
//# sourceMappingURL=NoneEnvFunctionTransformer.e2e.test.js.map