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
var path = require('path');
var fs = require('fs-extra');
var inquirer = require('inquirer');
var _a = require('../../extensions/amplify-helpers/editor-selection'), normalizeEditor = _a.normalizeEditor, editorSelection = _a.editorSelection;
var makeId = require('../../extensions/amplify-helpers/make-id').makeId;
var PROJECT_CONFIG_VERSION = require('../../extensions/amplify-helpers/constants').PROJECT_CONFIG_VERSION;
var readJsonFile = require('../../extensions/amplify-helpers/read-json-file').readJsonFile;
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var projectPath, projectName, envName, defaultEditor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context.print.warning('Note: It is recommended to run this command from the root of your app directory');
                    projectPath = process.cwd();
                    context.exeInfo.isNewProject = isNewProject(context);
                    return [4 /*yield*/, getProjectName(context)];
                case 1:
                    projectName = _a.sent();
                    return [4 /*yield*/, getEnvName(context)];
                case 2:
                    envName = _a.sent();
                    defaultEditor = getDefaultEditor(context);
                    if (!!defaultEditor) return [3 /*break*/, 4];
                    return [4 /*yield*/, getEditor(context)];
                case 3:
                    defaultEditor = _a.sent();
                    _a.label = 4;
                case 4:
                    context.exeInfo.isNewEnv = isNewEnv(context, envName);
                    if ((context.exeInfo.inputParams && context.exeInfo.inputParams.yes) ||
                        context.parameters.options.forcePush) {
                        context.exeInfo.forcePush = true;
                    }
                    else {
                        context.exeInfo.forcePush = false;
                    }
                    context.exeInfo.projectConfig = {
                        projectName: projectName,
                        version: PROJECT_CONFIG_VERSION,
                    };
                    context.exeInfo.localEnvInfo = {
                        projectPath: projectPath,
                        defaultEditor: defaultEditor,
                        envName: envName,
                    };
                    context.exeInfo.teamProviderInfo = {};
                    context.exeInfo.metaData = {};
                    return [2 /*return*/, context];
            }
        });
    });
}
/* Begin getProjectName */
function getProjectName(context) {
    return __awaiter(this, void 0, void 0, function () {
        var projectName, projectPath, projectConfigFilePath, projectNameQuestion, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectPath = process.cwd();
                    if (!context.exeInfo.isNewProject) {
                        projectConfigFilePath = context.amplify.pathManager.getProjectConfigFilePath(projectPath);
                        (projectName = readJsonFile(projectConfigFilePath).projectName);
                        return [2 /*return*/, projectName];
                    }
                    if (!(context.exeInfo.inputParams.amplify && context.exeInfo.inputParams.amplify.projectName)) return [3 /*break*/, 1];
                    projectName = normalizeProjectName(context.exeInfo.inputParams.amplify.projectName);
                    return [3 /*break*/, 3];
                case 1:
                    projectName = normalizeProjectName(path.basename(projectPath));
                    if (!!context.exeInfo.inputParams.yes) return [3 /*break*/, 3];
                    projectNameQuestion = {
                        type: 'input',
                        name: 'inputProjectName',
                        message: 'Enter a name for the project',
                        default: projectName,
                        validate: function (input) { return isProjectNameValid(input) ||
                            'Project name should be between 3 and 20 characters and alphanumeric'; },
                    };
                    return [4 /*yield*/, inquirer.prompt(projectNameQuestion)];
                case 2:
                    answer = _a.sent();
                    projectName = answer.inputProjectName;
                    _a.label = 3;
                case 3: return [2 /*return*/, projectName];
            }
        });
    });
}
function isProjectNameValid(projectName) {
    return projectName &&
        projectName.length >= 3 &&
        projectName.length <= 20 &&
        /[a-zA-Z0-9]/g.test(projectName);
}
function normalizeProjectName(projectName) {
    if (!projectName) {
        projectName = "amplify" + makeId(5);
    }
    if (!isProjectNameValid(projectName)) {
        projectName = projectName.replace(/[^a-zA-Z0-9]/g, '');
        if (projectName.length < 3) {
            projectName += makeId(5);
        }
        else if (projectName.length > 20) {
            projectName = projectName.substring(0, 20);
        }
    }
    return projectName;
}
/* End getProjectName */
/* Begin getEditor */
function getEditor(context) {
    return __awaiter(this, void 0, void 0, function () {
        var editor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(context.exeInfo.inputParams.amplify && context.exeInfo.inputParams.amplify.defaultEditor)) return [3 /*break*/, 1];
                    editor = normalizeEditor(context.exeInfo.inputParams.amplify.defaultEditor);
                    return [3 /*break*/, 3];
                case 1:
                    if (!!context.exeInfo.inputParams.yes) return [3 /*break*/, 3];
                    return [4 /*yield*/, editorSelection(editor)];
                case 2:
                    editor = _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, editor];
            }
        });
    });
}
/* End getEditor */
function getEnvName(context) {
    return __awaiter(this, void 0, void 0, function () {
        var envName, isEnvNameValid, newEnvQuestion, allEnvs, envQuestion;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isEnvNameValid = function (inputEnvName) {
                        var valid = true;
                        if (inputEnvName.length > 10 || inputEnvName.length < 2 || /[^a-z]/g.test(inputEnvName)) {
                            valid = false;
                        }
                        return valid;
                    };
                    if (context.exeInfo.inputParams.amplify && context.exeInfo.inputParams.amplify.envName) {
                        if (isEnvNameValid(context.exeInfo.inputParams.amplify.envName)) {
                            (envName = context.exeInfo.inputParams.amplify.envName);
                            return [2 /*return*/, envName];
                        }
                        context.print.error('Environment name should be between 2 and 10 characters (only lowercase alphabets).');
                        process.exit(1);
                    }
                    else if (context.exeInfo.inputParams && context.exeInfo.inputParams.yes) {
                        context.print.error('Environment name missing');
                        process.exit(1);
                    }
                    newEnvQuestion = function () { return __awaiter(_this, void 0, void 0, function () {
                        var envNameQuestion;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    envNameQuestion = {
                                        type: 'input',
                                        name: 'envName',
                                        message: 'Enter a name for the environment',
                                        validate: function (input) {
                                            return (!isEnvNameValid(input)
                                                ? 'Environment name should be between 2 and 10 characters (only lowercase alphabets).'
                                                : true);
                                        },
                                    };
                                    return [4 /*yield*/, inquirer.prompt(envNameQuestion)];
                                case 1:
                                    (envName = (_a.sent()).envName);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    if (!isNewProject(context)) return [3 /*break*/, 2];
                    return [4 /*yield*/, newEnvQuestion()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 2:
                    allEnvs = context.amplify.getAllEnvs();
                    if (!(allEnvs.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, context.amplify.confirmPrompt.run('Do you want to use an existing environment?')];
                case 3:
                    if (!_a.sent()) return [3 /*break*/, 5];
                    envQuestion = {
                        type: 'list',
                        name: 'envName',
                        message: 'Choose the environment you would like to use:',
                        choices: allEnvs,
                    };
                    return [4 /*yield*/, inquirer.prompt(envQuestion)];
                case 4:
                    (envName = (_a.sent()).envName);
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, newEnvQuestion()];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, newEnvQuestion()];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [2 /*return*/, envName];
            }
        });
    });
}
function isNewEnv(context, envName) {
    var newEnv = true;
    var projectPath = process.cwd();
    var providerInfoFilePath = context.amplify.pathManager.getProviderInfoFilePath(projectPath);
    if (fs.existsSync(providerInfoFilePath)) {
        var envProviderInfo = readJsonFile(providerInfoFilePath);
        if (envProviderInfo[envName]) {
            newEnv = false;
        }
    }
    return newEnv;
}
function isNewProject(context) {
    var newProject = true;
    var projectPath = process.cwd();
    var projectConfigFilePath = context.amplify.pathManager.getProjectConfigFilePath(projectPath);
    if (fs.existsSync(projectConfigFilePath)) {
        newProject = false;
    }
    return newProject;
}
function getDefaultEditor(context) {
    var defaultEditor;
    var projectPath = process.cwd();
    var localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath(projectPath);
    if (fs.existsSync(localEnvFilePath)) {
        (defaultEditor = readJsonFile(localEnvFilePath).defaultEditor);
    }
    return defaultEditor;
}
module.exports = {
    run: run,
};
//# sourceMappingURL=../../../src/lib/lib/init-steps/s0-analyzeProject.js.map