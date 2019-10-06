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
var aws_sdk_1 = require("aws-sdk");
var fs = require("fs");
function promisify(fun, args, that) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        fun.apply(that, [
                            args,
                            function (err, data) {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(data);
                            }
                        ]);
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var S3Client = /** @class */ (function () {
    function S3Client(region) {
        this.region = region;
        this.client = new aws_sdk_1.S3({ region: this.region });
    }
    S3Client.prototype.createBucket = function (bucketName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(this.client.createBucket, {
                            Bucket: bucketName,
                        }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.putBucketVersioning = function (bucketName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(this.client.putBucketVersioning, {
                            Bucket: bucketName,
                            VersioningConfiguration: {
                                Status: "Enabled"
                            }
                        }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.uploadZIPFile = function (bucketName, filePath, s3key, contentType) {
        if (contentType === void 0) { contentType = 'application/zip'; }
        return __awaiter(this, void 0, void 0, function () {
            var fileContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileContent = this.readZIPFile(filePath);
                        return [4 /*yield*/, promisify(this.client.putObject, {
                                Bucket: bucketName,
                                Key: s3key,
                                Body: fileContent,
                                ContentType: contentType
                            }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.uploadFile = function (bucketName, filePath, s3key) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileContent = this.readFile(filePath);
                        return [4 /*yield*/, promisify(this.client.putObject, {
                                Bucket: bucketName,
                                Key: s3key,
                                Body: fileContent
                            }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.getFileVersion = function (bucketName, s3key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(this.client.getObject, {
                            Bucket: bucketName,
                            Key: s3key
                        }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.getAllObjectVersions = function (bucketName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(this.client.listObjectVersions, {
                            Bucket: bucketName
                        }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.deleteObjectVersion = function (bucketName, versionId, s3key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(this.client.deleteObject, {
                            Bucket: bucketName,
                            Key: s3key,
                            VersionId: versionId
                        }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.deleteFile = function (bucketName, s3key) {
        return __awaiter(this, void 0, void 0, function () {
            var response, versions, _i, versions_1, version;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllObjectVersions(bucketName)];
                    case 1:
                        response = _a.sent();
                        versions = response.Versions;
                        _i = 0, versions_1 = versions;
                        _a.label = 2;
                    case 2:
                        if (!(_i < versions_1.length)) return [3 /*break*/, 5];
                        version = versions_1[_i];
                        return [4 /*yield*/, this.deleteObjectVersion(bucketName, version.VersionId, s3key)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    S3Client.prototype.deleteBucket = function (bucketName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(this.client.deleteBucket, {
                            Bucket: bucketName
                        }, this.client)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.setUpS3Resources = function (bucketName, filePath, s3key, zip) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createBucket(bucketName)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.putBucketVersioning(bucketName)];
                    case 2:
                        _a.sent();
                        if (!zip) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.uploadZIPFile(bucketName, filePath, s3key)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.uploadFile(bucketName, filePath, s3key)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.getFileVersion(bucketName, s3key)];
                    case 7: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    S3Client.prototype.cleanUpS3Resources = function (bucketName, s3key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deleteFile(bucketName, s3key)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.deleteBucket(bucketName)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    S3Client.prototype.readFile = function (filePath) {
        return fs.readFileSync(filePath, "utf8");
    };
    S3Client.prototype.readZIPFile = function (filePath) {
        return fs.createReadStream(filePath);
    };
    S3Client.prototype.wait = function (secs, fun) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(fun.apply(_this, args));
                        }, 1000 * secs);
                    })];
            });
        });
    };
    return S3Client;
}());
exports.S3Client = S3Client;
//# sourceMappingURL=S3Client.js.map