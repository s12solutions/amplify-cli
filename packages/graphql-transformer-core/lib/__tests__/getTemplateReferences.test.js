"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getTemplateReferences_1 = require("../util/getTemplateReferences");
var cloudform_types_1 = require("cloudform-types");
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
    }
};
test('Test getTemplateReferences', function () {
    var referenceMap = getTemplateReferences_1.getTemplateReferences(template); //JSON.parse(JSON.stringify(template, null, 4)));
    expect(referenceMap).toBeTruthy();
    expect(referenceMap.env).toEqual([['Conditions', 'IsProd', 'Fn::Equals', '0']]);
    expect(referenceMap.API.sort()).toEqual([
        ['Resources', 'PostTableDataSource', 'Properties', 'ApiId'],
        ['Resources', 'CreatePostResolver', 'Properties', 'ApiId'],
        ['Resources', 'UpdatePostResolver', 'Properties', 'ApiId']
    ].sort());
    expect(referenceMap.PostTableDataSource.sort()).toEqual([
        ['Resources', 'CreatePostResolver', 'Properties', 'DataSourceName'],
        ['Resources', 'UpdatePostResolver', 'Properties', 'DataSourceName', 'Fn::Join', '1', '1', 'Fn::Join', '1', '0'],
    ].sort());
    expect(referenceMap.PostTable.sort()).toEqual([
        ['Resources', 'UpdatePostResolver', 'Properties', 'DataSourceName', 'Fn::Join', '1', '0'],
        ['Resources', 'UpdatePostResolver', 'Properties', 'FieldName', 'Fn::Split', '1'],
        ['Resources', 'UpdatePostResolver', 'Properties', 'TypeName', 'Fn::Sub', '1', 't'],
        ['Resources', 'UpdatePostResolver', 'Properties', 'RequestMappingTemplate', 'Fn::Select', '1', '0']
    ].sort());
});
//# sourceMappingURL=getTemplateReferences.test.js.map