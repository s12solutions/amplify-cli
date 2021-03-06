"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var predictions_utils_1 = require("./predictions_utils");
var cloudform_types_1 = require("cloudform-types");
var ResourceFactory = /** @class */ (function () {
    function ResourceFactory() {
    }
    ResourceFactory.prototype.createIAMRole = function (map, bucketName) {
        return new cloudform_types_1.IAM.Role({
            RoleName: this.joinWithEnv('-', [
                graphql_transformer_common_1.PredictionsResourceIDs.iamRole,
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            ]),
            AssumeRolePolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: {
                            Service: 'appsync.amazonaws.com',
                        },
                        Action: 'sts:AssumeRole',
                    },
                ],
            },
            Policies: __spreadArrays([
                new cloudform_types_1.IAM.Role.Policy({
                    PolicyName: 'PredictionsStorageAccess',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Action: ['s3:GetObject'],
                                Effect: 'Allow',
                                Resource: this.getStorageARN(bucketName),
                            },
                        ],
                    },
                })
            ], Object.values(map)),
        });
    };
    ResourceFactory.prototype.getStorageARN = function (name) {
        var substitutions = {
            hash: cloudform_types_1.Fn.Select(3, cloudform_types_1.Fn.Split('-', cloudform_types_1.Fn.Ref('AWS::StackName')))
        };
        if (this.referencesEnv(name)) {
            substitutions['env'] = cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env);
        }
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Sub(this.s3ArnKey(name), substitutions), cloudform_types_1.Fn.Sub(this.s3ArnKey(this.removeEnvReference(name)), { hash: cloudform_types_1.Fn.Select(3, cloudform_types_1.Fn.Split('-', cloudform_types_1.Fn.Ref('AWS::StackName'))) }));
    };
    ResourceFactory.prototype.addStorageInStash = function (storage) {
        var substitutions = {
            hash: cloudform_types_1.Fn.Select(3, cloudform_types_1.Fn.Split('-', cloudform_types_1.Fn.Ref('AWS::StackName')))
        };
        if (this.referencesEnv(storage)) {
            substitutions['env'] = cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env);
        }
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Sub("$util.qr($ctx.stash.put(\"s3Bucket\", \"" + storage + "\"))", substitutions), cloudform_types_1.Fn.Sub("$util.qr($ctx.stash.put(\"s3Bucket\", \"" + this.removeEnvReference(storage) + "\"))", { hash: cloudform_types_1.Fn.Select(3, cloudform_types_1.Fn.Split('-', cloudform_types_1.Fn.Ref('AWS::StackName'))) }));
    };
    ResourceFactory.prototype.s3ArnKey = function (name) {
        return "arn:aws:s3:::" + name + "/public/*";
    };
    ResourceFactory.prototype.mergeActionRole = function (map, action) {
        if (!map[action] && predictions_utils_1.iamActions[action]) {
            map[action] = new cloudform_types_1.IAM.Role.Policy({
                PolicyName: action + "Access",
                PolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: [predictions_utils_1.iamActions[action]],
                            Effect: 'Allow',
                            Resource: '*',
                        },
                    ],
                },
            });
        }
        return map;
    };
    ResourceFactory.prototype.mergeLambdaActionRole = function (map) {
        if (!map['PredictionsLambdaAccess']) {
            map['PredictionsLambdaAccess'] = new cloudform_types_1.IAM.Role.Policy({
                PolicyName: 'PredictionsLambdaAccess',
                PolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: ['lambda:InvokeFunction'],
                            Effect: 'Allow',
                            Resource: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.PredictionsResourceIDs.lambdaID, 'Arn'),
                        },
                    ],
                },
            });
        }
        return map;
    };
    ResourceFactory.prototype.createLambdaIAMRole = function (bucketName) {
        return new cloudform_types_1.IAM.Role({
            RoleName: this.joinWithEnv('-', [
                graphql_transformer_common_1.PredictionsResourceIDs.lambdaIAMRole,
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            ]),
            AssumeRolePolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: {
                            Service: 'lambda.amazonaws.com',
                        },
                        Action: 'sts:AssumeRole',
                    },
                ],
            },
            Policies: [
                new cloudform_types_1.IAM.Role.Policy({
                    PolicyName: 'PollyAccess',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Action: ['polly:SynthesizeSpeech'],
                                Effect: 'Allow',
                                Resource: '*',
                            },
                        ],
                    },
                }),
            ],
        });
    };
    ResourceFactory.prototype.createPredictionsDataSource = function (config) {
        var dataSource;
        if (config.httpConfig) {
            dataSource = new cloudform_types_1.AppSync.DataSource({
                ApiId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId),
                Name: config.id,
                Type: 'HTTP',
                ServiceRoleArn: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.PredictionsResourceIDs.iamRole, 'Arn'),
                HttpConfig: config.httpConfig,
            }).dependsOn(graphql_transformer_common_1.PredictionsResourceIDs.iamRole);
        }
        if (config.lambdaConfig) {
            dataSource = new cloudform_types_1.AppSync.DataSource({
                ApiId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId),
                Name: config.id,
                Type: 'AWS_LAMBDA',
                ServiceRoleArn: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.PredictionsResourceIDs.iamRole, 'Arn'),
                LambdaConfig: config.lambdaConfig,
            }).dependsOn([graphql_transformer_common_1.PredictionsResourceIDs.iamRole, graphql_transformer_common_1.PredictionsResourceIDs.lambdaID]);
        }
        return dataSource;
    };
    ResourceFactory.prototype.getPredictionsDSConfig = function (action) {
        switch (action) {
            case 'identifyEntities':
            case 'identifyText':
            case 'identifyLabels':
                return {
                    id: 'RekognitionDataSource',
                    httpConfig: {
                        Endpoint: cloudform_types_1.Fn.Sub('https://rekognition.${AWS::Region}.amazonaws.com', {}),
                        AuthorizationConfig: {
                            AuthorizationType: 'AWS_IAM',
                            AwsIamConfig: {
                                SigningRegion: cloudform_types_1.Fn.Sub('${AWS::Region}', {}),
                                SigningServiceName: 'rekognition',
                            },
                        },
                    },
                };
            case 'translateText':
                return {
                    id: 'TranslateDataSource',
                    httpConfig: {
                        Endpoint: cloudform_types_1.Fn.Sub('https://translate.${AWS::Region}.amazonaws.com', {}),
                        AuthorizationConfig: {
                            AuthorizationType: 'AWS_IAM',
                            AwsIamConfig: {
                                SigningRegion: cloudform_types_1.Fn.Sub('${AWS::Region}', {}),
                                SigningServiceName: 'translate',
                            },
                        },
                    },
                };
            case 'convertTextToSpeech':
                return {
                    id: 'LambdaDataSource',
                    lambdaConfig: {
                        LambdaFunctionArn: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.PredictionsResourceIDs.lambdaID, 'Arn'),
                    },
                };
            default:
                break;
        }
    };
    ResourceFactory.prototype.joinWithEnv = function (separator, listToJoin) {
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join(separator, __spreadArrays(listToJoin, [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env)])), cloudform_types_1.Fn.Join(separator, listToJoin));
    };
    ResourceFactory.prototype.createResolver = function (type, field, pipelineFunctions, bucketName) {
        return new cloudform_types_1.AppSync.Resolver({
            ApiId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId),
            TypeName: type,
            FieldName: field,
            Kind: 'PIPELINE',
            PipelineConfig: {
                Functions: pipelineFunctions,
            },
            RequestMappingTemplate: cloudform_types_1.Fn.Join('\n', [
                this.addStorageInStash(bucketName),
                graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([graphql_mapping_template_1.qref('$ctx.stash.put("isList", false)'), graphql_mapping_template_1.obj({})])),
            ]),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.comment('If the result is a list return the result as a list'),
                graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('ctx.stash.get("isList")'), graphql_mapping_template_1.compoundExpression([graphql_mapping_template_1.set(graphql_mapping_template_1.ref('result'), graphql_mapping_template_1.ref('ctx.result.split("[ ,]+")')), graphql_mapping_template_1.toJson(graphql_mapping_template_1.ref('result'))]), graphql_mapping_template_1.toJson(graphql_mapping_template_1.ref('ctx.result'))),
            ])),
        }).dependsOn(pipelineFunctions);
    };
    // predictions action functions
    ResourceFactory.prototype.createActionFunction = function (action, datasourceName) {
        var actionFunctionResolvers = {
            identifyText: {
                request: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('bucketName'), graphql_mapping_template_1.ref('ctx.stash.get("s3Bucket")')),
                    graphql_mapping_template_1.obj({
                        version: graphql_mapping_template_1.str('2018-05-29'),
                        method: graphql_mapping_template_1.str('POST'),
                        resourcePath: graphql_mapping_template_1.str('/'),
                        params: graphql_mapping_template_1.obj({
                            body: graphql_mapping_template_1.obj({
                                Image: graphql_mapping_template_1.obj({
                                    S3Object: graphql_mapping_template_1.obj({
                                        Bucket: graphql_mapping_template_1.str('$bucketName'),
                                        Name: graphql_mapping_template_1.str('public/$ctx.args.input.identifyText.key'),
                                    }),
                                }),
                            }),
                            headers: graphql_mapping_template_1.obj({
                                'Content-Type': graphql_mapping_template_1.str('application/x-amz-json-1.1'),
                                'X-Amz-Target': graphql_mapping_template_1.str('RekognitionService.DetectText'),
                            }),
                        }),
                    }),
                ]),
                response: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ctx.error'), graphql_mapping_template_1.ref('util.error($ctx.error.message)')),
                    graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200'), graphql_mapping_template_1.compoundExpression([
                        graphql_mapping_template_1.set(graphql_mapping_template_1.ref('results'), graphql_mapping_template_1.ref('util.parseJson($ctx.result.body)')),
                        graphql_mapping_template_1.set(graphql_mapping_template_1.ref('finalResult'), graphql_mapping_template_1.str('')),
                        graphql_mapping_template_1.forEach(/** for */ graphql_mapping_template_1.ref('item'), /** in */ graphql_mapping_template_1.ref('results.TextDetections'), [
                            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('$item.Type == "LINE"'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('finalResult'), graphql_mapping_template_1.str('$finalResult$item.DetectedText '))),
                        ]),
                        graphql_mapping_template_1.ref('util.toJson($finalResult.trim())'),
                    ]), graphql_mapping_template_1.ref('utils.error($ctx.result.body)')),
                ]),
            },
            identifyLabels: {
                request: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('bucketName'), graphql_mapping_template_1.ref('ctx.stash.get("s3Bucket")')),
                    graphql_mapping_template_1.qref('$ctx.stash.put("isList", true)'),
                    graphql_mapping_template_1.obj({
                        version: graphql_mapping_template_1.str('2018-05-29'),
                        method: graphql_mapping_template_1.str('POST'),
                        resourcePath: graphql_mapping_template_1.str('/'),
                        params: graphql_mapping_template_1.obj({
                            body: graphql_mapping_template_1.obj({
                                Image: graphql_mapping_template_1.obj({
                                    S3Object: graphql_mapping_template_1.obj({
                                        Bucket: graphql_mapping_template_1.str('$bucketName'),
                                        Name: graphql_mapping_template_1.str('public/$ctx.args.input.identifyLabels.key'),
                                    }),
                                }),
                                MaxLabels: graphql_mapping_template_1.int(10),
                                MinConfidence: graphql_mapping_template_1.int(55),
                            }),
                            headers: graphql_mapping_template_1.obj({
                                'Content-Type': graphql_mapping_template_1.str('application/x-amz-json-1.1'),
                                'X-Amz-Target': graphql_mapping_template_1.str('RekognitionService.DetectLabels'),
                            }),
                        }),
                    }),
                ]),
                response: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ctx.error'), graphql_mapping_template_1.ref('util.error($ctx.error.message)')),
                    graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200'), graphql_mapping_template_1.compoundExpression([
                        graphql_mapping_template_1.set(graphql_mapping_template_1.ref('labels'), graphql_mapping_template_1.str('')),
                        graphql_mapping_template_1.set(graphql_mapping_template_1.ref('result'), graphql_mapping_template_1.ref('util.parseJson($ctx.result.body)')),
                        graphql_mapping_template_1.forEach(/** for */ graphql_mapping_template_1.ref('label'), /** in */ graphql_mapping_template_1.ref('result.Labels'), [graphql_mapping_template_1.set(graphql_mapping_template_1.ref('labels'), graphql_mapping_template_1.str('$labels$label.Name, '))]),
                        graphql_mapping_template_1.toJson(graphql_mapping_template_1.ref('labels.replaceAll(", $", "")')),
                    ]), graphql_mapping_template_1.ref('util.error($ctx.result.body)')),
                ]),
            },
            translateText: {
                request: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('text'), graphql_mapping_template_1.ref('util.defaultIfNull($ctx.args.input.translateText.text, $ctx.prev.result)')),
                    graphql_mapping_template_1.obj({
                        version: graphql_mapping_template_1.str('2018-05-29'),
                        method: graphql_mapping_template_1.str('POST'),
                        resourcePath: graphql_mapping_template_1.str('/'),
                        params: graphql_mapping_template_1.obj({
                            body: graphql_mapping_template_1.obj({
                                SourceLanguageCode: graphql_mapping_template_1.str('$ctx.args.input.translateText.sourceLanguage'),
                                TargetLanguageCode: graphql_mapping_template_1.str('$ctx.args.input.translateText.targetLanguage'),
                                Text: graphql_mapping_template_1.str('$text'),
                            }),
                            headers: graphql_mapping_template_1.obj({
                                'Content-Type': graphql_mapping_template_1.str('application/x-amz-json-1.1'),
                                'X-Amz-Target': graphql_mapping_template_1.str('AWSShineFrontendService_20170701.TranslateText'),
                            }),
                        }),
                    }),
                ]),
                response: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ctx.error'), graphql_mapping_template_1.ref('util.error($ctx.error.message)')),
                    graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw('$ctx.result.statusCode == 200'), graphql_mapping_template_1.compoundExpression([graphql_mapping_template_1.set(graphql_mapping_template_1.ref('result'), graphql_mapping_template_1.ref('util.parseJson($ctx.result.body)')), graphql_mapping_template_1.ref('util.toJson($result.TranslatedText)')]), graphql_mapping_template_1.ref('util.error($ctx.result.body)')),
                ]),
            },
            convertTextToSpeech: {
                request: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('bucketName'), graphql_mapping_template_1.ref('ctx.stash.get("s3Bucket")')),
                    graphql_mapping_template_1.qref('$ctx.stash.put("isList", false)'),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('text'), graphql_mapping_template_1.ref('util.defaultIfNull($ctx.args.input.convertTextToSpeech.text, $ctx.prev.result)')),
                    graphql_mapping_template_1.obj({
                        version: graphql_mapping_template_1.str('2018-05-29'),
                        operation: graphql_mapping_template_1.str('Invoke'),
                        payload: graphql_mapping_template_1.toJson(graphql_mapping_template_1.obj({
                            uuid: graphql_mapping_template_1.str('$util.autoId()'),
                            action: graphql_mapping_template_1.str('convertTextToSpeech'),
                            voiceID: graphql_mapping_template_1.str('$ctx.args.input.convertTextToSpeech.voiceID'),
                            text: graphql_mapping_template_1.str('$text'),
                        })),
                    }),
                ]),
                response: graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('ctx.error'), graphql_mapping_template_1.ref('util.error($ctx.error.message, $ctx.error.type)')),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('response'), graphql_mapping_template_1.ref('util.parseJson($ctx.result)')),
                    graphql_mapping_template_1.ref('util.toJson($ctx.result.url)'),
                ]),
            },
        };
        return this.genericFunction(action, datasourceName, graphql_transformer_common_1.PredictionsResourceIDs.iamRole, actionFunctionResolvers[action]);
    };
    ResourceFactory.prototype.genericFunction = function (action, datasourceName, iamRole, resolver) {
        return new cloudform_types_1.AppSync.FunctionConfiguration({
            ApiId: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId),
            Name: action + "Function",
            DataSourceName: datasourceName,
            FunctionVersion: '2018-05-29',
            RequestMappingTemplate: graphql_mapping_template_1.print(resolver.request),
            ResponseMappingTemplate: graphql_mapping_template_1.print(resolver.response),
        }).dependsOn([iamRole, datasourceName]);
    };
    // Predictions Lambda Function
    ResourceFactory.prototype.createPredictionsLambda = function () {
        return new cloudform_types_1.Lambda.Function({
            Code: {
                S3Bucket: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                S3Key: cloudform_types_1.Fn.Join('/', [
                    cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                    'functions',
                    cloudform_types_1.Fn.Join('.', [graphql_transformer_common_1.PredictionsResourceIDs.lambdaID, 'zip']),
                ]),
            },
            FunctionName: this.joinWithEnv('-', [
                graphql_transformer_common_1.PredictionsResourceIDs.lambdaName,
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            ]),
            Handler: graphql_transformer_common_1.PredictionsResourceIDs.lambdaHandlerName,
            Role: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.PredictionsResourceIDs.lambdaIAMRole, 'Arn'),
            Runtime: graphql_transformer_common_1.PredictionsResourceIDs.lambdaRuntime,
            Timeout: graphql_transformer_common_1.PredictionsResourceIDs.lambdaTimeout,
        }).dependsOn([graphql_transformer_common_1.PredictionsResourceIDs.lambdaIAMRole]);
    };
    // storage env ref
    ResourceFactory.prototype.referencesEnv = function (value) {
        return value.match(/(\${env})/) !== null;
    };
    ResourceFactory.prototype.removeEnvReference = function (value) {
        return value.replace(/(-\${env})/, '');
    };
    return ResourceFactory;
}());
exports.ResourceFactory = ResourceFactory;
//# sourceMappingURL=resources.js.map