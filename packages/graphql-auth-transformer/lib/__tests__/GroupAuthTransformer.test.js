"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_transformer_core_1 = require("graphql-transformer-core");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const ModelAuthTransformer_1 = require("../ModelAuthTransformer");
test('Test ModelAuthTransformer validation happy case w/ static groups', () => {
    const validSchema = `
    type Post @model @auth(rules: [{allow: groups, groups: ["Admin", "Dev"]}]) {
        id: ID!
        title: String!
        createdAt: String
        updatedAt: String
    }
    `;
    const transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new ModelAuthTransformer_1.ModelAuthTransformer({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: "AMAZON_COGNITO_USER_POOLS"
                    },
                    additionalAuthenticationProviders: []
                }
            })
        ]
    });
    const out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.rootStack.Resources[graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID].Properties.AuthenticationType).toEqual('AMAZON_COGNITO_USER_POOLS');
});
test('Test ModelAuthTransformer validation happy case w/ dynamic groups', () => {
    const validSchema = `
    type Post @model @auth(rules: [{allow: groups, groupsField: "groups"}]) {
        id: ID!
        title: String!
        groups: [String]
        createdAt: String
        updatedAt: String
    }
    `;
    const transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new ModelAuthTransformer_1.ModelAuthTransformer({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: "AMAZON_COGNITO_USER_POOLS"
                    },
                    additionalAuthenticationProviders: []
                }
            })
        ]
    });
    const out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.rootStack.Resources[graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID].Properties.AuthenticationType).toEqual('AMAZON_COGNITO_USER_POOLS');
});
test('Test ModelAuthTransformer validation happy case w/ dynamic group', () => {
    const validSchema = `
    type Post @model @auth(rules: [{allow: groups, groupsField: "group"}]) {
        id: ID!
        title: String!
        group: String
        createdAt: String
        updatedAt: String
    }
    `;
    const transformer = new graphql_transformer_core_1.default({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new ModelAuthTransformer_1.ModelAuthTransformer({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: "AMAZON_COGNITO_USER_POOLS"
                    },
                    additionalAuthenticationProviders: []
                }
            })
        ]
    });
    const out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.rootStack.Resources[graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID].Properties.AuthenticationType).toEqual('AMAZON_COGNITO_USER_POOLS');
});
test('Test ModelAuthTransformer validation @auth on non @model. Should fail.', () => {
    try {
        const validSchema = `
            type Post @auth(rules: [{allow: groups, groupsField: "groups"}]) {
                id: ID!
                title: String!
                group: String
                createdAt: String
                updatedAt: String
            }
        `;
        const transformer = new graphql_transformer_core_1.default({
            transformers: [
                new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
                new ModelAuthTransformer_1.ModelAuthTransformer({
                    authConfig: {
                        defaultAuthentication: {
                            authenticationType: "AMAZON_COGNITO_USER_POOLS"
                        },
                        additionalAuthenticationProviders: []
                    }
                })
            ]
        });
        const out = transformer.transform(validSchema);
        expect(true).toEqual(false);
    }
    catch (e) {
        expect(e).toBeDefined();
    }
});
//# sourceMappingURL=GroupAuthTransformer.test.js.map