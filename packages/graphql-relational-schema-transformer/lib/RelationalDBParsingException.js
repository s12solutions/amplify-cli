"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RelationalDBParsingException extends Error {
    constructor(message, stack) {
        super(message);
        Object.setPrototypeOf(this, RelationalDBParsingException.prototype);
        this.stack = stack;
    }
}
exports.RelationalDBParsingException = RelationalDBParsingException;
//# sourceMappingURL=RelationalDBParsingException.js.map