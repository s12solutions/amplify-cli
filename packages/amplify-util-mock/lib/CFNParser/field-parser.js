"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const intrinsicFunctionMap = {};
function addIntrinsicFunction(keyword, func) {
    intrinsicFunctionMap[keyword] = func;
}
exports.addIntrinsicFunction = addIntrinsicFunction;
function parseValue(node, context) {
    if (typeof node === 'string')
        return node;
    if (lodash_1.isPlainObject(node) &&
        Object.keys(node).length === 1 &&
        Object.keys(intrinsicFunctionMap).includes(Object.keys(node)[0])) {
        const op = Object.keys(node)[0];
        const valNode = node[op];
        return intrinsicFunctionMap[op](valNode, context, parseValue);
    }
    throw new Error(`Could not process value node ${JSON.stringify(node)}`);
}
exports.parseValue = parseValue;
//# sourceMappingURL=field-parser.js.map