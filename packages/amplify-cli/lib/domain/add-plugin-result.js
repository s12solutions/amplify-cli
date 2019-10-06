"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddPluginResult = /** @class */ (function () {
    function AddPluginResult(isAdded, pluginVerificationResult, error) {
        if (isAdded === void 0) { isAdded = false; }
        this.isAdded = isAdded;
        this.pluginVerificationResult = pluginVerificationResult;
        this.error = error;
    }
    return AddPluginResult;
}());
exports.default = AddPluginResult;
var AddPluginError;
(function (AddPluginError) {
    AddPluginError["FailedVerification"] = "FailedVerification";
    AddPluginError["Other"] = "Other";
})(AddPluginError = exports.AddPluginError || (exports.AddPluginError = {}));
//# sourceMappingURL=../../src/lib/domain/add-plugin-result.js.map