"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var DEFAULT_SCHEMA_DEFINITION = {
    kind: graphql_1.Kind.SCHEMA_DEFINITION,
    directives: [],
    operationTypes: [
        {
            kind: graphql_1.Kind.OPERATION_TYPE_DEFINITION,
            operation: 'query',
            type: {
                kind: graphql_1.Kind.NAMED_TYPE,
                name: {
                    kind: graphql_1.Kind.NAME,
                    value: 'Query',
                },
            },
        },
        {
            kind: graphql_1.Kind.OPERATION_TYPE_DEFINITION,
            operation: 'mutation',
            type: {
                kind: graphql_1.Kind.NAMED_TYPE,
                name: {
                    kind: graphql_1.Kind.NAME,
                    value: 'Mutation',
                },
            },
        },
        {
            kind: graphql_1.Kind.OPERATION_TYPE_DEFINITION,
            operation: 'subscription',
            type: {
                kind: graphql_1.Kind.NAMED_TYPE,
                name: {
                    kind: graphql_1.Kind.NAME,
                    value: 'Subscription',
                },
            },
        },
    ],
};
exports.default = DEFAULT_SCHEMA_DEFINITION;
//# sourceMappingURL=defaultSchema.js.map