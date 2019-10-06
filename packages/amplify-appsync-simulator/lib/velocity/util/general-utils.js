"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
var autoId = require("uuid/v4");
var string_1 = require("../value-mapper/string");
var array_1 = require("../value-mapper/array");
var map_1 = require("../value-mapper/map");
exports.generalUtils = {
    errors: [],
    quiet: function () { return ''; },
    qr: function () { return ''; },
    escapeJavaScript: function (value) {
        return require('js-string-escape')(value);
    },
    urlEncode: function (value) {
        return encodeURI(value);
    },
    urlDecode: function (value) {
        return decodeURI(value);
    },
    base64Encode: function (value) {
        // eslint-disable-next-line
        return new Buffer(value).toString('base64');
    },
    base64Decode: function (value) {
        // eslint-disable-next-line
        return new Buffer(value, 'base64').toString('ascii');
    },
    parseJson: function (value) {
        return JSON.parse(value);
    },
    toJson: function (value) {
        return JSON.stringify(value);
    },
    autoId: function () {
        return autoId();
    },
    unauthorized: function () {
        var err = new errors_1.Unauthorized('Unauthorized', this.info);
        this.errors.push(err);
        throw err;
    },
    error: function (message, type, data, errorInfo) {
        if (type === void 0) { type = null; }
        if (data === void 0) { data = null; }
        if (errorInfo === void 0) { errorInfo = null; }
        var err = new errors_1.TemplateSentError(message, type, data, errorInfo, this.info);
        this.errors.push(err);
        throw err;
    },
    appendError: function (message, type, data, errorInfo) {
        if (type === void 0) { type = null; }
        if (data === void 0) { data = null; }
        if (errorInfo === void 0) { errorInfo = null; }
        this.errors.push(new errors_1.TemplateSentError(message, type, data, errorInfo, this.info));
        return '';
    },
    getErrors: function () {
        return this.errors;
    },
    validate: function (allGood, message, type, data) {
        if (allGood)
            return '';
        throw new errors_1.ValidateError(message, type, data);
    },
    isNull: function (value) {
        return value === null || typeof value == 'undefined';
    },
    isNullOrEmpty: function (value) {
        if (this.isNull(value))
            return true;
        if (value instanceof map_1.JavaMap) {
            return Object.keys(value.toJSON()).length == 0;
        }
        if (value instanceof array_1.JavaArray || value instanceof string_1.JavaString) {
            return value.toJSON().length == 0;
        }
        return !!value;
    },
    isNullOrBlank: function (value) {
        return this.isNullOrEmpty(value);
    },
    defaultIfNull: function (value, defaultValue) {
        if (defaultValue === void 0) { defaultValue = ''; }
        if (value !== null && value !== undefined)
            return value;
        return defaultValue;
    },
    defaultIfNullOrEmpty: function (value, defaultValue) {
        if (value)
            return value;
        return defaultValue;
    },
    defaultIfNullOrBlank: function (value, defaultValue) {
        if (value)
            return value;
        return defaultValue;
    },
    isString: function (value) {
        return value instanceof string_1.JavaString;
    },
    isNumber: function (value) {
        return typeof value === 'number';
    },
    isBoolean: function (value) {
        return typeof value === 'boolean';
    },
    isList: function (value) {
        return Array.isArray(value) || value instanceof array_1.JavaArray;
    },
    isMap: function (value) {
        if (value instanceof Map)
            return value;
        return value != null && typeof value === 'object';
    },
    typeOf: function (value) {
        if (value === null)
            return 'Null';
        if (this.isList(value))
            return 'List';
        if (this.isMap(value))
            return 'Map';
        switch (typeof value) {
            case 'number':
                return 'Number';
            case 'string':
                return 'String';
            case 'boolean':
                return 'Boolean';
            default:
                return 'Object';
        }
    },
    matches: function (pattern, value) {
        return new RegExp(pattern).test(value);
    },
};
//# sourceMappingURL=general-utils.js.map