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
var getEnvInfo = require('../../extensions/amplify-helpers/get-env-info').getEnvInfo;
var readJsonFile = require('../../extensions/amplify-helpers/read-json-file').readJsonFile;
function run(context) {
    return __awaiter(this, void 0, void 0, function () {
        var projectConfigFilePath, projectPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectConfigFilePath = context.amplify.pathManager.getProjectConfigFilePath();
                    if (fs.existsSync(projectConfigFilePath)) {
                        context.exeInfo.projectConfig = readJsonFile(projectConfigFilePath);
                    }
                    context.exeInfo.localEnvInfo = getEnvInfo();
                    projectPath = process.cwd();
                    Object.assign(context.exeInfo.localEnvInfo, { projectPath: projectPath });
                    return [4 /*yield*/, configureProjectName(context)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, configureEditor(context)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, context];
            }
        });
    });
}
/* Begin confighureProjectName */
function configureProjectName(context) {
    return __awaiter(this, void 0, void 0, function () {
        var projectName, projectPath, projectNameQuestion, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectName = context.exeInfo.projectConfig.projectName;
                    if (!(context.exeInfo.inputParams.amplify && context.exeInfo.inputParams.amplify.projectName)) return [3 /*break*/, 1];
                    projectName = normalizeProjectName(context.exeInfo.inputParams.amplify.projectName);
                    return [3 /*break*/, 3];
                case 1:
                    if (!projectName) {
                        projectPath = process.cwd();
                        projectName = normalizeProjectName(path.basename(projectPath));
                    }
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
                case 3:
                    Object.assign(context.exeInfo.projectConfig, { projectName: projectName });
                    return [2 /*return*/];
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
            projectName += +makeId(5);
        }
        else if (projectName.length > 20) {
            projectName = projectName.substring(0, 20);
        }
    }
    return projectName;
}
/* End confighureProjectName */
/* Begin configureEditor */
function configureEditor(context) {
    return __awaiter(this, void 0, void 0, function () {
        var defaultEditor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultEditor = context.exeInfo.localEnvInfo.defaultEditor;
                    if (!(context.exeInfo.inputParams.amplify && context.exeInfo.inputParams.amplify.defaultEditor)) return [3 /*break*/, 1];
                    defaultEditor = normalizeEditor(context.exeInfo.inputParams.amplify.editor);
                    return [3 /*break*/, 3];
                case 1:
                    if (!!context.exeInfo.inputParams.yes) return [3 /*break*/, 3];
                    return [4 /*yield*/, editorSelection(defaultEditor)];
                case 2:
                    defaultEditor = _a.sent();
                    _a.label = 3;
                case 3:
                    Object.assign(context.exeInfo.localEnvInfo, { defaultEditor: defaultEditor });
                    return [2 /*return*/];
            }
        });
    });
}
/* End configureEditor */
module.exports = {
    run: run,
};
//# sourceMappingURL=../../../src/lib/lib/config-steps/c0-analyzeProject.js.map