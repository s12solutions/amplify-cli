"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var FunctionTransformer_1 = require("../FunctionTransformer");
test('FunctionTransformer should add a datasource, IAM role and a resolver resources', function () {
    var validSchema = "\n    type Query {\n        echo(msg: String): String @function(name: \"echofunction-${env}\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new FunctionTransformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    // EchofunctionLambdaDataSource, EchofunctionLambdaDataSourceRole, QueryEchoResolver, GraphQLSchema
    expect(Object.keys(out.stacks.FunctionDirectiveStack.Resources).length).toEqual(4);
    var expectedLambdaArn = 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:echofunction-${env}';
    // datasource
    var datasourceResource = out.stacks.FunctionDirectiveStack.Resources.EchofunctionLambdaDataSource;
    expect(datasourceResource).toBeDefined();
    expect(datasourceResource.Properties.LambdaConfig.LambdaFunctionArn['Fn::If'][1]['Fn::Sub'][0]).toEqual(expectedLambdaArn);
    // IAM role
    var iamRoleResource = out.stacks.FunctionDirectiveStack.Resources.EchofunctionLambdaDataSourceRole;
    expect(iamRoleResource).toBeDefined();
    expect(iamRoleResource.Properties.AssumeRolePolicyDocument.Statement[0].Principal.Service).toEqual('appsync.amazonaws.com');
    expect(iamRoleResource.Properties.AssumeRolePolicyDocument.Statement[0].Action).toEqual('sts:AssumeRole');
    expect(iamRoleResource.Properties.Policies[0].PolicyDocument.Statement[0].Action[0]).toEqual('lambda:InvokeFunction');
    expect(iamRoleResource.Properties.Policies[0].PolicyDocument.Statement[0].Resource['Fn::If'][1]['Fn::Sub'][0]).toEqual(expectedLambdaArn);
    // Resolver
    var resolverResource = out.stacks.FunctionDirectiveStack.Resources.QueryechoResolver;
    expect(resolverResource).toBeDefined();
    expect(resolverResource.Properties.FieldName).toEqual("echo");
    expect(resolverResource.Properties.TypeName).toEqual("Query");
    expect(resolverResource.Properties.Kind).toEqual('PIPELINE');
    expect(resolverResource.Properties.PipelineConfig.Functions.length).toEqual(1);
});
test('two @function directives for the same lambda should produce a single datasource, single role and two resolvers', function () {
    var validSchema = "\n    type Query {\n        echo(msg: String): String @function(name: \"echofunction-${env}\") \n        magic(msg: String): String @function(name: \"echofunction-${env}\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new FunctionTransformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(Object.keys(out.stacks.FunctionDirectiveStack.Resources).length).toEqual(5);
    expect(out.stacks.FunctionDirectiveStack.Resources.EchofunctionLambdaDataSource).toBeDefined();
    expect(out.stacks.FunctionDirectiveStack.Resources.EchofunctionLambdaDataSourceRole).toBeDefined();
    expect(out.stacks.FunctionDirectiveStack.Resources.QueryechoResolver).toBeDefined();
    expect(out.stacks.FunctionDirectiveStack.Resources.QuerymagicResolver).toBeDefined();
});
test('two @function directives for the same field should be valid', function () {
    var validSchema = "\n    type Query {\n        echo(msg: String): String @function(name: \"echofunction-${env}\") @function(name: \"otherfunction\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new FunctionTransformer_1.default()
        ]
    });
    var out = transformer.transform(validSchema);
    var resolverResource = out.stacks.FunctionDirectiveStack.Resources.QueryechoResolver;
    expect(resolverResource).toBeDefined();
    expect(resolverResource.Properties.FieldName).toEqual("echo");
    expect(resolverResource.Properties.TypeName).toEqual("Query");
    expect(resolverResource.Properties.PipelineConfig.Functions.length).toEqual(2);
    var otherFunctionIamResource = out.stacks.FunctionDirectiveStack.Resources.OtherfunctionLambdaDataSourceRole;
    expect(otherFunctionIamResource.Properties.Policies[0].PolicyDocument.Statement[0].Resource['Fn::If'][1]["Fn::Sub"][0]).toEqual('arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:otherfunction');
    var echoFunctionIamResource = out.stacks.FunctionDirectiveStack.Resources.EchofunctionLambdaDataSourceRole;
    expect(echoFunctionIamResource.Properties.Policies[0].PolicyDocument.Statement[0].Resource['Fn::If'][1]["Fn::Sub"][0]).toEqual('arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:echofunction-${env}');
    expect(echoFunctionIamResource.Properties.Policies[0].PolicyDocument.Statement[0].Resource['Fn::If'][1]["Fn::Sub"][1].env.Ref).toEqual('env');
});
test('@function directive applied to Object should throw SchemaValidationError', function () {
    var invalidSchema = "\n    type Query @function(name: \"echofunction-${env}\") {\n        echo(msg: String): String @function(name: \"echofunction-${env}\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new FunctionTransformer_1.default()
        ]
    });
    try {
        transformer.transform(invalidSchema);
        fail("SchemaValidationError is expected to be thrown");
    }
    catch (error) {
        expect(error.name).toEqual("SchemaValidationError");
    }
});
//# sourceMappingURL=FunctionTransformer.test.js.map