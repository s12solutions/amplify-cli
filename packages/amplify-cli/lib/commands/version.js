"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readJsonFile_1 = require("../utils/readJsonFile");
var path_1 = __importDefault(require("path"));
function run(context) {
    var packageJsonFilePath = path_1.default.join(__dirname, '../../package.json');
    context.print.info(readJsonFile_1.readJsonFileSync(packageJsonFilePath).version);
}
exports.run = run;
//# sourceMappingURL=../../src/lib/commands/version.js.map