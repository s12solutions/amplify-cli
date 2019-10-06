"use strict";
var os = require('os');
function getGitIgnoreBlob() {
    var ignoreList = [
        'amplify/\\#current-cloud-backend',
        'amplify/.config/local-*',
        'amplify/backend/amplify-meta.json',
        'amplify/backend/awscloudformation',
        'build/',
        'dist/',
        'node_modules/',
        'aws-exports.js',
        'awsconfiguration.json'
    ];
    var toAppend = "" + (os.EOL + os.EOL) + ignoreList.join(os.EOL);
    return toAppend;
}
module.exports = {
    getGitIgnoreBlob: getGitIgnoreBlob,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/get-git-ignore-blob.js.map