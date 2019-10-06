"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InputVerificationResult = /** @class */ (function () {
    function InputVerificationResult(verified, helpCommandAvailable, message) {
        if (verified === void 0) { verified = false; }
        if (helpCommandAvailable === void 0) { helpCommandAvailable = false; }
        if (message === void 0) { message = undefined; }
        this.verified = verified;
        this.helpCommandAvailable = helpCommandAvailable;
        this.message = message;
    }
    return InputVerificationResult;
}());
exports.default = InputVerificationResult;
//# sourceMappingURL=../../src/lib/domain/input-verification-result.js.map