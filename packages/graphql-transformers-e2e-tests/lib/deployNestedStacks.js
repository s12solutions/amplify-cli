"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var fs = require("fs");
var path = require("path");
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
function cleanupBucket(client, directory, bucket, key, buildTimestamp) {
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, files_2, file, contentPath, s3Location, fileKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = fs.readdirSync(directory);
                    _i = 0, files_2 = files;
                    _a.label = 1;
                case 1:
                    if (!(_i < files_2.length)) return [3 /*break*/, 6];
                    file = files_2[_i];
                    contentPath = path.join(directory, file);
                    s3Location = path.join(key, file);
                    if (!fs.lstatSync(contentPath).isDirectory()) return [3 /*break*/, 3];
                    return [4 /*yield*/, cleanupBucket(client, contentPath, bucket, s3Location, buildTimestamp)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    fileKey = s3Location + '.' + buildTimestamp;
                    return [4 /*yield*/, client.deleteFile(bucket, fileKey)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function uploadDirectory(client, directory, bucket, key) {
    return __awaiter(this, void 0, void 0, function () {
        var s3LocationMap, files, _i, files_3, file, contentPath, s3Location, recMap, fileKey, fileContents, formattedName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    s3LocationMap = {};
                    files = fs.readdirSync(directory);
                    _i = 0, files_3 = files;
                    _a.label = 1;
                case 1:
                    if (!(_i < files_3.length)) return [3 /*break*/, 8];
                    file = files_3[_i];
                    contentPath = path.join(directory, file);
                    s3Location = path.join(key, file);
                    if (!fs.lstatSync(contentPath).isDirectory()) return [3 /*break*/, 3];
                    return [4 /*yield*/, uploadDirectory(client, contentPath, bucket, s3Location)];
                case 2:
                    recMap = _a.sent();
                    s3LocationMap = __assign(__assign({}, recMap), s3LocationMap);
                    return [3 /*break*/, 7];
                case 3:
                    fileKey = s3Location;
                    return [4 /*yield*/, client.wait(.25, function () { return Promise.resolve(); })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, fs.readFileSync(contentPath)];
                case 5:
                    fileContents = _a.sent();
                    console.log("Uploading file to " + bucket + "/" + fileKey);
                    return [4 /*yield*/, client.client.putObject({
                            Bucket: bucket,
                            Key: fileKey,
                            Body: fileContents
                        }).promise()];
                case 6:
                    _a.sent();
                    formattedName = file.split('.').map(function (s, i) { return i > 0 ? "" + s[0].toUpperCase() + s.slice(1, s.length) : s; }).join('');
                    s3LocationMap[formattedName] = 's3://' + path.join(bucket, fileKey);
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, s3LocationMap];
            }
        });
    });
}
function writeDeploymentToDisk(deployment, directory) {
    // Write the schema to disk
    var schema = deployment.schema;
    var fullSchemaPath = path.normalize(directory + "/schema.graphql");
    fs.writeFileSync(fullSchemaPath, schema);
    // Write resolvers to disk
    var resolverFileNames = Object.keys(deployment.resolvers);
    var resolverRootPath = path.normalize(directory + "/resolvers");
    if (!fs.existsSync(resolverRootPath)) {
        fs.mkdirSync(resolverRootPath);
    }
    for (var _i = 0, resolverFileNames_1 = resolverFileNames; _i < resolverFileNames_1.length; _i++) {
        var resolverFileName = resolverFileNames_1[_i];
        var fullResolverPath = path.normalize(resolverRootPath + '/' + resolverFileName);
        fs.writeFileSync(fullResolverPath, deployment.resolvers[resolverFileName]);
    }
    // Write the stacks to disk
    var stackNames = Object.keys(deployment.stacks);
    var stackRootPath = path.normalize(directory + "/stacks");
    if (!fs.existsSync(stackRootPath)) {
        fs.mkdirSync(stackRootPath);
    }
    for (var _a = 0, stackNames_1 = stackNames; _a < stackNames_1.length; _a++) {
        var stackFileName = stackNames_1[_a];
        var fullStackPath = path.normalize(stackRootPath + '/' + stackFileName + '.json');
        fs.writeFileSync(fullStackPath, JSON.stringify(deployment.stacks[stackFileName], null, 4));
    }
    // Write any functions to disk
    var functionNames = Object.keys(deployment.functions);
    var functionRootPath = path.normalize(directory + "/functions");
    if (!fs.existsSync(functionRootPath)) {
        fs.mkdirSync(functionRootPath);
    }
    for (var _b = 0, functionNames_1 = functionNames; _b < functionNames_1.length; _b++) {
        var functionName = functionNames_1[_b];
        var fullFunctionPath = path.normalize(functionRootPath + '/' + functionName);
        var zipContents = fs.readFileSync(deployment.functions[functionName]);
        fs.writeFileSync(fullFunctionPath, zipContents);
    }
    // Write any pipeline functions to disk
    var pipelineFunctions = Object.keys(deployment.pipelineFunctions);
    var pipelineFunctionsPath = path.normalize(directory + "/pipelineFunctions");
    if (!fs.existsSync(pipelineFunctionsPath)) {
        fs.mkdirSync(pipelineFunctionsPath);
    }
    for (var _c = 0, pipelineFunctions_1 = pipelineFunctions; _c < pipelineFunctions_1.length; _c++) {
        var pipelineFunctionName = pipelineFunctions_1[_c];
        var fullFunctionPath = path.normalize(pipelineFunctionsPath + '/' + pipelineFunctionName);
        fs.writeFileSync(fullFunctionPath, deployment.pipelineFunctions[pipelineFunctionName]);
    }
    var rootStack = deployment.rootStack;
    var rootStackPath = path.normalize(directory + "/rootStack.json");
    fs.writeFileSync(rootStackPath, JSON.stringify(rootStack, null, 4));
}
function cleanupS3Bucket(s3Client, buildPath, bucketName, rootKey, buildTimestamp) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, cleanupBucket(s3Client, buildPath, bucketName, rootKey, buildTimestamp)];
        });
    });
}
exports.cleanupS3Bucket = cleanupS3Bucket;
function deploy(s3Client, cf, stackName, deploymentResources, params, buildPath, bucketName, rootKey, buildTimeStamp) {
    return __awaiter(this, void 0, void 0, function () {
        var s3RootKey, e_1, finishedStack, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    try {
                        if (!fs.existsSync(buildPath)) {
                            fs.mkdirSync(buildPath);
                        }
                        console.log("Cleaning up previous deployments...");
                        deleteDirectory(buildPath);
                        console.log("Done cleaning up previous deployments.");
                    }
                    catch (e) {
                        console.error("Error cleaning up build directory: " + e);
                    }
                    try {
                        console.log('Adding APIKey to deployment');
                        addAPIKeys(deploymentResources);
                        console.log('Finished adding APIKey to deployment');
                        console.log('Writing deployment to disk...');
                        writeDeploymentToDisk(deploymentResources, buildPath);
                        console.log('Finished writing deployment to disk.');
                    }
                    catch (e) {
                        console.error("Error writing files to disk: " + e);
                        throw (e);
                    }
                    s3RootKey = rootKey + "/" + buildTimeStamp;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log('Uploading deployment to S3...');
                    return [4 /*yield*/, uploadDirectory(s3Client, buildPath, bucketName, s3RootKey)];
                case 2:
                    _a.sent();
                    console.log('Finished uploading deployment to S3.');
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log("Error uploading deployment to s3: " + e_1);
                    throw e_1;
                case 4:
                    _a.trys.push([4, 8, , 9]);
                    console.log("Deploying root stack...");
                    return [4 /*yield*/, cf.createStack(deploymentResources.rootStack, stackName, __assign(__assign({}, params), { S3DeploymentBucket: bucketName, S3DeploymentRootKey: s3RootKey }))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, cf.waitForStack(stackName)];
                case 6:
                    finishedStack = _a.sent();
                    console.log("Done deploying root stack...");
                    return [4 /*yield*/, cf.wait(10, function () { return Promise.resolve(); })];
                case 7:
                    _a.sent();
                    return [2 /*return*/, finishedStack];
                case 8:
                    e_2 = _a.sent();
                    console.log("Error deploying cloudformation stack: " + e_2);
                    throw (e_2);
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.deploy = deploy;
function addAPIKeys(stack) {
    if (!stack.rootStack.Resources.GraphQLAPIKey) {
        stack.rootStack.Resources.GraphQLAPIKey = {
            "Type": "AWS::AppSync::ApiKey",
            "Properties": {
                "ApiId": {
                    "Fn::GetAtt": [
                        "GraphQLAPI",
                        "ApiId"
                    ]
                }
            }
        };
    }
    if (!stack.rootStack.Outputs.GraphQLAPIKeyOutput) {
        stack.rootStack.Outputs.GraphQLAPIKeyOutput = {
            "Value": {
                "Fn::GetAtt": [
                    "GraphQLAPIKey",
                    "ApiKey"
                ]
            },
        };
    }
}
//# sourceMappingURL=deployNestedStacks.js.map