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
Object.defineProperty(exports, "__esModule", { value: true });
var cleanup_task_1 = require("./cleanup-task");
exports.addCleanupTask = cleanup_task_1.addCleanupTask;
var mock_data_directory_1 = require("./mock-data-directory");
exports.getMockDataDirectory = mock_data_directory_1.getMockDataDirectory;
var git_ignore_1 = require("./git-ignore");
exports.addMockDataToGitIgnore = git_ignore_1.addMockDataToGitIgnore;
function getAmplifyMeta(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const amplifyMetaFilePath = context.amplify.pathManager.getAmplifyMetaFilePath();
        return context.amplify.readJsonFile(amplifyMetaFilePath);
    });
}
exports.getAmplifyMeta = getAmplifyMeta;
//# sourceMappingURL=index.js.map