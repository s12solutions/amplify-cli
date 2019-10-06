"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JavaString = /** @class */ (function () {
    function JavaString(str) {
        this.value = str;
    }
    JavaString.prototype.replaceAll = function (find, replace) {
        var rep = this.value.replace(new RegExp(find, 'g'), replace);
        return new JavaString(rep);
    };
    JavaString.prototype.toJSON = function () {
        return this.toString();
    };
    JavaString.prototype.toString = function () {
        return this.value;
    };
    JavaString.prototype.toIdString = function () {
        return this.value;
    };
    return JavaString;
}());
exports.JavaString = JavaString;
//# sourceMappingURL=string.js.map