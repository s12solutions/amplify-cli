"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var appSync_1 = require("cloudform-types/types/appSync");
var iam_1 = require("cloudform-types/types/iam");
var cloudform_types_1 = require("cloudform-types");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var ResourceFactory = /** @class */ (function () {
    function ResourceFactory() {
    }
    ResourceFactory.prototype.makeParams = function () {
        var _a;
        return _a = {},
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchAccessIAMRoleName] = new cloudform_types_1.StringParameter({
                Description: 'The name of the IAM role assumed by AppSync for Elasticsearch.',
                Default: 'AppSyncElasticsearchRole'
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingLambdaHandlerName] = new cloudform_types_1.StringParameter({
                Description: 'The name of the lambda handler.',
                Default: 'python_streaming_function.lambda_handler'
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingLambdaRuntime] = new cloudform_types_1.StringParameter({
                Description: "The lambda runtime                 (https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime)",
                Default: 'python3.6'
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingFunctionName] = new cloudform_types_1.StringParameter({
                Description: 'The name of the streaming lambda function.',
                Default: 'DdbToEsFn'
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingIAMRoleName] = new cloudform_types_1.StringParameter({
                Description: 'The name of the streaming lambda function IAM role.',
                Default: 'SearchableLambdaIAMRole'
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchDebugStreamingLambda] = new cloudform_types_1.NumberParameter({
                Description: 'Enable debug logs for the Dynamo -> ES streaming lambda.',
                Default: 1,
                AllowedValues: [0, 1]
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchInstanceCount] = new cloudform_types_1.NumberParameter({
                Description: 'The number of instances to launch into the Elasticsearch domain.',
                Default: 1
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchInstanceType] = new cloudform_types_1.StringParameter({
                Description: 'The type of instance to launch into the Elasticsearch domain.',
                Default: 't2.small.elasticsearch',
                AllowedValues: [
                    't2.small.elasticsearch', 't2.medium.elasticsearch', 'c4.large.elasticsearch',
                    'c4.xlarge.elasticsearch', 'c4.2xlarge.elasticsearch', 'c4.4xlarge.elasticsearch',
                    'c4.8xlarge.elasticsearch', 'm3.medium.elasticsearch', 'm3.large.elasticsearch',
                    'm3.xlarge.elasticsearch', 'm3.2xlarge.elasticsearch', 'm4.large.elasticsearch',
                    'm4.xlarge.elasticsearch', 'm4.2xlarge.elasticsearch', 'm4.4xlarge.elasticsearch',
                    'm4.10xlarge.elasticsearch', 'r3.large.elasticsearch', 'r3.xlarge.elasticsearch',
                    'r3.2xlarge.elasticsearch', 'r3.4xlarge.elasticsearch', 'r3.8xlarge.elasticsearch',
                    'r4.large.elasticsearch', 'r4.xlarge.elasticsearch', 'r4.2xlarge.elasticsearch',
                    'r4.4xlarge.elasticsearch', 'r4.8xlarge.elasticsearch', 'r4.16xlarge.elasticsearch',
                    'i2.xlarge.elasticsearch', 'i2.2xlarge.elasticsearch', 'i3.large.elasticsearch',
                    'i3.xlarge.elasticsearch', 'i3.2xlarge.elasticsearch', 'i3.4xlarge.elasticsearch',
                    'i3.8xlarge.elasticsearch', 'i3.16xlarge.elasticsearch'
                ]
            }),
            _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchEBSVolumeGB] = new cloudform_types_1.NumberParameter({
                Description: 'The size in GB of the EBS volumes that contain our data.',
                Default: 10
            }),
            _a;
    };
    /**
     * Creates the barebones template for an application.
     */
    ResourceFactory.prototype.initTemplate = function () {
        var _a, _b;
        return {
            Parameters: this.makeParams(),
            Resources: (_a = {},
                _a[graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchAccessIAMRoleLogicalID] = this.makeElasticsearchAccessIAMRole(),
                _a[graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDataSourceLogicalID] = this.makeElasticsearchDataSource(),
                _a[graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID] = this.makeElasticsearchDomain(),
                _a[graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchStreamingLambdaIAMRoleLogicalID] = this.makeStreamingLambdaIAMRole(),
                _a[graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchStreamingLambdaFunctionLogicalID] = this.makeDynamoDBStreamingFunction(),
                _a),
            Mappings: this.getLayerMapping(),
            Outputs: (_b = {},
                _b[graphql_transformer_common_1.ResourceConstants.OUTPUTS.ElasticsearchDomainArn] = this.makeDomainArnOutput(),
                _b[graphql_transformer_common_1.ResourceConstants.OUTPUTS.ElasticsearchDomainEndpoint] = this.makeDomainEndpointOutput(),
                _b)
        };
    };
    /**
         * Given the name of a data source and optional logical id return a CF
         * spec for a data source pointing to the elasticsearch domain.
         * @param name The name for the data source. If a logicalId is not provided the name is used.
         * @param logicalId The logicalId of the domain if it is different than the name of the data source.
         */
    ResourceFactory.prototype.makeElasticsearchDataSource = function () {
        var logicalName = graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID;
        return new appSync_1.default.DataSource({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            Name: logicalName,
            Type: 'AMAZON_ELASTICSEARCH',
            ServiceRoleArn: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchAccessIAMRoleLogicalID, 'Arn'),
            ElasticsearchConfig: {
                AwsRegion: cloudform_types_1.Fn.Select(3, cloudform_types_1.Fn.Split(':', cloudform_types_1.Fn.GetAtt(logicalName, 'DomainArn'))),
                Endpoint: cloudform_types_1.Fn.Join('', [
                    'https://',
                    cloudform_types_1.Fn.GetAtt(logicalName, 'DomainEndpoint')
                ])
            }
        }).dependsOn(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID);
    };
    ResourceFactory.prototype.getLayerMapping = function () {
        return {
            "LayerResourceMapping": {
                "ap-northeast-1": {
                    "layerRegion": "arn:aws:lambda:ap-northeast-1:249908578461:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "us-east-1": {
                    "layerRegion": "arn:aws:lambda:us-east-1:668099181075:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "ap-southeast-1": {
                    "layerRegion": "arn:aws:lambda:ap-southeast-1:468957933125:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "eu-west-1": {
                    "layerRegion": "arn:aws:lambda:eu-west-1:399891621064:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "us-west-1": {
                    "layerRegion": "arn:aws:lambda:us-west-1:325793726646:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "ap-east-1": {
                    "layerRegion": "arn:aws:lambda:ap-east-1:118857876118:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "ap-northeast-2": {
                    "layerRegion": "arn:aws:lambda:ap-northeast-2:296580773974:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "ap-northeast-3": {
                    "layerRegion": "arn:aws:lambda:ap-northeast-3:961244031340:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "ap-south-1": {
                    "layerRegion": "arn:aws:lambda:ap-south-1:631267018583:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "ap-southeast-2": {
                    "layerRegion": "arn:aws:lambda:ap-southeast-2:817496625479:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "ca-central-1": {
                    "layerRegion": "arn:aws:lambda:ca-central-1:778625758767:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "eu-central-1": {
                    "layerRegion": "arn:aws:lambda:eu-central-1:292169987271:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "eu-north-1": {
                    "layerRegion": "arn:aws:lambda:eu-north-1:642425348156:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "eu-west-2": {
                    "layerRegion": "arn:aws:lambda:eu-west-2:142628438157:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "eu-west-3": {
                    "layerRegion": "arn:aws:lambda:eu-west-3:959311844005:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "sa-east-1": {
                    "layerRegion": "arn:aws:lambda:sa-east-1:640010853179:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "us-east-2": {
                    "layerRegion": "arn:aws:lambda:us-east-2:259788987135:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "us-west-2": {
                    "layerRegion": "arn:aws:lambda:us-west-2:420165488524:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "cn-north-1": {
                    "layerRegion": "arn:aws-cn:lambda:cn-north-1:683298794825:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "cn-northwest-1": {
                    "layerRegion": "arn:aws-cn:lambda:cn-northwest-1:382066503313:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "us-gov-west-1": {
                    "layerRegion": "arn:aws-us-gov:lambda:us-gov-west-1:556739011827:layer:AWSLambda-Python-AWS-SDK:1"
                },
                "us-gov-east-1": {
                    "layerRegion": "arn:aws-us-gov:lambda:us-gov-east-1:138526772879:layer:AWSLambda-Python-AWS-SDK:1"
                }
            }
        };
    };
    /**
     * Deploy a lambda function that will stream data from our DynamoDB table
     * to our elasticsearch index.
     */
    ResourceFactory.prototype.makeDynamoDBStreamingFunction = function () {
        return new cloudform_types_1.Lambda.Function({
            Code: {
                S3Bucket: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                S3Key: cloudform_types_1.Fn.Join('/', [
                    cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                    "functions",
                    cloudform_types_1.Fn.Join('.', [
                        graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchStreamingLambdaFunctionLogicalID,
                        "zip"
                    ]),
                ])
            },
            FunctionName: this.joinWithEnv("-", [
                cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingFunctionName),
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            ]),
            Handler: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingLambdaHandlerName),
            Role: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchStreamingLambdaIAMRoleLogicalID, 'Arn'),
            Runtime: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingLambdaRuntime),
            Layers: [cloudform_types_1.Fn.FindInMap('LayerResourceMapping', cloudform_types_1.Fn.Ref("AWS::Region"), "layerRegion")],
            Environment: {
                Variables: {
                    ES_ENDPOINT: cloudform_types_1.Fn.Join('', [
                        'https://',
                        cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID, 'DomainEndpoint')
                    ]),
                    ES_REGION: cloudform_types_1.Fn.Select(3, cloudform_types_1.Fn.Split(':', cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID, 'DomainArn'))),
                    DEBUG: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchDebugStreamingLambda)
                }
            }
        }).dependsOn([
            graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchStreamingLambdaIAMRoleLogicalID,
            graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID
        ]);
    };
    ResourceFactory.prototype.makeDynamoDBStreamEventSourceMapping = function (typeName) {
        return new cloudform_types_1.Lambda.EventSourceMapping({
            BatchSize: 1,
            Enabled: true,
            EventSourceArn: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableResourceID(typeName), 'StreamArn'),
            FunctionName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchStreamingLambdaFunctionLogicalID, 'Arn'),
            StartingPosition: 'LATEST'
        }).dependsOn([
            graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchStreamingLambdaFunctionLogicalID
        ]);
    };
    ResourceFactory.prototype.joinWithEnv = function (separator, listToJoin) {
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join(separator, __spreadArrays(listToJoin, [
            cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env)
        ])), cloudform_types_1.Fn.Join(separator, listToJoin));
    };
    /**
     * Create a single role that has access to all the resources created by the
     * transform.
     * @param name  The name of the IAM role to create.
     */
    ResourceFactory.prototype.makeElasticsearchAccessIAMRole = function () {
        return new iam_1.default.Role({
            RoleName: this.joinWithEnv("-", [
                cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchAccessIAMRoleName),
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId')
            ]),
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
                new iam_1.default.Role.Policy({
                    PolicyName: 'ElasticsearchAccess',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Action: [
                                    "es:ESHttpPost",
                                    "es:ESHttpDelete",
                                    "es:ESHttpHead",
                                    "es:ESHttpGet",
                                    "es:ESHttpPost",
                                    "es:ESHttpPut"
                                ],
                                Effect: "Allow",
                                Resource: cloudform_types_1.Fn.Join('', [
                                    this.domainArn(),
                                    "/*"
                                ])
                            }
                        ]
                    }
                })
            ]
        });
    };
    /**
     * Create a single role that has access to all the resources created by the
     * transform.
     * @param name  The name of the IAM role to create.
     */
    ResourceFactory.prototype.makeStreamingLambdaIAMRole = function () {
        return new iam_1.default.Role({
            RoleName: this.joinWithEnv("-", [
                cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchStreamingIAMRoleName),
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            ]),
            AssumeRolePolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: {
                            Service: "lambda.amazonaws.com"
                        },
                        Action: "sts:AssumeRole"
                    }
                ]
            },
            Policies: [
                new iam_1.default.Role.Policy({
                    PolicyName: 'ElasticsearchAccess',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Action: [
                                    "es:ESHttpPost",
                                    "es:ESHttpDelete",
                                    "es:ESHttpHead",
                                    "es:ESHttpGet",
                                    "es:ESHttpPost",
                                    "es:ESHttpPut"
                                ],
                                Effect: "Allow",
                                Resource: cloudform_types_1.Fn.Join('', [
                                    this.domainArn(),
                                    "/*"
                                ])
                            }
                        ]
                    }
                }),
                new iam_1.default.Role.Policy({
                    PolicyName: 'DynamoDBStreamAccess',
                    PolicyDocument: {
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Action: [
                                    "dynamodb:DescribeStream",
                                    "dynamodb:GetRecords",
                                    "dynamodb:GetShardIterator",
                                    "dynamodb:ListStreams"
                                ],
                                Effect: "Allow",
                                Resource: [
                                    "*"
                                    // TODO: Scope this to each table individually.
                                    // Fn.Join(
                                    //     '/',
                                    //     [Fn.GetAtt(ResourceConstants.RESOURCES.DynamoDBModelTableLogicalID, 'Arn'), '*']
                                    // )
                                ]
                            }
                        ]
                    }
                }),
                new iam_1.default.Role.Policy({
                    PolicyName: 'CloudWatchLogsAccess',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: "Allow",
                                Action: [
                                    "logs:CreateLogGroup",
                                    "logs:CreateLogStream",
                                    "logs:PutLogEvents"
                                ],
                                Resource: "arn:aws:logs:*:*:*"
                            }
                        ]
                    }
                })
            ]
        });
        // .dependsOn(ResourceConstants.RESOURCES.DynamoDBModelTableLogicalID)
    };
    /**
     * If there is an env, allow ES to create the domain name so we don't go
     * over 28 characters. If there is no env, fallback to original behavior.
     */
    ResourceFactory.prototype.domainName = function () {
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Refs.NoValue, cloudform_types_1.Fn.Join('-', [
            'd',
            cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId')
        ]));
    };
    ResourceFactory.prototype.domainArn = function () {
        return cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID, "DomainArn");
    };
    /**
     * Create the elasticsearch domain.
     */
    ResourceFactory.prototype.makeElasticsearchDomain = function () {
        return new cloudform_types_1.Elasticsearch.Domain({
            DomainName: this.domainName(),
            ElasticsearchVersion: '6.2',
            ElasticsearchClusterConfig: {
                ZoneAwarenessEnabled: false,
                InstanceCount: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchInstanceCount),
                InstanceType: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchInstanceType)
            },
            EBSOptions: {
                EBSEnabled: true,
                VolumeType: 'gp2',
                VolumeSize: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.ElasticsearchEBSVolumeGB)
            }
        });
    };
    /**
     * Create the Elasticsearch search resolver.
     */
    ResourceFactory.prototype.makeSearchResolver = function (type, nonKeywordFields, primaryKey, queryTypeName, nameOverride) {
        var fieldName = nameOverride ? nameOverride : graphql_transformer_common_1.graphqlName('search' + graphql_transformer_common_1.plurality(graphql_transformer_common_1.toUpper(type)));
        return new appSync_1.default.Resolver({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDataSourceLogicalID, 'Name'),
            FieldName: fieldName,
            TypeName: queryTypeName,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('indexPath'), graphql_mapping_template_1.str("/" + type.toLowerCase() + "/doc/_search")),
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('nonKeywordFields'), graphql_mapping_template_1.list(nonKeywordFields)),
                graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('util.isNullOrEmpty($context.args.sort)'), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('sortDirection'), graphql_mapping_template_1.str('desc')),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('sortField'), graphql_mapping_template_1.str(primaryKey))
                ]), graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('sortDirection'), graphql_mapping_template_1.raw('$util.defaultIfNull($context.args.sort.direction, "desc")')),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('sortField'), graphql_mapping_template_1.raw("$util.defaultIfNull($context.args.sort.field, \"" + primaryKey + "\")"))
                ])),
                graphql_mapping_template_1.ElasticsearchMappingTemplate.searchItem({
                    path: graphql_mapping_template_1.str('$indexPath'),
                    size: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.limit'), graphql_mapping_template_1.ref('context.args.limit'), graphql_mapping_template_1.int(10), true),
                    search_after: graphql_mapping_template_1.list([graphql_mapping_template_1.str('$context.args.nextToken')]),
                    query: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.filter'), graphql_mapping_template_1.ref('util.transform.toElasticsearchQueryDSL($ctx.args.filter)'), graphql_mapping_template_1.obj({
                        'match_all': graphql_mapping_template_1.obj({})
                    })),
                    sort: graphql_mapping_template_1.list([
                        graphql_mapping_template_1.raw('{ #if($nonKeywordFields.contains($sortField))\
 "$sortField" #else "${sortField}.keyword" #end : {\
 "order" : "$sortDirection"\
} }')
                    ]),
                })
            ])),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('items'), graphql_mapping_template_1.list([])),
                graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('entry'), graphql_mapping_template_1.ref('context.result.hits.hits'), [
                    graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('!$foreach.hasNext'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('nextToken'), graphql_mapping_template_1.ref('entry.sort.get(0)'))),
                    graphql_mapping_template_1.qref('$items.add($entry.get("_source"))')
                ]),
                graphql_mapping_template_1.toJson(graphql_mapping_template_1.obj({
                    "items": graphql_mapping_template_1.ref('items'),
                    "total": graphql_mapping_template_1.ref('ctx.result.hits.total'),
                    "nextToken": graphql_mapping_template_1.ref('nextToken')
                }))
            ]))
        }).dependsOn([
            graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDataSourceLogicalID
        ]);
    };
    /**
     * OUTPUTS
     */
    /**
     * Create output to export the Elasticsearch DomainArn
     * @returns Output
     */
    ResourceFactory.prototype.makeDomainArnOutput = function () {
        return {
            Description: "Elasticsearch instance Domain ARN.",
            Value: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID, 'DomainArn'),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId), "GetAtt", "Elasticsearch", "DomainArn"])
            }
        };
    };
    /**
     * Create output to export the Elasticsearch DomainEndpoint
     * @returns Output
     */
    ResourceFactory.prototype.makeDomainEndpointOutput = function () {
        return {
            Description: "Elasticsearch instance Domain Endpoint.",
            Value: cloudform_types_1.Fn.Join('', ['https://', cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.ElasticsearchDomainLogicalID, 'DomainEndpoint')]),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId), "GetAtt", "Elasticsearch", "DomainEndpoint"])
            }
        };
    };
    return ResourceFactory;
}());
exports.ResourceFactory = ResourceFactory;
//# sourceMappingURL=resources.js.map