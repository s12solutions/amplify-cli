"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var string_1 = require("../../../velocity/value-mapper/string");
describe('JavaString', function () {
    it('replaceAll', function () {
        var str = new string_1.JavaString('foo bar foo bar foo bar Foo');
        var replacedStr = str.replaceAll('foo', 'baz');
        expect(replacedStr.toString()).toEqual('baz bar baz bar baz bar Foo');
        expect(replacedStr.toIdString()).toEqual('baz bar baz bar baz bar Foo');
        expect(replacedStr.toJSON()).toEqual('baz bar baz bar baz bar Foo');
    });
});
//# sourceMappingURL=string.test.js.map