"use strict";
var path = require('path');
var fs = require('fs');
var homedir = require('os').homedir();
var amplifyCLIConstants = require('./constants.js');
/* Helpers */
function projectPathValidate(projectPath) {
    var isGood = false;
    if (fs.existsSync(projectPath)) {
        var amplifyDirPath = getAmplifyDirPath(projectPath);
        var infoSubDirPath = getDotConfigDirPath(projectPath);
        isGood = fs.existsSync(amplifyDirPath) &&
            fs.existsSync(infoSubDirPath);
    }
    return isGood;
}
function searchProjectRootPath() {
    var result;
    var currentPath = process.cwd();
    do {
        if (projectPathValidate(currentPath)) {
            result = currentPath;
            break;
        }
        else {
            var parentPath = path.dirname(currentPath);
            if (currentPath === parentPath) {
                break;
            }
            else {
                currentPath = parentPath;
            }
        }
        /* eslint-disable */
    } while (true); /* eslint-enable */
    return result;
}
function getHomeDotAmplifyDirPath() {
    return path.join(homedir, amplifyCLIConstants.DotAmplifyDirName);
}
// ///////////////////level 0
function getAmplifyDirPath(projectPath) {
    if (!projectPath) {
        projectPath = searchProjectRootPath();
    }
    if (projectPath) {
        return path.normalize(path.join(projectPath, amplifyCLIConstants.AmplifyCLIDirName));
    }
    throw new Error('You are not working inside a valid amplify project.\nUse \'amplify init\' in the root of your app directory to initialize your project with Amplify');
}
// ///////////////////level 1
function getDotConfigDirPath(projectPath) {
    return path.normalize(path.join(getAmplifyDirPath(projectPath), amplifyCLIConstants.DotConfigamplifyCLISubDirName));
}
function getBackendDirPath(projectPath) {
    return path.normalize(path.join(getAmplifyDirPath(projectPath), amplifyCLIConstants.BackendamplifyCLISubDirName));
}
function getCurrentCloudBackendDirPath(projectPath) {
    return path.normalize(path.join(getAmplifyDirPath(projectPath), amplifyCLIConstants.CurrentCloudBackendamplifyCLISubDirName));
}
function getAmplifyRcFilePath(projectPath) {
    if (!projectPath) {
        projectPath = searchProjectRootPath();
    }
    if (projectPath) {
        return path.normalize(path.join(projectPath, '.amplifyrc'));
    }
    throw new Error('You are not working inside a valid amplify project.\nUse \'amplify init\' in the root of your app directory to initialize your project with Amplify');
}
function getGitIgnoreFilePath(projectPath) {
    if (!projectPath) {
        projectPath = searchProjectRootPath();
    }
    if (projectPath) {
        return path.normalize(path.join(projectPath, '.gitignore'));
    }
    throw new Error('You are not working inside a valid amplify project.\nUse \'amplify init\' in the root of your app directory to initialize your project with Amplify');
}
// ///////////////////level 2
function getProjectConfigFilePath(projectPath) {
    return path.normalize(path.join(getDotConfigDirPath(projectPath), amplifyCLIConstants.ProjectConfigFileName));
}
function getLocalEnvFilePath(projectPath) {
    return path.normalize(path.join(getDotConfigDirPath(projectPath), amplifyCLIConstants.LocalEnvFileName));
}
function getProviderInfoFilePath(projectPath) {
    return path.normalize(path.join(getAmplifyDirPath(projectPath), amplifyCLIConstants.ProviderInfoFileName));
}
function getBackendConfigFilePath(projectPath) {
    return path.normalize(path.join(getBackendDirPath(projectPath), amplifyCLIConstants.BackendConfigFileName));
}
function getCurrentBackendConfigFilePath(projectPath) {
    return path.normalize(path.join(getCurrentCloudBackendDirPath(projectPath), amplifyCLIConstants.BackendConfigFileName));
}
function getPluginConfigFilePath(projectPath) {
    return path.normalize(path.join(getDotConfigDirPath(projectPath), amplifyCLIConstants.PluginConfigFileName));
}
function getAmplifyMetaFilePath(projectPath) {
    return path.normalize(path.join(getBackendDirPath(projectPath), amplifyCLIConstants.amplifyMetaFileName));
}
function getCurentAmplifyMetaFilePath(projectPath) {
    return path.normalize(path.join(getCurrentCloudBackendDirPath(projectPath), amplifyCLIConstants.amplifyMetaFileName));
}
module.exports = {
    searchProjectRootPath: searchProjectRootPath,
    getHomeDotAmplifyDirPath: getHomeDotAmplifyDirPath,
    getAmplifyDirPath: getAmplifyDirPath,
    getDotConfigDirPath: getDotConfigDirPath,
    getBackendDirPath: getBackendDirPath,
    getAmplifyRcFilePath: getAmplifyRcFilePath,
    getProjectConfigFilePath: getProjectConfigFilePath,
    getCurrentCloudBackendDirPath: getCurrentCloudBackendDirPath,
    getPluginConfigFilePath: getPluginConfigFilePath,
    getAmplifyMetaFilePath: getAmplifyMetaFilePath,
    getGitIgnoreFilePath: getGitIgnoreFilePath,
    getCurentAmplifyMetaFilePath: getCurentAmplifyMetaFilePath,
    getLocalEnvFilePath: getLocalEnvFilePath,
    getProviderInfoFilePath: getProviderInfoFilePath,
    getBackendConfigFilePath: getBackendConfigFilePath,
    getCurrentBackendConfigFilePath: getCurrentBackendConfigFilePath,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/path-manager.js.map