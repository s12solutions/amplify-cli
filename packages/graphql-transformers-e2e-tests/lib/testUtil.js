"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_common_1 = require("graphql-transformer-common");
function expectFields(type, fields) {
    var _loop_1 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
    };
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var fieldName = fields_1[_i];
        _loop_1(fieldName);
    }
}
exports.expectFields = expectFields;
function expectNonNullFields(type, fields) {
    var _loop_2 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
        expect(graphql_transformer_common_1.isNonNullType(foundField.type)).toBeTruthy();
    };
    for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
        var fieldName = fields_2[_i];
        _loop_2(fieldName);
    }
}
exports.expectNonNullFields = expectNonNullFields;
function expectNullableFields(type, fields) {
    var _loop_3 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
        expect(graphql_transformer_common_1.isNonNullType(foundField.type)).toBeFalsy();
    };
    for (var _i = 0, fields_3 = fields; _i < fields_3.length; _i++) {
        var fieldName = fields_3[_i];
        _loop_3(fieldName);
    }
}
exports.expectNullableFields = expectNullableFields;
function expectArguments(field, args) {
    var _loop_4 = function (argName) {
        var foundArg = field.arguments.find(function (a) { return a.name.value === argName; });
        expect(foundArg).toBeDefined();
    };
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var argName = args_1[_i];
        _loop_4(argName);
    }
}
exports.expectArguments = expectArguments;
function doNotExpectFields(type, fields) {
    var _loop_5 = function (fieldName) {
        expect(type.fields.find(function (f) { return f.name.value === fieldName; })).toBeUndefined();
    };
    for (var _i = 0, fields_4 = fields; _i < fields_4.length; _i++) {
        var fieldName = fields_4[_i];
        _loop_5(fieldName);
    }
}
exports.doNotExpectFields = doNotExpectFields;
function getObjectType(doc, type) {
    return doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && def.name.value === type; });
}
exports.getObjectType = getObjectType;
function getInputType(doc, type) {
    return doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === type; });
}
exports.getInputType = getInputType;
function expectInputValues(type, fields) {
    var _loop_6 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
    };
    for (var _i = 0, fields_5 = fields; _i < fields_5.length; _i++) {
        var fieldName = fields_5[_i];
        _loop_6(fieldName);
    }
}
exports.expectInputValues = expectInputValues;
function expectInputValueToHandle(type, f) {
    for (var _i = 0, _a = type.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        expect(f(field)).toBeTruthy();
    }
}
exports.expectInputValueToHandle = expectInputValueToHandle;
function expectNonNullInputValues(type, fields) {
    var _loop_7 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
        expect(graphql_transformer_common_1.isNonNullType(foundField.type)).toBeTruthy();
    };
    for (var _i = 0, fields_6 = fields; _i < fields_6.length; _i++) {
        var fieldName = fields_6[_i];
        _loop_7(fieldName);
    }
}
exports.expectNonNullInputValues = expectNonNullInputValues;
function expectNullableInputValues(type, fields) {
    var _loop_8 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
        expect(graphql_transformer_common_1.isNonNullType(foundField.type)).toBeFalsy();
    };
    for (var _i = 0, fields_7 = fields; _i < fields_7.length; _i++) {
        var fieldName = fields_7[_i];
        _loop_8(fieldName);
    }
}
exports.expectNullableInputValues = expectNullableInputValues;
function expectExactKeys(obj, expectedSet) {
    var resourceSet = new Set(Object.keys(obj));
    expectedSet.forEach(function (item) {
        expect(resourceSet.has(item)).toBeTruthy();
    });
    expect(resourceSet.size).toEqual(expectedSet.size);
}
exports.expectExactKeys = expectExactKeys;
//# sourceMappingURL=testUtil.js.map