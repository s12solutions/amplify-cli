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
var cognitoUtils_1 = require("./cognitoUtils");
var USERNAME1 = 'user1@test.com';
var USERNAME2 = 'user2@test.com';
var USERNAME3 = 'user3@test.com';
var TMP_PASSWORD = 'Password123!';
var REAL_PASSWORD = 'Password1234!';
var ADMIN_GROUP_NAME = 'Admin';
var DEVS_GROUP_NAME = 'Devs';
var PARTICIPANT_GROUP_NAME = 'Participant';
var WATCHER_GROUP_NAME = 'Watcher';
function setupUserPool(userPoolId, userPoolClientId) {
    return __awaiter(this, void 0, void 0, function () {
        var authRes3, authResAfterGroup, idToken, accessToken, authRes2AfterGroup, idToken2, idToken3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cognitoUtils_1.configureAmplify(userPoolId, userPoolClientId);
                    return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(userPoolId, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(userPoolId, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(userPoolId, USERNAME3, TMP_PASSWORD, REAL_PASSWORD)];
                case 3:
                    authRes3 = _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.createGroup(userPoolId, ADMIN_GROUP_NAME)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.createGroup(userPoolId, PARTICIPANT_GROUP_NAME)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.createGroup(userPoolId, WATCHER_GROUP_NAME)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.createGroup(userPoolId, DEVS_GROUP_NAME)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.addUserToGroup(ADMIN_GROUP_NAME, USERNAME1, userPoolId)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.addUserToGroup(PARTICIPANT_GROUP_NAME, USERNAME1, userPoolId)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.addUserToGroup(WATCHER_GROUP_NAME, USERNAME1, userPoolId)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.addUserToGroup(DEVS_GROUP_NAME, USERNAME2, userPoolId)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(userPoolId, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
                case 12:
                    authResAfterGroup = _a.sent();
                    idToken = authResAfterGroup.getIdToken().getJwtToken();
                    accessToken = authResAfterGroup.getAccessToken().getJwtToken();
                    return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(userPoolId, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
                case 13:
                    authRes2AfterGroup = _a.sent();
                    idToken2 = authRes2AfterGroup.getIdToken().getJwtToken();
                    idToken3 = authRes3.getIdToken().getJwtToken();
                    return [2 /*return*/, [idToken, idToken2, idToken3]];
            }
        });
    });
}
exports.setupUserPool = setupUserPool;
//# sourceMappingURL=setupUserPool.js.map