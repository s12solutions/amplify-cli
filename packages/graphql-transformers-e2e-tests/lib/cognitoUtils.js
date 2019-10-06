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
var amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
var CognitoClient = require("aws-sdk/clients/cognitoidentityserviceprovider");
var TestStorage_1 = require("./TestStorage");
var cognitoClient = new CognitoClient({ apiVersion: '2016-04-19', region: 'us-west-2' });
function configureAmplify(userPoolId, userPoolClientId, identityPoolId) {
    aws_amplify_1.default.configure({
        Auth: {
            // REQUIRED - Amazon Cognito Region
            region: 'us-west-2',
            userPoolId: userPoolId,
            userPoolWebClientId: userPoolClientId,
            storage: new TestStorage_1.default(),
            identityPoolId: identityPoolId
        }
    });
}
exports.configureAmplify = configureAmplify;
function signupUser(userPoolId, name, pw) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var createUser = cognitoClient.adminCreateUser.bind(cognitoClient);
                    createUser({
                        UserPoolId: userPoolId,
                        UserAttributes: [{ Name: 'email', Value: name }],
                        Username: name,
                        TemporaryPassword: pw
                    }, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
exports.signupUser = signupUser;
function authenticateUser(user, details, realPw) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    user.authenticateUser(details, {
                        onSuccess: function (result) {
                            res(result);
                        },
                        onFailure: function (err) {
                            rej(err);
                        },
                        newPasswordRequired: function (userAttributes, requiredAttributes) {
                            user.completeNewPasswordChallenge(realPw, user.Attributes, this);
                        }
                    });
                })];
        });
    });
}
exports.authenticateUser = authenticateUser;
function signupAndAuthenticateUser(userPoolId, username, tmpPw, realPw) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, authDetails, user, authRes, e_2, authDetails, user, authRes, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Sign up then login user 1.ß
                    return [4 /*yield*/, signupUser(userPoolId, username, tmpPw)];
                case 1:
                    // Sign up then login user 1.ß
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.log("Trying to login with temp password");
                    return [3 /*break*/, 3];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    authDetails = new amazon_cognito_identity_js_1.AuthenticationDetails({
                        Username: username,
                        Password: tmpPw
                    });
                    user = aws_amplify_1.default.Auth.createCognitoUser(username);
                    return [4 /*yield*/, authenticateUser(user, authDetails, realPw)];
                case 4:
                    authRes = _a.sent();
                    return [2 /*return*/, authRes];
                case 5:
                    e_2 = _a.sent();
                    console.log("Trying to login with real password");
                    return [3 /*break*/, 6];
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    authDetails = new amazon_cognito_identity_js_1.AuthenticationDetails({
                        Username: username,
                        Password: realPw
                    });
                    user = aws_amplify_1.default.Auth.createCognitoUser(username);
                    return [4 /*yield*/, authenticateUser(user, authDetails, realPw)];
                case 7:
                    authRes = _a.sent();
                    console.log("Logged in " + username + " \n" + authRes.getIdToken().getJwtToken());
                    return [2 /*return*/, authRes];
                case 8:
                    e_3 = _a.sent();
                    console.error("Failed to login.\n");
                    console.error(e_3);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.signupAndAuthenticateUser = signupAndAuthenticateUser;
function deleteUser(accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        AccessToken: accessToken
                    };
                    cognitoClient.deleteUser(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
exports.deleteUser = deleteUser;
function createGroup(userPoolId, name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        GroupName: name,
                        UserPoolId: userPoolId
                    };
                    cognitoClient.createGroup(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
exports.createGroup = createGroup;
function addUserToGroup(groupName, username, userPoolId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        GroupName: groupName,
                        Username: username,
                        UserPoolId: userPoolId
                    };
                    cognitoClient.adminAddUserToGroup(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
exports.addUserToGroup = addUserToGroup;
function createUserPool(client, userPoolName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        PoolName: userPoolName,
                        Policies: {
                            PasswordPolicy: {
                                MinimumLength: 8,
                                RequireLowercase: true,
                                RequireNumbers: true,
                                RequireSymbols: true,
                                RequireUppercase: true,
                            }
                        },
                        Schema: [
                            {
                                Name: 'email',
                                Required: true,
                                Mutable: true
                            }
                        ],
                        AutoVerifiedAttributes: ['email']
                    };
                    client.createUserPool(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
exports.createUserPool = createUserPool;
function deleteUserPool(client, userPoolId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        UserPoolId: userPoolId
                    };
                    client.deleteUserPool(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
exports.deleteUserPool = deleteUserPool;
function createUserPoolClient(client, userPoolId, clientName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    var params = {
                        ClientName: clientName,
                        UserPoolId: userPoolId,
                        GenerateSecret: false,
                        RefreshTokenValidity: 30
                    };
                    client.createUserPoolClient(params, function (err, data) { return err ? rej(err) : res(data); });
                })];
        });
    });
}
exports.createUserPoolClient = createUserPoolClient;
//# sourceMappingURL=cognitoUtils.js.map