"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
function getMockDataDirectory(context) {
    const { projectPath } = context.amplify.getEnvInfo();
    return path.join(projectPath, 'amplify', 'mock-data');
}
exports.getMockDataDirectory = getMockDataDirectory;
//# sourceMappingURL=mock-data-directory.js.map