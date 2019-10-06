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
module.exports = {
    name: 'publish',
    run: function (context) { return __awaiter(void 0, void 0, void 0, function () {
        var amplifyMeta, isHostingAdded, isHostingAlreadyPushed, didPush, continueToPublish, frontendPlugins, frontendHandlerModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context.amplify.constructExeInfo(context);
                    amplifyMeta = context.exeInfo.amplifyMeta;
                    isHostingAdded = amplifyMeta.hosting && Object.keys(amplifyMeta.hosting).length > 0;
                    if (!isHostingAdded) {
                        context.print.info('');
                        context.print.error('Please add hosting to your project before publishing your project');
                        context.print.info('Command: amplify hosting add');
                        context.print.info('');
                        return [2 /*return*/];
                    }
                    isHostingAlreadyPushed = false;
                    Object.keys(amplifyMeta.hosting).every(function (hostingService) {
                        var continueToCheckNext = true;
                        if (amplifyMeta.hosting[hostingService].lastPushTimeStamp) {
                            var lastPushTime = new Date(amplifyMeta.hosting[hostingService].lastPushTimeStamp);
                            if (lastPushTime < Date.now()) {
                                isHostingAlreadyPushed = true;
                                continueToCheckNext = false;
                            }
                        }
                        return continueToCheckNext;
                    });
                    return [4 /*yield*/, context.amplify.pushResources(context)];
                case 1:
                    didPush = _a.sent();
                    continueToPublish = didPush;
                    if (!(!continueToPublish && isHostingAlreadyPushed)) return [3 /*break*/, 3];
                    context.print.info('');
                    return [4 /*yield*/, context.amplify.confirmPrompt.run('Do you still want to publish the frontend?')];
                case 2:
                    continueToPublish = _a.sent();
                    _a.label = 3;
                case 3:
                    if (!continueToPublish) return [3 /*break*/, 5];
                    frontendPlugins = context.amplify.getFrontendPlugins(context);
                    frontendHandlerModule = require(frontendPlugins[context.exeInfo.projectConfig.frontend]);
                    return [4 /*yield*/, frontendHandlerModule.publish(context)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); },
};
//# sourceMappingURL=../../src/lib/commands/publish.js.map