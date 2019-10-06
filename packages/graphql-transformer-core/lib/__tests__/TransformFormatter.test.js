"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TransformFormatter_1 = require("../TransformFormatter");
var cloudform_types_1 = require("cloudform-types");
var __1 = require("..");
var template = {
    Parameters: {
        IsProd: {
            Type: "String",
            Default: "prod"
        }
    },
    Conditions: {
        IsProd: cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref("env"), "prod")
    },
    Resources: {
        API: new cloudform_types_1.AppSync.GraphQLApi({
            Name: "My AppSync API",
            AuthenticationType: "API_KEY"
        }),
        PostTableDataSource: new cloudform_types_1.AppSync.DataSource({
            ApiId: cloudform_types_1.Fn.Ref("API"),
            Name: "PostDataSource",
            Type: "AMAZON_DYNAMODB"
        }),
        PostTable: new cloudform_types_1.DynamoDB.Table({
            KeySchema: [{
                    AttributeName: "id",
                    KeyType: "HASH"
                }],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        }),
        CreatePostResolver: new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.Ref("API"),
            DataSourceName: cloudform_types_1.Fn.GetAtt("PostTableDataSource", "name"),
            FieldName: "createPost",
            TypeName: "Mutation"
        }),
        UpdatePostResolver: new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.Ref("API"),
            DataSourceName: cloudform_types_1.Fn.Join(":", [
                cloudform_types_1.Fn.Ref("PostTable"),
                cloudform_types_1.Fn.Join(":", [
                    cloudform_types_1.Fn.GetAtt("PostTableDataSource", "name")
                ])
            ]),
            // Contrived examples for test coverage.
            FieldName: cloudform_types_1.Fn.Split(":", cloudform_types_1.Fn.Ref("PostTable")),
            TypeName: cloudform_types_1.Fn.Sub("${t}", {
                t: cloudform_types_1.Fn.Ref("PostTable")
            }),
            RequestMappingTemplate: cloudform_types_1.Fn.Select(0, [
                cloudform_types_1.Fn.Ref("PostTable")
            ])
        })
    },
    Outputs: {
        PostTableOutput: {
            Description: "PostTable Arn.",
            Value: cloudform_types_1.Fn.GetAtt("PostTable", 'Arn')
        }
    },
    Mappings: {
        "LayerResourceMapping": {
            "us-east-1": {
                "layerRegion": "arn:aws:lambda:us-east-1:668099181075:layer:AWSLambda-Python-AWS-SDK:1"
            },
        }
    }
};
test('Test getTemplateReferences', function () {
    var formatter = new TransformFormatter_1.TransformFormatter();
    var context = new __1.TransformerContext('type Post @model { id: ID! title: String }');
    context.mapResourceToStack('PostModel', 'CreatePostResolver');
    context.mapResourceToStack('PostModel', 'UpdatePostResolver');
    context.mapResourceToStack('PostModel', 'PostTableDataSource');
    context.mapResourceToStack('PostModel', 'PostTable');
    context.mapResourceToStack('PostModel', 'PostTableOutput');
    context.template = template;
    var deploymentResources = formatter.format(context);
    expect(Object.keys(deploymentResources.stacks.PostModel.Resources)).toHaveLength(4);
    expect(Object.keys(deploymentResources.rootStack.Resources)).toHaveLength(3);
    expect(Object.keys(deploymentResources.stacks.PostModel.Outputs)).toHaveLength(1);
    expect(Object.keys(deploymentResources.rootStack.Outputs)).toHaveLength(0);
});
//# sourceMappingURL=TransformFormatter.test.js.map