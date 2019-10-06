"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
function getFunctionDetails(fnName) {
    const lambdaFolder = path.join(__dirname, 'lambda_functions');
    if (!fs.existsSync(path.join(lambdaFolder, `${fnName}.js`))) {
        throw new Error(`Can not find lambda function ${fnName}`);
    }
    return {
        packageFolder: lambdaFolder,
        fileName: `${fnName}.js`,
        handler: 'handler'
    };
}
exports.getFunctionDetails = getFunctionDetails;
//# sourceMappingURL=lambda-helper.js.map