"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cloudform_types_1 = require("cloudform-types");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var ResourceFactory = /** @class */ (function () {
    function ResourceFactory() {
    }
    ResourceFactory.prototype.makeParams = function () {
        var _a;
        return _a = {},
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableReadIOPS] = new cloudform_types_1.NumberParameter({
                Description: 'The number of read IOPS the table should support.',
                Default: 5
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableWriteIOPS] = new cloudform_types_1.NumberParameter({
                Description: 'The number of write IOPS the table should support.',
                Default: 5
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBBillingMode] = new cloudform_types_1.StringParameter({
                Description: 'Configure @model types to create DynamoDB tables with PAY_PER_REQUEST or PROVISIONED billing modes.',
                Default: 'PAY_PER_REQUEST',
                AllowedValues: [
                    'PAY_PER_REQUEST',
                    'PROVISIONED'
                ]
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBEnablePointInTimeRecovery] = new cloudform_types_1.StringParameter({
                Description: 'Whether to enable Point in Time Recovery on the table',
                Default: 'false',
                AllowedValues: [
                    'true',
                    'false'
                ]
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBEnableServerSideEncryption] = new cloudform_types_1.StringParameter({
                Description: 'Enable server side encryption powered by KMS.',
                Default: 'true',
                AllowedValues: [
                    'true',
                    'false'
                ]
            }),
            _a;
    };
    /**
     * Creates the barebones template for an application.
     */
    ResourceFactory.prototype.initTemplate = function () {
        var _a, _b, _c;
        return {
            Parameters: this.makeParams(),
            Resources: (_a = {},
                _a[graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID] = this.makeAppSyncAPI(),
                _a),
            Outputs: (_b = {},
                _b[graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIIdOutput] = this.makeAPIIDOutput(),
                _b[graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput] = this.makeAPIEndpointOutput(),
                _b),
            Conditions: (_c = {},
                _c[graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUsePayPerRequestBilling] = cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBBillingMode), 'PAY_PER_REQUEST'),
                _c[graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUsePointInTimeRecovery] = cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBEnablePointInTimeRecovery), 'true'),
                _c[graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUseServerSideEncryption] = cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBEnableServerSideEncryption), 'true'),
                _c)
        };
    };
    /**
     * Create the AppSync API.
     */
    ResourceFactory.prototype.makeAppSyncAPI = function () {
        return new cloudform_types_1.AppSync.GraphQLApi({
            Name: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join('-', [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiName), cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env)]), cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiName)),
            AuthenticationType: 'API_KEY'
        });
    };
    ResourceFactory.prototype.makeAppSyncSchema = function (schema) {
        return new cloudform_types_1.AppSync.GraphQLSchema({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            Definition: schema
        });
    };
    /**
     * Outputs
     */
    ResourceFactory.prototype.makeAPIIDOutput = function () {
        return {
            Description: "Your GraphQL API ID.",
            Value: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Refs.StackName, "GraphQLApiId"])
            }
        };
    };
    ResourceFactory.prototype.makeAPIEndpointOutput = function () {
        return {
            Description: "Your GraphQL API endpoint.",
            Value: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'GraphQLUrl'),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Refs.StackName, "GraphQLApiEndpoint"])
            }
        };
    };
    ResourceFactory.prototype.makeTableStreamArnOutput = function (resourceId) {
        return {
            Description: "Your DynamoDB table StreamArn.",
            Value: cloudform_types_1.Fn.GetAtt(resourceId, "StreamArn"),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId), "GetAtt", resourceId, "StreamArn"])
            }
        };
    };
    ResourceFactory.prototype.makeDataSourceOutput = function (resourceId) {
        return {
            Description: "Your model DataSource name.",
            Value: cloudform_types_1.Fn.GetAtt(resourceId, "Name"),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId), "GetAtt", resourceId, "Name"])
            }
        };
    };
    ResourceFactory.prototype.makeTableNameOutput = function (resourceId) {
        return {
            Description: "Your DynamoDB table name.",
            Value: cloudform_types_1.Fn.Ref(resourceId),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId), "GetAtt", resourceId, "Name"])
            }
        };
    };
    /**
     * Create a DynamoDB table for a specific type.
     */
    ResourceFactory.prototype.makeModelTable = function (typeName, hashKey, rangeKey, deletionPolicy) {
        if (hashKey === void 0) { hashKey = 'id'; }
        if (deletionPolicy === void 0) { deletionPolicy = cloudform_types_1.DeletionPolicy.Delete; }
        var keySchema = hashKey && rangeKey ? [
            {
                AttributeName: hashKey,
                KeyType: 'HASH'
            }, {
                AttributeName: rangeKey,
                KeyType: 'RANGE'
            }
        ] : [{ AttributeName: hashKey, KeyType: 'HASH' }];
        var attributeDefinitions = hashKey && rangeKey ? [
            {
                AttributeName: hashKey,
                AttributeType: 'S'
            }, {
                AttributeName: rangeKey,
                AttributeType: 'S'
            }
        ] : [{ AttributeName: hashKey, AttributeType: 'S' }];
        return new cloudform_types_1.DynamoDB.Table({
            TableName: this.dynamoDBTableName(typeName),
            KeySchema: keySchema,
            AttributeDefinitions: attributeDefinitions,
            StreamSpecification: {
                StreamViewType: 'NEW_AND_OLD_IMAGES'
            },
            BillingMode: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUsePayPerRequestBilling, 'PAY_PER_REQUEST', cloudform_types_1.Refs.NoValue),
            ProvisionedThroughput: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUsePayPerRequestBilling, cloudform_types_1.Refs.NoValue, {
                ReadCapacityUnits: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableReadIOPS),
                WriteCapacityUnits: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableWriteIOPS)
            }),
            SSESpecification: {
                SSEEnabled: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUseServerSideEncryption, true, false)
            },
            PointInTimeRecoverySpecification: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUsePointInTimeRecovery, {
                PointInTimeRecoveryEnabled: true
            }, cloudform_types_1.Refs.NoValue),
        }).deletionPolicy(deletionPolicy);
    };
    ResourceFactory.prototype.dynamoDBTableName = function (typeName) {
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join('-', [
            typeName,
            cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env)
        ]), cloudform_types_1.Fn.Join('-', [typeName, cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId')]));
    };
    /**
     * Create a single role that has access to all the resources created by the
     * transform.
     * @param name  The name of the IAM role to create.
     */
    ResourceFactory.prototype.makeIAMRole = function (typeName) {
        return new cloudform_types_1.IAM.Role({
            RoleName: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join('-', [
                typeName.slice(0, 21),
                'role',
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
                cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env) // 10
            ]), cloudform_types_1.Fn.Join('-', [
                typeName.slice(0, 31),
                'role',
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId')
            ])),
            AssumeRolePolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: {
                            Service: 'appsync.amazonaws.com'
                        },
                        Action: 'sts:AssumeRole'
                    }
                ]
            },
            Policies: [
                new cloudform_types_1.IAM.Role.Policy({
                    PolicyName: 'DynamoDBAccess',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: [
                                    'dynamodb:BatchGetItem',
                                    'dynamodb:BatchWriteItem',
                                    'dynamodb:PutItem',
                                    'dynamodb:DeleteItem',
                                    'dynamodb:GetItem',
                                    'dynamodb:Scan',
                                    'dynamodb:Query',
                                    'dynamodb:UpdateItem'
                                ],
                                Resource: [
                                    cloudform_types_1.Fn.Sub('arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${tablename}', {
                                        tablename: this.dynamoDBTableName(typeName)
                                    }),
                                    cloudform_types_1.Fn.Sub('arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${tablename}/*', {
                                        tablename: this.dynamoDBTableName(typeName)
                                    })
                                ]
                            }
                        ]
                    }
                })
            ]
        });
    };
    /**
     * Given the name of a data source and optional logical id return a CF
     * spec for a data source pointing to the dynamodb table.
     */
    ResourceFactory.prototype.makeDynamoDBDataSource = function (tableId, iamRoleLogicalID, typeName) {
        return new cloudform_types_1.AppSync.DataSource({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            Name: tableId,
            Type: 'AMAZON_DYNAMODB',
            ServiceRoleArn: cloudform_types_1.Fn.GetAtt(iamRoleLogicalID, 'Arn'),
            DynamoDBConfig: {
                AwsRegion: cloudform_types_1.Refs.Region,
                TableName: this.dynamoDBTableName(typeName)
            }
        }).dependsOn([iamRoleLogicalID]);
    };
    /**
     * Create a resolver that creates an item in DynamoDB.
     * @param type
     */
    ResourceFactory.prototype.makeCreateResolver = function (type, nameOverride, mutationTypeName) {
        if (mutationTypeName === void 0) { mutationTypeName = 'Mutation'; }
        var fieldName = nameOverride ? nameOverride : graphql_transformer_common_1.graphqlName('create' + graphql_transformer_common_1.toUpper(type));
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(type), 'Name'),
            FieldName: fieldName,
            TypeName: mutationTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.printBlock('Prepare DynamoDB PutItem Request')(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.qref('$context.args.input.put("createdAt", $util.defaultIfNull($ctx.args.input.createdAt, $util.time.nowISO8601()))'),
                graphql_mapping_template_1.qref('$context.args.input.put("updatedAt", $util.defaultIfNull($ctx.args.input.updatedAt, $util.time.nowISO8601()))'),
                graphql_mapping_template_1.qref("$context.args.input.put(\"__typename\", \"" + type + "\")"),
                graphql_mapping_template_1.DynamoDBMappingTemplate.putItem({
                    key: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.raw("$util.toJson($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ")"), graphql_mapping_template_1.obj({
                        id: graphql_mapping_template_1.raw("$util.dynamodb.toDynamoDBJson($util.defaultIfNullOrBlank($ctx.args.input.id, $util.autoId()))")
                    }), true),
                    attributeValues: graphql_mapping_template_1.ref('util.dynamodb.toMapValuesJson($context.args.input)'),
                    condition: graphql_mapping_template_1.obj({
                        expression: graphql_mapping_template_1.str("attribute_not_exists(#id)"),
                        expressionNames: graphql_mapping_template_1.obj({
                            "#id": graphql_mapping_template_1.str('id')
                        })
                    })
                }),
            ])),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ref('util.toJson($context.result)'))
        });
    };
    ResourceFactory.prototype.makeUpdateResolver = function (type, nameOverride, mutationTypeName) {
        if (mutationTypeName === void 0) { mutationTypeName = 'Mutation'; }
        var fieldName = nameOverride ? nameOverride : graphql_transformer_common_1.graphqlName("update" + graphql_transformer_common_1.toUpper(type));
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(type), 'Name'),
            FieldName: fieldName,
            TypeName: mutationTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.comment('Automatically set the updatedAt timestamp, typename'),
                graphql_mapping_template_1.qref('$context.args.input.put("updatedAt", $util.time.nowISO8601())'),
                graphql_mapping_template_1.qref("$context.args.input.put(\"__typename\", \"" + type + "\")"),
                graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw("$" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition + " && $" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition + ".expression != \"\""), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('condition'), graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition)),
                    graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('entry'), graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ".entrySet()"), [
                        graphql_mapping_template_1.qref('$condition.put("expression", "$condition.expression AND attribute_exists(#keyCondition$velocityCount)")'),
                        graphql_mapping_template_1.qref('$condition.expressionNames.put("#keyCondition$velocityCount", "$entry.key")')
                    ]), graphql_mapping_template_1.compoundExpression([
                        graphql_mapping_template_1.qref('$condition.put("expression", "$condition.expression AND attribute_exists(#id)")'),
                        graphql_mapping_template_1.qref('$condition.expressionNames.put("#id", "id")')
                    ]))
                ]), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('condition'), graphql_mapping_template_1.obj({
                        expression: graphql_mapping_template_1.str(""),
                        expressionNames: graphql_mapping_template_1.obj({}),
                        expressionValues: graphql_mapping_template_1.obj({}),
                    })),
                    graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('entry'), graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ".entrySet()"), [
                        graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$velocityCount == 1'), graphql_mapping_template_1.qref('$condition.put("expression", "attribute_exists(#keyCondition$velocityCount)")'), graphql_mapping_template_1.qref('$condition.put(\
"expression", "$condition.expression AND attribute_exists(#keyCondition$velocityCount)")')),
                        graphql_mapping_template_1.qref('$condition.expressionNames.put("#keyCondition$velocityCount", "$entry.key")')
                    ])
                ]), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('condition'), graphql_mapping_template_1.obj({
                    expression: graphql_mapping_template_1.str("attribute_exists(#id)"),
                    expressionNames: graphql_mapping_template_1.obj({
                        "#id": graphql_mapping_template_1.str("id")
                    }),
                    expressionValues: graphql_mapping_template_1.obj({}),
                })))),
                graphql_mapping_template_1.comment('Prevent updating createdAt'),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('!$util.isNull($context.args.input.createdAt)'), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.qref('$condition.put("expression", "($condition.expression) AND createdAt=:createdAt")'),
                    graphql_mapping_template_1.qref('$condition.expressionValues.put(":createdAt", {"S": "$context.args.input.createdAt"})')
                ])),
                graphql_mapping_template_1.comment('Update condition if type is @versioned'),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition), graphql_mapping_template_1.compoundExpression([
                    // tslint:disable-next-line
                    graphql_mapping_template_1.qref("$condition.put(\"expression\", \"($condition.expression) AND $" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition + ".expression\")"),
                    graphql_mapping_template_1.qref("$condition.expressionNames.putAll($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition + ".expressionNames)"),
                    graphql_mapping_template_1.qref("$condition.expressionValues.putAll($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition + ".expressionValues)")
                ])),
                graphql_mapping_template_1.DynamoDBMappingTemplate.updateItem({
                    key: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.raw("$util.toJson($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ")"), graphql_mapping_template_1.obj({
                        id: graphql_mapping_template_1.obj({ S: graphql_mapping_template_1.str('$context.args.input.id') })
                    }), true),
                    condition: graphql_mapping_template_1.ref('util.toJson($condition)'),
                    objectKeyVariable: graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey,
                    nameOverrideMap: graphql_transformer_common_1.ResourceConstants.SNIPPETS.DynamoDBNameOverrideMap
                })
            ])),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ref('util.toJson($context.result)'))
        });
    };
    /**
     * Create a resolver that creates an item in DynamoDB.
     * @param type
     */
    ResourceFactory.prototype.makeGetResolver = function (type, nameOverride, queryTypeName) {
        if (queryTypeName === void 0) { queryTypeName = 'Query'; }
        var fieldName = nameOverride ? nameOverride : graphql_transformer_common_1.graphqlName('get' + graphql_transformer_common_1.toUpper(type));
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(type), 'Name'),
            FieldName: fieldName,
            TypeName: queryTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.DynamoDBMappingTemplate.getItem({
                key: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.raw("$util.toJson($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ")"), graphql_mapping_template_1.obj({
                    id: graphql_mapping_template_1.ref('util.dynamodb.toDynamoDBJson($ctx.args.id)')
                }), true)
            })),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ref('util.toJson($context.result)'))
        });
    };
    /**
     * Create a resolver that queries an item in DynamoDB.
     * @param type
     */
    ResourceFactory.prototype.makeQueryResolver = function (type, nameOverride, queryTypeName) {
        if (queryTypeName === void 0) { queryTypeName = 'Query'; }
        var fieldName = nameOverride ? nameOverride : graphql_transformer_common_1.graphqlName("query" + graphql_transformer_common_1.toUpper(type));
        var defaultPageLimit = 10;
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(type), 'Name'),
            FieldName: fieldName,
            TypeName: queryTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('limit'), graphql_mapping_template_1.ref("util.defaultIfNull($context.args.limit, " + defaultPageLimit + ")")),
                graphql_mapping_template_1.DynamoDBMappingTemplate.query({
                    query: graphql_mapping_template_1.obj({
                        'expression': graphql_mapping_template_1.str('#typename = :typename'),
                        'expressionNames': graphql_mapping_template_1.obj({
                            '#typename': graphql_mapping_template_1.str('__typename')
                        }),
                        'expressionValues': graphql_mapping_template_1.obj({
                            ':typename': graphql_mapping_template_1.obj({
                                'S': graphql_mapping_template_1.str(type)
                            })
                        })
                    }),
                    scanIndexForward: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.sortDirection'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.equals(graphql_mapping_template_1.ref('context.args.sortDirection'), graphql_mapping_template_1.str('ASC')), graphql_mapping_template_1.bool(true), graphql_mapping_template_1.bool(false)), graphql_mapping_template_1.bool(true)),
                    filter: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.filter'), graphql_mapping_template_1.ref('util.transform.toDynamoDBFilterExpression($ctx.args.filter)'), graphql_mapping_template_1.nul()),
                    limit: graphql_mapping_template_1.ref('limit'),
                    nextToken: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.nextToken'), graphql_mapping_template_1.str('$context.args.nextToken'), graphql_mapping_template_1.nul())
                })
            ])),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('!$result'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('result'), graphql_mapping_template_1.ref('ctx.result'))),
                graphql_mapping_template_1.raw('$util.toJson($result)')
            ]))
        });
    };
    /**
     * Create a resolver that lists items in DynamoDB.
     * TODO: actually fill out the right filter expression. This is a placeholder only.
     * @param type
     */
    ResourceFactory.prototype.makeListResolver = function (type, nameOverride, queryTypeName) {
        if (queryTypeName === void 0) { queryTypeName = 'Query'; }
        var fieldName = nameOverride ? nameOverride : graphql_transformer_common_1.graphqlName('list' + graphql_transformer_common_1.plurality(graphql_transformer_common_1.toUpper(type)));
        var defaultPageLimit = 10;
        var requestVariable = 'ListRequest';
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(type), 'Name'),
            FieldName: fieldName,
            TypeName: queryTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('limit'), graphql_mapping_template_1.ref("util.defaultIfNull($context.args.limit, " + defaultPageLimit + ")")),
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable), graphql_mapping_template_1.obj({
                    version: graphql_mapping_template_1.str('2017-02-28'),
                    limit: graphql_mapping_template_1.ref('limit')
                })),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('context.args.nextToken'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".nextToken"), graphql_mapping_template_1.str('$context.args.nextToken'))),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('context.args.filter'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".filter"), graphql_mapping_template_1.ref('util.parseJson("$util.transform.toDynamoDBFilterExpression($ctx.args.filter)")'))),
                graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw("!$util.isNull($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelQueryExpression + ")\n                        && !$util.isNullOrEmpty($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelQueryExpression + ".expression)"), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.qref("$" + requestVariable + ".put(\"operation\", \"Query\")"),
                    graphql_mapping_template_1.qref("$" + requestVariable + ".put(\"query\", $" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelQueryExpression + ")"),
                    graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw("!$util.isNull($ctx.args.sortDirection) && $ctx.args.sortDirection == \"DESC\""), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".scanIndexForward"), graphql_mapping_template_1.bool(false)), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".scanIndexForward"), graphql_mapping_template_1.bool(true)))
                ]), graphql_mapping_template_1.qref("$" + requestVariable + ".put(\"operation\", \"Scan\")")),
                graphql_mapping_template_1.raw("$util.toJson($" + requestVariable + ")")
            ])),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.raw('$util.toJson($ctx.result)'))
        });
    };
    /**
     * Create a resolver that deletes an item from DynamoDB.
     * @param type The name of the type to delete an item of.
     * @param nameOverride A user provided override for the field name.
     */
    ResourceFactory.prototype.makeDeleteResolver = function (type, nameOverride, mutationTypeName) {
        if (mutationTypeName === void 0) { mutationTypeName = 'Mutation'; }
        var fieldName = nameOverride ? nameOverride : graphql_transformer_common_1.graphqlName('delete' + graphql_transformer_common_1.toUpper(type));
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(type), 'Name'),
            FieldName: fieldName,
            TypeName: mutationTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('condition'), graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.AuthCondition)),
                    graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('entry'), graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ".entrySet()"), [
                        graphql_mapping_template_1.qref('$condition.put("expression", "$condition.expression AND attribute_exists(#keyCondition$velocityCount)")'),
                        graphql_mapping_template_1.qref('$condition.expressionNames.put("#keyCondition$velocityCount", "$entry.key")')
                    ]), graphql_mapping_template_1.compoundExpression([
                        graphql_mapping_template_1.qref('$condition.put("expression", "$condition.expression AND attribute_exists(#id)")'),
                        graphql_mapping_template_1.qref('$condition.expressionNames.put("#id", "id")')
                    ]))
                ]), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('condition'), graphql_mapping_template_1.obj({
                        expression: graphql_mapping_template_1.str(""),
                        expressionNames: graphql_mapping_template_1.obj({}),
                    })),
                    graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('entry'), graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ".entrySet()"), [
                        graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$velocityCount == 1'), graphql_mapping_template_1.qref('$condition.put("expression", "attribute_exists(#keyCondition$velocityCount)")'), graphql_mapping_template_1.qref('$condition.put(\
"expression", "$condition.expression AND attribute_exists(#keyCondition$velocityCount)")')),
                        graphql_mapping_template_1.qref('$condition.expressionNames.put("#keyCondition$velocityCount", "$entry.key")')
                    ])
                ]), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('condition'), graphql_mapping_template_1.obj({
                    expression: graphql_mapping_template_1.str("attribute_exists(#id)"),
                    expressionNames: graphql_mapping_template_1.obj({
                        "#id": graphql_mapping_template_1.str("id")
                    })
                })))),
                graphql_mapping_template_1.iff(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition), graphql_mapping_template_1.compoundExpression([
                    // tslint:disable-next-line
                    graphql_mapping_template_1.qref("$condition.put(\"expression\", \"($condition.expression) AND $" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition + ".expression\")"),
                    graphql_mapping_template_1.qref("$condition.expressionNames.putAll($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition + ".expressionNames)"),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('expressionValues'), graphql_mapping_template_1.raw('$util.defaultIfNull($condition.expressionValues, {})')),
                    graphql_mapping_template_1.qref("$expressionValues.putAll($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.VersionedCondition + ".expressionValues)"),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('condition.expressionValues'), graphql_mapping_template_1.ref('expressionValues'))
                ])),
                graphql_mapping_template_1.DynamoDBMappingTemplate.deleteItem({
                    key: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), graphql_mapping_template_1.raw("$util.toJson($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey + ")"), graphql_mapping_template_1.obj({
                        id: graphql_mapping_template_1.ref('util.dynamodb.toDynamoDBJson($ctx.args.input.id)')
                    }), true),
                    condition: graphql_mapping_template_1.ref('util.toJson($condition)')
                })
            ])),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ref('util.toJson($context.result)'))
        });
    };
    return ResourceFactory;
}());
exports.ResourceFactory = ResourceFactory;
//# sourceMappingURL=resources.js.map