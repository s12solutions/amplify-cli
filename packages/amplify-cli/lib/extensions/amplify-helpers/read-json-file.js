"use strict";
var fs = require('fs-extra');
function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return content;
}
function readJsonFile(jsonFilePath, encoding) {
    if (encoding === void 0) { encoding = 'utf8'; }
    return JSON.parse(stripBOM(fs.readFileSync(jsonFilePath, encoding)));
}
module.exports = {
    readJsonFile: readJsonFile,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/read-json-file.js.map