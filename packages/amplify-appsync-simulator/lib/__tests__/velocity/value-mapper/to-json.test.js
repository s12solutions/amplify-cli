"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var to_json_1 = require("../../../velocity/value-mapper/to-json");
describe('Velocity - ValueMapper toJSON', function () {
    it('should call toJSON if the value object has method toJSON', function () {
        var JSON_VALUE = 'MOCK_JSON_VALUE';
        var testObj = {
            toJSON: jest.fn().mockReturnValue(JSON_VALUE),
        };
        expect(to_json_1.toJSON(testObj)).toEqual(JSON_VALUE);
        expect(testObj.toJSON).toHaveBeenCalled();
    });
    it('should not call toJSON if the object is null', function () {
        expect(to_json_1.toJSON(null)).toEqual(null);
    });
    it('should return the source object if it doesnot implement toJSON', function () {
        var testObj = {
            foo: 'Foo',
        };
        expect(to_json_1.toJSON(testObj)).toEqual(testObj);
    });
});
//# sourceMappingURL=to-json.test.js.map