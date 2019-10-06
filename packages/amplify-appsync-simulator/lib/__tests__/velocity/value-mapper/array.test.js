"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var array_1 = require("../../../velocity/value-mapper/array");
var identityMapper = jest.fn(function (v) { return v; });
describe(' Velocity ValueMapper JavaArray', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('Should initialize from JS Array', function () {
        var JS_ARRAY = [1, 2, 3];
        var arr = new array_1.JavaArray(JS_ARRAY, identityMapper);
        expect(arr.toJSON()).toEqual(JS_ARRAY);
    });
    it('size', function () {
        var JS_ARRAY = [1, 2, 3];
        var arr = new array_1.JavaArray(JS_ARRAY, identityMapper);
        expect(arr.size()).toEqual(JS_ARRAY.length);
    });
    it('isEmpty', function () {
        expect(new array_1.JavaArray([1, 2, 3], identityMapper).isEmpty()).toBeFalsy();
        expect(new array_1.JavaArray([], identityMapper).isEmpty()).toBeTruthy();
    });
    it('add', function () {
        var arr = new array_1.JavaArray([], identityMapper);
        arr.add(1);
        expect(arr.size()).toEqual(1);
        expect(arr.toJSON()).toEqual([1]);
    });
    it('addAll', function () {
        var NEW_ARR = [1, 2, 3];
        var arr = new array_1.JavaArray([], identityMapper);
        arr.addAll(NEW_ARR);
        expect(identityMapper).toBeCalledTimes(NEW_ARR.length);
        expect(arr.size()).toEqual(NEW_ARR.length);
        expect(arr.toJSON()).toEqual(NEW_ARR);
    });
    it('clear', function () {
        var NEW_ARR = [1, 2, 3];
        var arr = new array_1.JavaArray(NEW_ARR, identityMapper);
        expect(arr.size()).toEqual(NEW_ARR.length);
        arr.clear();
        expect(arr.toJSON()).toEqual([]);
    });
    it('contains', function () {
        var NEW_ARR = [1, 2, 3];
        var arr = new array_1.JavaArray(NEW_ARR, identityMapper);
        expect(arr.contains(1)).toBeTruthy();
        expect(arr.contains('Z')).toBeFalsy();
    });
    it('containsAll', function () {
        var NEW_ARR = [1, 2, 3];
        var arr = new array_1.JavaArray(NEW_ARR, identityMapper);
        expect(arr.containsAll(NEW_ARR)).toBeTruthy();
        expect(arr.containsAll([2])).toBeTruthy();
        expect(arr.containsAll(__spreadArrays(NEW_ARR, ['Z']))).toBeFalsy();
    });
    it('remove', function () {
        var NEW_ARR = [1, 2, 3];
        var arr = new array_1.JavaArray(NEW_ARR, identityMapper);
        arr.remove(3);
        expect(arr.toJSON()).toEqual([1, 2]);
    });
    it('removeAll', function () {
        var NEW_ARR = [1, 2, 3];
        var arr = new array_1.JavaArray(NEW_ARR, identityMapper);
        arr.removeAll([3, 2]);
        expect(arr.toJSON()).toEqual([1]);
    });
    // it('retainAll', () => {
    //   const NEW_ARR = [1, 2, 3, 4];
    //   const arr = new JavaArray(NEW_ARR, identityMapper);
    //   arr.retainAll([3, 2, 20]);
    //   expect(arr.toJSON()).toEqual([2, 3]);
    // })
});
//# sourceMappingURL=array.test.js.map