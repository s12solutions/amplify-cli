"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const intrinsic_functions_1 = require("../../CFNParser/intrinsic-functions");
describe('intrinsic-functions', () => {
    describe('cfnJoin', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: {}
        };
        it('should join values', () => {
            const node = ['-', ['foo', 'bar', 'baz']];
            const parseValue = jest.fn(ip => ip);
            expect(intrinsic_functions_1.cfnJoin(node, cfnContext, parseValue)).toEqual('foo-bar-baz');
            expect(parseValue).toHaveBeenCalledTimes(3);
            node[1].forEach((val, index) => {
                expect(parseValue.mock.calls[index][0]).toEqual(val);
            });
        });
        it('should throw error if listOfValues are not present', () => {
            const node = ['-'];
            expect(() => {
                intrinsic_functions_1.cfnJoin(node, cfnContext, jest.fn());
            }).toThrow();
        });
        it('should throw error if if there are 3 arguments to Fn::Join are not present', () => {
            const node = ['-', [], []];
            expect(() => {
                intrinsic_functions_1.cfnJoin(node, cfnContext, jest.fn());
            }).toThrow();
        });
    });
    describe('cfnSub', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: {}
        };
        it('should substitute variable', () => {
            const parseValue = jest.fn(val => val);
            const expr = ['My name is ${name}. I am ${age} years old', { name: 'John', age: '25' }];
            expect(intrinsic_functions_1.cfnSub(expr, cfnContext, parseValue)).toEqual('My name is John. I am 25 years old');
            expect(parseValue).toHaveBeenCalledTimes(2);
        });
        it('should throw error if there are no substitute variable', () => {
            const expr = ['My name is ${name}. I am ${age} years old'];
            expect(() => intrinsic_functions_1.cfnSub(expr, cfnContext, val => val)).toThrow();
        });
        it('should throw error if there are no substitute variable', () => {
            const expr = ['My name is ${name}. I am ${age} years old'];
            expect(() => intrinsic_functions_1.cfnSub(expr, cfnContext, val => val)).toThrow();
        });
    });
    describe('cfnGetAtt', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {
                FooResource: {
                    prop1: 'prop1 value'
                }
            },
            exports: {}
        };
        it('should get attribute value from parsed resources', () => {
            const node = ['FooResource', 'prop1'];
            expect(intrinsic_functions_1.cfnGetAtt(node, cfnContext, () => { })).toEqual('prop1 value');
        });
        it('should throw error if resource is missing in the context', () => {
            const node = ['MissingResource', 'prop1'];
            expect(() => intrinsic_functions_1.cfnGetAtt(node, cfnContext, () => { })).toThrow();
        });
        it('should throw if the property is missing in the resource', () => {
            const node = ['FooResource', 'missing-prop'];
            expect(() => intrinsic_functions_1.cfnGetAtt(node, cfnContext, () => { })).toThrow();
        });
    });
    describe('cfnSplit', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: {}
        };
        it('should split string', () => {
            const node = ['-', 'foo-bar-baz'];
            const processValue = jest.fn(val => val);
            expect(intrinsic_functions_1.cfnSplit(node, cfnContext, processValue)).toEqual(['foo', 'bar', 'baz']);
            expect(processValue).toHaveBeenCalledWith(node[1], cfnContext);
        });
        it('should throw error when split string is missing', () => {
            const node = ['-'];
            const processValue = jest.fn(val => val);
            expect(() => intrinsic_functions_1.cfnSplit(node, cfnContext, processValue)).toThrow();
        });
    });
    describe('cfnRef', () => {
        const cfnContext = {
            params: { fromParam: 'foo' },
            conditions: {},
            resources: {
                fromResource: { name: 'resource' },
                fromResource2: 'bar'
            },
            exports: {}
        };
        it('should get ref from params', () => {
            const node = 'fromParam';
            expect(intrinsic_functions_1.cfnRef(node, cfnContext, () => { })).toEqual('foo');
        });
        it('should get ref from resources', () => {
            const node = 'fromResource';
            expect(intrinsic_functions_1.cfnRef(node, cfnContext, () => { })).toEqual('resource');
        });
        it('should call parseValue if the ref is not a string', () => {
            const node = [{ 'Fn::Join': ['-', ['foo', 'bar']] }];
            const parseValue = jest.fn(val => 'fromParam');
            expect(intrinsic_functions_1.cfnRef(node, cfnContext, parseValue)).toEqual('foo');
        });
        it('should throw error if the node has length more than 1 item', () => {
            const node = ['foo', 'bar'];
            expect(() => intrinsic_functions_1.cfnRef(node, cfnContext, () => { })).toThrow();
        });
        it('should throw error resource does not have name prop', () => {
            const node = 'fromResource2';
            expect(() => intrinsic_functions_1.cfnRef(node, cfnContext, () => { })).toThrow();
        });
    });
    describe('cfnSelect', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: {}
        };
        afterEach(() => {
            jest.resetAllMocks();
        });
        const parseValue = jest.fn(val => val);
        it('should select the value', () => {
            const node = ['2', ['foo', 'bar', 'baz']];
            expect(intrinsic_functions_1.cfnSelect(node, cfnContext, parseValue)).toEqual('baz');
            expect(parseValue).toHaveBeenCalledTimes(3);
            node[1].forEach((item, idx) => {
                expect(parseValue.mock.calls[idx][0]).toEqual(item);
            });
        });
    });
    describe('cfnIf', () => {
        const cfnContext = {
            params: {},
            conditions: {
                foo: true,
                bar: false,
            },
            resources: {},
            exports: {}
        };
        let parseValue;
        beforeEach(() => {
            parseValue = jest.fn((val) => val);
        });
        it('should return true value section when condition is true', () => {
            const node = ['foo', 'foo value', 'bar value'];
            expect(intrinsic_functions_1.cfnIf(node, cfnContext, parseValue)).toEqual('foo value');
        });
        it('should return false value section when condition is true', () => {
            const node = ['bar', 'foo value', 'bar value'];
            expect(intrinsic_functions_1.cfnIf(node, cfnContext, parseValue)).toEqual('bar value');
        });
    });
    describe('cfnEquals', () => {
        const cfnContext = {
            params: {},
            conditions: {
                foo: true,
                bar: false,
            },
            resources: {},
            exports: {}
        };
        const parseValue = jest.fn((val) => val);
        it('should return true when equal', () => {
            const node = ['foo', 'foo',];
            expect(intrinsic_functions_1.cfnEquals(node, cfnContext, parseValue)).toBeTruthy();
            expect(parseValue).toHaveBeenCalled();
        });
        it('should return false when not equal', () => {
            const node = ['foo', 'bar',];
            expect(intrinsic_functions_1.cfnEquals(node, cfnContext, (val) => val)).toBeFalsy();
        });
    });
    describe('cfnNot', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: {}
        };
        const parseValue = jest.fn((val) => val);
        it('should return false when Fn::Not(trueCondition)', () => {
            parseValue.mockReturnValueOnce(true);
            const node = ['trueCondition'];
            expect(intrinsic_functions_1.cfnNot(node, cfnContext, parseValue)).toBeFalsy();
            expect(parseValue).toHaveBeenCalled();
        });
        it('should return true when {Fn::Not, falseCondition}', () => {
            parseValue.mockReturnValueOnce(false);
            const node = ['falseCondition'];
            expect(intrinsic_functions_1.cfnNot(node, cfnContext, parseValue)).toBeTruthy();
            expect(parseValue).toHaveBeenCalled();
        });
    });
    describe('cfnAnd', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: {}
        };
        let parseValue;
        beforeEach(() => {
            parseValue = jest.fn();
        });
        it('should return false when Fn::And encounter a false value', () => {
            parseValue.mockReturnValueOnce(true);
            parseValue.mockReturnValueOnce(true);
            parseValue.mockReturnValueOnce(false);
            parseValue.mockReturnValueOnce(true);
            const node = ['cond1', 'cond2', 'cond3', 'cond4'];
            expect(intrinsic_functions_1.cfnAnd(node, cfnContext, parseValue)).toBeFalsy();
            expect(parseValue).toHaveBeenCalled();
        });
        it('should return false when Fn::And encounter all true values', () => {
            parseValue.mockReturnValue(true);
            const node = ['cond1', 'cond2', 'cond3', 'cond4'];
            expect(intrinsic_functions_1.cfnAnd(node, cfnContext, parseValue)).toBeTruthy();
            expect(parseValue).toHaveBeenCalledTimes(4);
        });
    });
    describe('cfnOr', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: {}
        };
        let parseValue;
        beforeEach(() => {
            parseValue = jest.fn();
        });
        it('should return true when Fn::Or encounter at least one true value', () => {
            parseValue.mockReturnValueOnce(true);
            parseValue.mockReturnValueOnce(true);
            parseValue.mockReturnValueOnce(false);
            parseValue.mockReturnValueOnce(true);
            const node = ['cond1', 'cond2', 'cond3', 'cond4'];
            expect(intrinsic_functions_1.cfnOr(node, cfnContext, parseValue)).toBeTruthy();
            expect(parseValue).toHaveBeenCalled();
        });
        it('should return false when Fn::Or encounter all false values', () => {
            parseValue.mockReturnValue(false);
            const node = ['cond1', 'cond2', 'cond3', 'cond4'];
            expect(intrinsic_functions_1.cfnAnd(node, cfnContext, parseValue)).toBeFalsy();
            expect(parseValue).toHaveBeenCalledTimes(4);
        });
    });
    describe('cfnImportValue', () => {
        const cfnContext = {
            params: {},
            conditions: {},
            resources: {},
            exports: { 'foo': 'fooValue' }
        };
        let parseValue;
        beforeEach(() => {
            parseValue = jest.fn((val) => val);
        });
        it('should return value for key from exports', () => {
            const node = 'foo';
            expect(intrinsic_functions_1.cfnImportValue(node, cfnContext, parseValue)).toEqual('fooValue');
            expect(parseValue).toHaveBeenCalled();
        });
        it('should throw error if the value is not presnt in exports', () => {
            const node = 'bar';
            expect(() => intrinsic_functions_1.cfnImportValue(node, cfnContext, parseValue)).toThrow();
        });
    });
    describe('cfnCondition', () => {
        const cfnContext = {
            params: {},
            conditions: {
                foo: true,
                bar: false,
            },
            resources: {},
            exports: {}
        };
        it('should return condition value', () => {
            expect(intrinsic_functions_1.cfnCondition('bar', cfnContext, () => { })).toBeFalsy();
            expect(intrinsic_functions_1.cfnCondition('foo', cfnContext, () => { })).toBeTruthy();
        });
        it('should throw if the condition is missing', () => {
            expect(() => intrinsic_functions_1.cfnCondition('missing-condition', cfnContext, () => { })).toThrow();
        });
    });
});
//# sourceMappingURL=intrinsic-functions.test.js.map