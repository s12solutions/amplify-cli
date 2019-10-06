"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var GraphQLTransform_1 = require("../GraphQLTransform");
var Transformer_1 = require("../Transformer");
var util_1 = require("../util");
var ValidObjectTransformer = /** @class */ (function (_super) {
    __extends(ValidObjectTransformer, _super);
    function ValidObjectTransformer() {
        var _this = _super.call(this, 'ValidObjectTransformer', util_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["directive @ObjectDirective on OBJECT"], ["directive @ObjectDirective on OBJECT"])))) || this;
        _this.object = function (definition, directive, acc) {
            return;
        };
        return _this;
    }
    return ValidObjectTransformer;
}(Transformer_1.default));
var InvalidObjectTransformer = /** @class */ (function (_super) {
    __extends(InvalidObjectTransformer, _super);
    function InvalidObjectTransformer() {
        return _super.call(this, 'InvalidObjectTransformer', util_1.gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["directive @ObjectDirective on OBJECT"], ["directive @ObjectDirective on OBJECT"])))) || this;
    }
    return InvalidObjectTransformer;
}(Transformer_1.default));
test('Test graphql transformer validation happy case', function () {
    var validSchema = "type Post @ObjectDirective { id: ID! }";
    var transformer = new GraphQLTransform_1.default({
        transformers: [
            new ValidObjectTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
});
test('Test graphql transformer validation. Transformer does not implement required method.', function () {
    var validSchema = "type Post @ObjectDirective { id: ID! }";
    var transformer = new GraphQLTransform_1.default({
        transformers: [
            new InvalidObjectTransformer()
        ]
    });
    try {
        transformer.transform(validSchema);
    }
    catch (e) {
        expect(e.name).toEqual('InvalidTransformerError');
    }
});
test('Test graphql transformer validation. Unknown directive.', function () {
    var invalidSchema = "type Post @UnknownDirective { id: ID! }";
    var transformer = new GraphQLTransform_1.default({
        transformers: [
            new InvalidObjectTransformer()
        ]
    });
    try {
        transformer.transform(invalidSchema);
    }
    catch (e) {
        expect(e.name).toEqual('SchemaValidationError');
    }
});
var PingTransformer = /** @class */ (function (_super) {
    __extends(PingTransformer, _super);
    function PingTransformer() {
        var _this = _super.call(this, 'ValidObjectTransformer', util_1.gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n            directive @ping(config: PingConfig) on OBJECT\n            input PingConfig {\n                url: String!\n            }\n            "], ["\n            directive @ping(config: PingConfig) on OBJECT\n            input PingConfig {\n                url: String!\n            }\n            "])))) || this;
        _this.object = function (definition, directive, acc) {
            return;
        };
        return _this;
    }
    return PingTransformer;
}(Transformer_1.default));
test('Test graphql transformer validation on bad shapes. @ping directive.', function () {
    var invalidSchema = "type Post @ping(config: { bad: \"shape\" }) { id: ID! }";
    var transformer = new GraphQLTransform_1.default({
        transformers: [
            new PingTransformer()
        ]
    });
    try {
        console.log("Transforming: \n" + invalidSchema);
        var out = transformer.transform(invalidSchema);
        expect(true).toEqual(false);
    }
    catch (e) {
        console.log(e.message);
        expect(e.name).toEqual('SchemaValidationError');
    }
});
test('Test graphql transformer returns correct number of arguments from directive', function () {
    var validSchema = "type Post @model(queries: { list: \"listPost\" }, mutations: {create: \"createCustom\"}) { name: String! }";
    var transformer = new ValidObjectTransformer();
    var doc = graphql_1.parse(validSchema);
    var def = doc.definitions[0];
    var map = util_1.getDirectiveArguments(def.directives[0]);
    expect(map).not.toBeNull();
    expect(Object.keys(map)).toEqual(expect.arrayContaining(['mutations', 'queries']));
});
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=GraphQLTransform.test.js.map