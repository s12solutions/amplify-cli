"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
function isChildPath(child, parent) {
    if (child === parent) {
        return false;
    }
    var parentTokens = parent.split(path_1.default.sep).filter(function (i) { return i.length; });
    var childTokens = child.split(path_1.default.sep).filter(function (i) { return i.length; });
    return parentTokens.every(function (element, index) { return childTokens[index] === element; });
}
exports.default = isChildPath;
//# sourceMappingURL=../../src/lib/utils/is-child-path.js.map