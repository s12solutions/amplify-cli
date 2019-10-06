"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var FunctionResourceIDs = /** @class */ (function () {
    function FunctionResourceIDs() {
    }
    FunctionResourceIDs.FunctionDataSourceID = function (name, region) {
        return "" + util_1.simplifyName(name) + util_1.simplifyName(region || '') + "LambdaDataSource";
    };
    FunctionResourceIDs.FunctionIAMRoleID = function (name, region) {
        return FunctionResourceIDs.FunctionDataSourceID(name, region) + "Role";
    };
    FunctionResourceIDs.FunctionAppSyncFunctionConfigurationID = function (name, region) {
        return "Invoke" + FunctionResourceIDs.FunctionDataSourceID(name, region);
    };
    return FunctionResourceIDs;
}());
exports.FunctionResourceIDs = FunctionResourceIDs;
//# sourceMappingURL=FunctionResourceIDs.js.map