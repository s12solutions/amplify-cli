"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require('fs-extra');
var chalk = require('chalk');
var path = require('path');
var ora = require('ora');
var makeId = require('../extensions/amplify-helpers/make-id').makeId;
var constants = require('../extensions/amplify-helpers/constants');
var gitManager = require('../extensions/amplify-helpers/git-manager');
var readJsonFile = require('../extensions/amplify-helpers/read-json-file').readJsonFile;
var spinner = ora('');
var run = require('../commands/push').run;
var pushRun = run;
var _a = require('../extensions/amplify-helpers/path-manager'), searchProjectRootPath = _a.searchProjectRootPath, getAmplifyDirPath = _a.getAmplifyDirPath, getDotConfigDirPath = _a.getDotConfigDirPath, getProjectConfigFilePath = _a.getProjectConfigFilePath, getAmplifyMetaFilePath = _a.getAmplifyMetaFilePath, getCurentAmplifyMetaFilePath = _a.getCurentAmplifyMetaFilePath, getLocalEnvFilePath = _a.getLocalEnvFilePath, getProviderInfoFilePath = _a.getProviderInfoFilePath, getBackendConfigFilePath = _a.getBackendConfigFilePath, getGitIgnoreFilePath = _a.getGitIgnoreFilePath, getAmplifyRcFilePath = _a.getAmplifyRcFilePath;
var confirmMigrateMessage = 'We detected the project was initialized using an older version of the CLI. Do you want to migrate the project, so that it is compatible with the latest version of the CLI?';
var secondConfirmMessage = 'The CLI would be modifying your Amplify backend configuration files as a part of the migration process, hence we highly recommend backing up your existing local project before moving ahead. Are you sure you want to continue?';
function migrateProject(context) {
    return __awaiter(this, void 0, void 0, function () {
        var projectPath, projectConfigFilePath, projectConfig, infoMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectPath = searchProjectRootPath();
                    if (!projectPath) {
                        // New project, hence not able to find the amplify dir
                        return [2 /*return*/];
                    }
                    projectConfigFilePath = getProjectConfigFilePath(projectPath);
                    projectConfig = readJsonFile(projectConfigFilePath);
                    // First level check
                    // New projects also don't have projectPaths
                    if (!projectConfig.projectPath) {
                        return [2 /*return*/];
                    }
                    if (!(projectConfig.version !== constants.PROJECT_CONFIG_VERSION)) return [3 /*break*/, 4];
                    return [4 /*yield*/, context.prompt.confirm(confirmMigrateMessage)];
                case 1:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    infoMessage = chalk.bold('The CLI is going to take the following actions during the migration step:') + "\n" +
                        '\n1. If you have a GraphQL API, we will update the corresponding Cloudformation stack to support larger annotated schemas and custom resolvers.\n' +
                        'In this process, we will be making Cloudformation API calls to update your GraphQL API Cloudformation stack. This operation will result in deletion of your AppSync resolvers and then the creation of new ones and for a brief while your AppSync API will be unavailable until the migration finishes\n' +
                        '\n2. We will be updating your local Cloudformation files present inside the ‘amplify/‘ directory of your app project, for all the added categories so that it supports multiple environments\n' +
                        '\n3. After the migration completes, we will give you the option to either push these Cloudformation files right away or you could inspect them yourselves and later push the updated Cloudformation files to the cloud\n' +
                        '\n4. If for any reason the migration fails, the CLI will rollback your cloud and local changes and you can take a look at https://aws-amplify.github.io/docs/cli/migrate?sdk=js for manually migrating your project so that it’s compatible with the latest version of the CLI\n' +
                        '\n5. ALL THE ABOVE MENTIONED OPERATIONS WILL NOT DELETE ANY DATA FROM ANY OF YOUR DATA STORES\n' +
                        ("\n" + chalk.bold('Before the migration, please be aware of the following things:') + "\n") +
                        '\n1. Make sure to have an internet connection through the migration process\n' +
                        '\n2. Make sure to not exit/terminate the migration process (by interrupting it explicitly in the middle of migration), as this will lead to inconsistency within your project\n' +
                        '\n3. Make sure to take a backup of your entire project (including the amplify related config files)\n';
                    context.print.info(infoMessage);
                    context.print.info(chalk.red('IF YOU\'VE MODIFIED ANY CLOUDFORMATION FILES MANUALLY, PLEASE CHECK AND DIFF YOUR CLOUDFORMATION FILES BEFORE PUSHING YOUR RESOURCES IN THE CLOUD IN THE LAST STEP OF THIS MIGRATION.'));
                    return [4 /*yield*/, context.prompt.confirm(secondConfirmMessage)];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    // Currently there are only two project configuration versions, so call this method directly
                    // If more versions are involved, switch to apropriate migration method
                    return [4 /*yield*/, migrateFrom0To1(context, projectPath, projectConfig)];
                case 3:
                    // Currently there are only two project configuration versions, so call this method directly
                    // If more versions are involved, switch to apropriate migration method
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function migrateFrom0To1(context, projectPath, projectConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var amplifyDirPath, backupAmplifyDirPath, categoryMigrationTasks_1, categoryPlugins_1, apiMigrateFunction_1, i, e_1, e_2, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, 12, 13]);
                    amplifyDirPath = getAmplifyDirPath(projectPath);
                    backupAmplifyDirPath = backup(amplifyDirPath, projectPath);
                    context.migrationInfo = generateMigrationInfo(projectConfig, projectPath);
                    categoryMigrationTasks_1 = [];
                    categoryPlugins_1 = context.amplify.getCategoryPlugins(context);
                    Object.keys(categoryPlugins_1).forEach(function (category) {
                        try {
                            var migrate_1 = require(categoryPlugins_1[category]).migrate;
                            if (migrate_1) {
                                if (category !== 'api') {
                                    categoryMigrationTasks_1.push(function () { return migrate_1(context); });
                                }
                                else {
                                    apiMigrateFunction_1 = migrate_1;
                                }
                            }
                        }
                        catch (e) {
                            // do nothing, it's fine if a category is not setup for migration
                        }
                    });
                    if (apiMigrateFunction_1) {
                        categoryMigrationTasks_1.unshift(function () { return apiMigrateFunction_1(context, 'AppSync'); });
                        categoryMigrationTasks_1.push(function () { return apiMigrateFunction_1(context, 'API Gateway'); });
                    }
                    spinner.start('Migrating your project');
                    persistMigrationContext(context.migrationInfo);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < categoryMigrationTasks_1.length)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, categoryMigrationTasks_1[i]()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    throw e_1;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6:
                    removeAmplifyRCFile(projectPath);
                    updateGitIgnoreFile(projectPath);
                    spinner.succeed('Migrated your project successfully.');
                    context.print.warning('If you have added functions or interactions category to your project, please check the \'Auto-migration\' section at https://github.com/aws-amplify/docs/blob/master/cli/migrate.md');
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, pushRun(context)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_2 = _a.sent();
                    throw e_2;
                case 10: return [3 /*break*/, 13];
                case 11:
                    e_3 = _a.sent();
                    spinner.fail('There was an error migrating your project.');
                    rollback(amplifyDirPath, backupAmplifyDirPath);
                    context.print.info('migration operations are rolledback.');
                    throw e_3;
                case 12:
                    cleanUp(backupAmplifyDirPath);
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function backup(amplifyDirPath, projectPath) {
    var backupAmplifyDirName = constants.AmplifyCLIDirName + "-" + makeId(5);
    var backupAmplifyDirPath = path.join(projectPath, backupAmplifyDirName);
    fs.copySync(amplifyDirPath, backupAmplifyDirPath);
    return backupAmplifyDirPath;
}
function rollback(amplifyDirPath, backupAmplifyDirPath) {
    if (backupAmplifyDirPath && fs.existsSync(backupAmplifyDirPath)) {
        fs.removeSync(amplifyDirPath);
        fs.moveSync(backupAmplifyDirPath, amplifyDirPath);
    }
}
function cleanUp(backupAmplifyDirPath) {
    fs.removeSync(backupAmplifyDirPath);
}
function generateMigrationInfo(projectConfig, projectPath) {
    var migrationInfo = {
        projectPath: projectPath,
        initVersion: projectConfig.version,
        newVersion: constants.PROJECT_CONFIG_VERSION,
    };
    migrationInfo.amplifyMeta = getAmplifyMeta(projectPath);
    migrationInfo.currentAmplifyMeta = getCurrentAmplifyMeta(projectPath);
    migrationInfo.projectConfig = generateNewProjectConfig(projectConfig);
    migrationInfo.localEnvInfo = generateLocalEnvInfo(projectConfig);
    migrationInfo.localAwsInfo = generateLocalAwsInfo(projectPath);
    migrationInfo.teamProviderInfo = generateTeamProviderInfo(migrationInfo.amplifyMeta);
    migrationInfo.backendConfig = generateBackendConfig(migrationInfo.amplifyMeta);
    return migrationInfo;
}
function persistMigrationContext(migrationInfo) {
    persistAmplifyMeta(migrationInfo.amplifyMeta, migrationInfo.projectPath);
    persistCurrentAmplifyMeta(migrationInfo.currentAmplifyMeta, migrationInfo.projectPath);
    persistProjectConfig(migrationInfo.projectConfig, migrationInfo.projectPath);
    persistLocalEnvInfo(migrationInfo.localEnvInfo, migrationInfo.projectPath);
    persistLocalAwsInfo(migrationInfo.localAwsInfo, migrationInfo.projectPath);
    persistTeamProviderInfo(migrationInfo.teamProviderInfo, migrationInfo.projectPath);
    persistBackendConfig(migrationInfo.backendConfig, migrationInfo.projectPath);
}
function getAmplifyMeta(projectPath) {
    var amplifyMetafilePath = getAmplifyMetaFilePath(projectPath);
    return readJsonFile(amplifyMetafilePath);
}
function persistAmplifyMeta(amplifyMeta, projectPath) {
    if (amplifyMeta) {
        var amplifyMetafilePath = getAmplifyMetaFilePath(projectPath);
        var jsonString = JSON.stringify(amplifyMeta, null, 4);
        fs.writeFileSync(amplifyMetafilePath, jsonString, 'utf8');
    }
}
function getCurrentAmplifyMeta(projectPath) {
    var currentAmplifyMetafilePath = getCurentAmplifyMetaFilePath(projectPath);
    return readJsonFile(currentAmplifyMetafilePath);
}
function persistCurrentAmplifyMeta(currentAmplifyMeta, projectPath) {
    if (currentAmplifyMeta) {
        var currentAmplifyMetafilePath = getCurentAmplifyMetaFilePath(projectPath);
        var jsonString = JSON.stringify(currentAmplifyMeta, null, 4);
        fs.writeFileSync(currentAmplifyMetafilePath, jsonString, 'utf8');
    }
}
function generateNewProjectConfig(projectConfig) {
    var newProjectConfig = {};
    Object.assign(newProjectConfig, projectConfig);
    // These attributes are now stores in amplify/.config/local-env-info.json
    delete newProjectConfig.projectPath;
    delete newProjectConfig.defaultEditor;
    // Modify frontend handler
    var frontendPluginPath = Object.keys(projectConfig.frontendHandler)[0];
    var frontendPlugin = frontendPluginPath.split('/')[frontendPluginPath.split('/').length - 1];
    var frontend = frontendPlugin.split('-')[frontendPlugin.split('-').length - 1];
    newProjectConfig.frontend = frontend;
    if (projectConfig["amplify-frontend-" + frontend]) {
        newProjectConfig[frontend] = projectConfig["amplify-frontend-" + frontend];
        delete newProjectConfig["amplify-frontend-" + frontend];
    }
    delete newProjectConfig.frontendHandler;
    newProjectConfig.version = constants.PROJECT_CONFIG_VERSION;
    // Modify provider handler
    var providers = Object.keys(projectConfig.providers);
    newProjectConfig.providers = providers;
    return newProjectConfig;
}
function persistProjectConfig(projectConfig, projectPath) {
    if (projectConfig) {
        var projectConfigFilePath = getProjectConfigFilePath(projectPath);
        var jsonString = JSON.stringify(projectConfig, null, 4);
        fs.writeFileSync(projectConfigFilePath, jsonString, 'utf8');
    }
}
function generateLocalEnvInfo(projectConfig) {
    return {
        projectPath: projectConfig.projectPath,
        defaultEditor: projectConfig.defaultEditor,
        envName: 'NONE',
    };
}
function persistLocalEnvInfo(localEnvInfo, projectPath) {
    if (localEnvInfo) {
        var jsonString = JSON.stringify(localEnvInfo, null, 4);
        var localEnvFilePath = getLocalEnvFilePath(projectPath);
        fs.writeFileSync(localEnvFilePath, jsonString, 'utf8');
    }
}
function generateLocalAwsInfo(projectPath) {
    var newAwsInfo;
    var dotConfigDirPath = getDotConfigDirPath(projectPath);
    var awsInfoFilePath = path.join(dotConfigDirPath, 'aws-info.json');
    if (fs.existsSync(awsInfoFilePath)) {
        var awsInfo = readJsonFile(awsInfoFilePath);
        awsInfo.configLevel = 'project'; // Old version didn't support "General" configuation
        newAwsInfo = { NONE: awsInfo };
        fs.removeSync(awsInfoFilePath);
    }
    return newAwsInfo;
}
function persistLocalAwsInfo(localAwsInfo, projectPath) {
    if (localAwsInfo) {
        var dotConfigDirPath = getDotConfigDirPath(projectPath);
        var jsonString = JSON.stringify(localAwsInfo, null, 4);
        var localAwsInfoFilePath = path.join(dotConfigDirPath, 'local-aws-info.json');
        fs.writeFileSync(localAwsInfoFilePath, jsonString, 'utf8');
    }
}
function generateTeamProviderInfo(amplifyMeta) {
    return { NONE: amplifyMeta.providers };
}
function persistTeamProviderInfo(teamProviderInfo, projectPath) {
    if (teamProviderInfo) {
        var jsonString = JSON.stringify(teamProviderInfo, null, 4);
        var teamProviderFilePath = getProviderInfoFilePath(projectPath);
        fs.writeFileSync(teamProviderFilePath, jsonString, 'utf8');
    }
}
function generateBackendConfig(amplifyMeta) {
    var backendConfig = {};
    Object.keys(amplifyMeta).forEach(function (category) {
        if (category !== 'providers') {
            backendConfig[category] = {};
            Object.keys(amplifyMeta[category]).forEach(function (resourceName) {
                backendConfig[category][resourceName] = {};
                backendConfig[category][resourceName].service = amplifyMeta[category][resourceName].service;
                backendConfig[category][resourceName].providerPlugin =
                    amplifyMeta[category][resourceName].providerPlugin;
                backendConfig[category][resourceName].dependsOn =
                    amplifyMeta[category][resourceName].dependsOn;
                backendConfig[category][resourceName].build =
                    amplifyMeta[category][resourceName].build;
                // For AppSync we need to store the securityType output as well
                if (amplifyMeta[category][resourceName].service === 'AppSync') {
                    backendConfig[category][resourceName].output = {};
                    if (amplifyMeta[category][resourceName].output) {
                        backendConfig[category][resourceName].output.securityType =
                            amplifyMeta[category][resourceName].output.securityType;
                    }
                }
            });
        }
    });
    return backendConfig;
}
function persistBackendConfig(backendConfig, projectPath) {
    if (backendConfig) {
        var jsonString = JSON.stringify(backendConfig, null, 4);
        var backendConfigFilePath = getBackendConfigFilePath(projectPath);
        fs.writeFileSync(backendConfigFilePath, jsonString, 'utf8');
    }
}
function removeAmplifyRCFile(projectPath) {
    var amplifyRcFilePath = getAmplifyRcFilePath(projectPath);
    fs.removeSync(amplifyRcFilePath);
}
function updateGitIgnoreFile(projectPath) {
    var gitIgnoreFilePath = getGitIgnoreFilePath(projectPath);
    gitManager.insertAmplifyIgnore(gitIgnoreFilePath);
}
module.exports = {
    migrateProject: migrateProject,
};
//# sourceMappingURL=../../src/lib/lib/migrate-project.js.map