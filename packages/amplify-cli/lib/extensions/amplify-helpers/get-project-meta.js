"use strict";
var pathManager = require('./path-manager');
var readJsonFile = require('./read-json-file').readJsonFile;
function getProjectMeta() {
    var amplifyMetaFilePath = pathManager.getAmplifyMetaFilePath();
    var amplifyMeta = readJsonFile(amplifyMetaFilePath);
    return amplifyMeta;
}
module.exports = {
    getProjectMeta: getProjectMeta,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-project-meta.js.map