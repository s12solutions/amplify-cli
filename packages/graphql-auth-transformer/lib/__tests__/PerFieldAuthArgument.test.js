"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_transformer_core_1 = require("graphql-transformer-core");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const ModelAuthTransformer_1 = require("../ModelAuthTransformer");
test('Test that subscriptions are only generated if the respective mutation operation exists', () => {
    const validSchema = `
    type Salary
        @model
        @auth(rules: [
                {allow: owner},
                {allow: groups, groups: ["Moderator"]}
            ])
    {
        id: ID!
        wage: Int
        owner: String
        secret: String @auth(rules: [{allow: owner}])
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
    // expect to generate subscription resolvers for create and update only
    expect(out).toBeDefined();
    expect(out.rootStack.Resources[graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID].Properties.AuthenticationType).toEqual('AMAZON_COGNITO_USER_POOLS');
    expect(out.resolvers['Salary.secret.res.vtl']).toContain('#if( $operation == "Mutation" )');
    expect(out.resolvers['Salary.secret.res.vtl']).toMatchSnapshot();
    expect(out.resolvers['Mutation.createSalary.res.vtl']).toContain('#set( $context.result.operation = "Mutation" )');
    expect(out.resolvers['Mutation.createSalary.res.vtl']).toMatchSnapshot();
    expect(out.resolvers['Mutation.updateSalary.res.vtl']).toContain('#set( $context.result.operation = "Mutation" )');
    expect(out.resolvers['Mutation.updateSalary.res.vtl']).toMatchSnapshot();
    expect(out.resolvers['Mutation.deleteSalary.res.vtl']).toContain('#set( $context.result.operation = "Mutation" )');
    expect(out.resolvers['Mutation.deleteSalary.res.vtl']).toMatchSnapshot();
});
//# sourceMappingURL=PerFieldAuthArgument.test.js.map