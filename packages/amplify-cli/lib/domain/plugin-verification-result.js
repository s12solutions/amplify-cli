"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PluginVerificationResult = /** @class */ (function () {
    function PluginVerificationResult(verified, error, errorInfo, packageJson, manifest) {
        if (verified === void 0) { verified = false; }
        this.verified = verified;
        this.error = error;
        this.errorInfo = errorInfo;
        this.packageJson = packageJson;
        this.manifest = manifest;
    }
    return PluginVerificationResult;
}());
exports.default = PluginVerificationResult;
var PluginVerificationError;
(function (PluginVerificationError) {
    PluginVerificationError["PluginDirPathNotExist"] = "PluginDirPathNotExist";
    PluginVerificationError["InvalidNodePackage"] = "InvalidNodePackage";
    PluginVerificationError["MissingManifest"] = "MissingManifest";
    PluginVerificationError["InvalidManifest"] = "InvalidManifest";
    PluginVerificationError["MissingExecuteAmplifyCommandMethod"] = "MissingExecuteAmplifyCommandMethod";
    PluginVerificationError["MissingHandleAmplifyEventMethod"] = "MissingHandleAmplifyEventMethod";
})(PluginVerificationError = exports.PluginVerificationError || (exports.PluginVerificationError = {}));
//# sourceMappingURL=../../src/lib/domain/plugin-verification-result.js.map