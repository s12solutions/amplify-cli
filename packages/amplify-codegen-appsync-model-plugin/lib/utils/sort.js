"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sortFields(a, b) {
    if (a.name > b.name)
        return 1;
    if (a.name == b.name)
        return 0;
    return -1;
}
exports.sortFields = sortFields;
//# sourceMappingURL=sort.js.map