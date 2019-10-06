"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var map_1 = require("../../../velocity/value-mapper/map");
describe('JavaMap', function () {
    var identityMapper = jest.fn().mockImplementation(function (val) { return val; });
    beforeEach(function () {
        identityMapper = jest.fn().mockImplementation(function (val) { return val; });
    });
    it('New Map', function () {
        var obj = { foo: 1, bar: 2 };
        var map = new map_1.JavaMap(obj, identityMapper);
        expect(map.toJSON()).toEqual(obj);
    });
    it('clear', function () {
        var obj = { foo: 1, bar: 2 };
        var map = new map_1.JavaMap(obj, identityMapper);
        map.clear();
        expect(map.toJSON()).toEqual({});
    });
    it('containsKey', function () {
        var obj = { foo: 1, bar: 2 };
        var map = new map_1.JavaMap(obj, identityMapper);
        expect(map.containsKey('foo')).toBeTruthy();
        expect(map.containsKey('bax')).toBeFalsy();
    });
    it('containsValue', function () {
        var obj = { foo: 'Foo Value', bar: 'Bar Value' };
        var map = new map_1.JavaMap(obj, identityMapper);
        expect(map.containsValue('Foo Value')).toBeTruthy();
        expect(map.containsKey('bax value')).toBeFalsy();
    });
    it('entrySet', function () {
        var obj = { foo: 'Foo Value', bar: 'Bar Value' };
        var map = new map_1.JavaMap(obj, identityMapper);
        expect(map.entrySet().toJSON()).toEqual([
            { key: 'foo', value: 'Foo Value' },
            { key: 'bar', value: 'Bar Value' },
        ]);
    });
    it('equal', function () {
        var obj = { foo: 'Foo Value', bar: 'Bar Value' };
        var map = new map_1.JavaMap(obj, identityMapper);
        var map2 = new map_1.JavaMap(obj, identityMapper);
        expect(map.equals(map2)).toBeTruthy();
    });
    it('get', function () {
        var obj = { foo: 'Foo Value', bar: 'Bar Value' };
        var map = new map_1.JavaMap(obj, identityMapper);
        expect(map.get('foo')).toEqual('Foo Value');
        expect(map.get('foo1')).toBeNull();
    });
    it('isEmpty', function () {
        var obj = { foo: 'Foo Value', bar: 'Bar Value' };
        var map = new map_1.JavaMap(obj, identityMapper);
        expect(map.isEmpty()).toBeFalsy();
        expect(new map_1.JavaMap({}, identityMapper).isEmpty()).toBeTruthy();
    });
    it('keySet', function () {
        var obj = { foo: 'Foo Value', bar: 'Bar Value' };
        var map = new map_1.JavaMap(obj, identityMapper);
        expect(map.keySet().toJSON()).toEqual(['foo', 'bar']);
    });
    it('put', function () {
        var map = new map_1.JavaMap({}, identityMapper);
        map.put('foo', 'Foo Value');
        expect(map.toJSON()).toEqual({ foo: 'Foo Value' });
    });
    it('putAll', function () {
        var map = new map_1.JavaMap({}, identityMapper);
        map.putAll({ foo: 'Foo Value', bar: 'Bar Value' });
        expect(map.toJSON()).toEqual({ foo: 'Foo Value', bar: 'Bar Value' });
    });
});
//# sourceMappingURL=map.test.js.map