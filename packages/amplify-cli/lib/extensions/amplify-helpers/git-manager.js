"use strict";
var fs = require('fs-extra');
var os = require('os');
var amplifyMark = '#amplify';
var amplifyMarkRegExp = new RegExp("^" + amplifyMark);
function insertAmplifyIgnore(gitIgnoreFilePath) {
    if (fs.existsSync(gitIgnoreFilePath)) {
        removeAmplifyIgnore(gitIgnoreFilePath);
        fs.appendFileSync(gitIgnoreFilePath, getGitIgnoreAppendString());
    }
    else {
        fs.writeFileSync(gitIgnoreFilePath, getGitIgnoreAppendString().trim());
    }
}
function removeAmplifyIgnore(gitIgnoreFilePath) {
    if (fs.existsSync(gitIgnoreFilePath)) {
        var newGitIgnoreString = '';
        var gitIgnoreStringArray = fs.readFileSync(gitIgnoreFilePath, 'utf8').split(os.EOL);
        var isInRemoval = false;
        for (var i = 0; i < gitIgnoreStringArray.length; i++) {
            var newLine = gitIgnoreStringArray[i].trim();
            if (isInRemoval) {
                if (newLine.length === 0) {
                    isInRemoval = false;
                }
            }
            else if (amplifyMarkRegExp.test(newLine)) {
                isInRemoval = true;
            }
            else {
                newGitIgnoreString += newLine + os.EOL;
            }
        }
        newGitIgnoreString = newGitIgnoreString.trim();
        fs.writeFileSync(gitIgnoreFilePath, newGitIgnoreString);
    }
}
function getGitIgnoreAppendString() {
    var ignoreList = [
        'amplify/\\#current-cloud-backend',
        'amplify/.config/local-*',
        'amplify/mock-data',
        'amplify/backend/amplify-meta.json',
        'amplify/backend/awscloudformation',
        'build/',
        'dist/',
        'node_modules/',
        'aws-exports.js',
        'awsconfiguration.json'
    ];
    var toAppend = "" + (os.EOL + os.EOL + amplifyMark + os.EOL) + ignoreList.join(os.EOL);
    return toAppend;
}
module.exports = {
    insertAmplifyIgnore: insertAmplifyIgnore,
    removeAmplifyIgnore: removeAmplifyIgnore,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/git-manager.js.map