"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_common_1 = require("graphql-transformer-common");
function makeHttpArgument(name, inputType, makeNonNull) {
    // the URL params type that we create will need to be non-null, so build in some flexibility here
    var type = makeNonNull ? graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(inputType.name.value))
        : graphql_transformer_common_1.makeNamedType(inputType.name.value);
    return graphql_transformer_common_1.makeInputValueDefinition(name, type);
}
exports.makeHttpArgument = makeHttpArgument;
function makeUrlParamInputObject(parent, field, urlParams) {
    var name = graphql_transformer_common_1.ModelResourceIDs.UrlParamsInputObjectName(parent.name.value, field.name.value);
    var urlParamFields = urlParams.map(function (param) {
        return graphql_transformer_common_1.makeInputValueDefinition(param, graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType('String')));
    });
    console.log("urlParamInputObject has these fields: " + graphql_1.print(urlParamFields));
    var fields = urlParamFields;
    return {
        kind: 'InputObjectTypeDefinition',
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name
        },
        fields: fields,
        directives: []
    };
}
exports.makeUrlParamInputObject = makeUrlParamInputObject;
function makeHttpQueryInputObject(parent, field, queryArgArray, deNull) {
    var name = graphql_transformer_common_1.ModelResourceIDs.HttpQueryInputObjectName(parent.name.value, field.name.value);
    // unwrap all the non-nulls in the argument array if the flag is set
    var fields = deNull ?
        queryArgArray.map(function (arg) {
            return __assign(__assign({}, arg), { type: graphql_transformer_common_1.unwrapNonNull(arg.type) });
        }) :
        queryArgArray;
    return {
        kind: 'InputObjectTypeDefinition',
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name
        },
        fields: fields,
        directives: []
    };
}
exports.makeHttpQueryInputObject = makeHttpQueryInputObject;
function makeHttpBodyInputObject(parent, field, bodyArgArray, deNull) {
    var name = graphql_transformer_common_1.ModelResourceIDs.HttpBodyInputObjectName(parent.name.value, field.name.value);
    // unwrap all the non-nulls in the argument array if the flag is set
    var fields = deNull ?
        bodyArgArray.map(function (arg) {
            return __assign(__assign({}, arg), { type: graphql_transformer_common_1.unwrapNonNull(arg.type) });
        }) :
        bodyArgArray;
    return {
        kind: 'InputObjectTypeDefinition',
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name
        },
        fields: fields,
        directives: []
    };
}
exports.makeHttpBodyInputObject = makeHttpBodyInputObject;
//# sourceMappingURL=definitions.js.map