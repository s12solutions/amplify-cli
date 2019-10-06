"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const field_parser_1 = require("./field-parser");
const CFN_DEFAULT_PARAMS = {
    'AWS::Region': 'us-east-1-fake',
    'AWS::AccountId': '12345678910',
    'AWS::StackId': 'fake-stackId',
    'AWS::StackName': 'local-testing',
};
const CFN_DEFAULT_CONDITIONS = {
    HasEnvironmentParameter: true,
};
const resourceProcessorMapping = {
    'AWS::AppSync::GraphQLApi': graphQLAPIResourceHandler,
    'AWS::AppSync::ApiKey': graphQLAPIKeyResourceHandler,
    'AWS::AppSync::GraphQLSchema': graphQLSchemaHandler,
    'AWS::DynamoDB::Table': dynamoDBResourceHandler,
    'AWS::AppSync::Resolver': graphQLResolverHandler,
    'AWS::AppSync::DataSource': graphQLDataSource,
    'AWS::AppSync::FunctionConfiguration': graphqlFunctionHandler,
};
function dynamoDBResourceHandler(resourceName, resource, cfnContext, transformResult) {
    const tableName = resourceName;
    const gsis = (resource.Properties.GlobalSecondaryIndexes || []).map(gsi => {
        const p = Object.assign({}, gsi);
        delete p.ProvisionedThroughput;
        return p;
    });
    const processedResource = {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
            TableName: tableName,
            BillingMode: 'PAY_PER_REQUEST',
            KeySchema: resource.Properties.KeySchema,
            AttributeDefinitions: resource.Properties.AttributeDefinitions,
        },
    };
    if (gsis.length) {
        processedResource.Properties.GlobalSecondaryIndexes = gsis;
    }
    return processedResource;
}
exports.dynamoDBResourceHandler = dynamoDBResourceHandler;
function graphQLDataSource(resourceName, resource, cfnContext, transformResult) {
    const tableName = resource.Properties.Name;
    const typeName = resource.Properties.Type;
    if (typeName === 'AMAZON_DYNAMODB') {
        return {
            name: tableName,
            type: 'AMAZON_DYNAMODB',
            config: {
                tableName,
            },
        };
    }
    if (typeName === 'NONE') {
        return {
            name: resource.Properties.Name,
            type: 'NONE',
        };
    }
    if (typeName === 'AWS_LAMBDA') {
        const lambdaArn = field_parser_1.parseValue(resource.Properties.LambdaConfig.LambdaFunctionArn, cfnContext);
        return {
            type: 'AWS_LAMBDA',
            name: resource.Properties.Name,
            LambdaFunctionArn: lambdaArn,
        };
    }
    // XXX: Handle un-supported data sources
    console.log(`Data source of type ${typeName} is not supported by local mocking. A NONE data source will be used.`);
    return {
        name: resourceName,
        type: 'NONE',
    };
}
exports.graphQLDataSource = graphQLDataSource;
function graphQLAPIResourceHandler(resourceName, resource, cfnContext, transformResult) {
    const apiId = 'amplify-test-api-id';
    const processedResource = Object.assign({ type: resource.Type, name: cfnContext.params.AppSyncApiName || 'AppSyncTransformer', defaultAuthenticationType: Object.assign(Object.assign({ authenticationType: resource.Properties.AuthenticationType }, (resource.Properties.OpenIDConnectConfig ? { openIDConnectConfig: resource.Properties.OpenIDConnectConfig } : {})), (resource.Properties.UserPoolConfig ? { cognitoUserPoolConfig: resource.Properties.UserPoolConfig } : {})), 
        // authenticationType: parseValue(resource.Properties.AuthenticationType, cfnContext,  transformResult: any),
        ref: `arn:aws:appsync:us-east-1:123456789012:apis/${apiId}` }, (resource.Properties.AdditionalAuthenticationProviders
        ? {
            additionalAuthenticationProviders: resource.Properties.AdditionalAuthenticationProviders.map(p => {
                return Object.assign(Object.assign({ authenticationType: p.AuthenticationType }, (p.OpenIDConnectConfig ? { openIDConnectConfig: p.OpenIDConnectConfig } : {})), (p.CognitoUserPoolConfig ? { cognitoUserPoolConfig: p.CognitoUserPoolConfig } : {}));
            }),
        }
        : {}));
    return processedResource;
}
exports.graphQLAPIResourceHandler = graphQLAPIResourceHandler;
function graphQLAPIKeyResourceHandler(resourceName, resource, cfnContext, transformResult) {
    const value = 'da2-fakeApiId123456'; // TODO: Generate
    const processedResource = {
        type: resource.Type,
        // apiId: parseValue(resource.Properties.ApiId, cfnContext),
        value,
        ref: `arn:aws:appsync:us-east-1:123456789012:apis/graphqlapiid/apikey/apikeya1bzhi${value}`,
    };
    return processedResource;
}
exports.graphQLAPIKeyResourceHandler = graphQLAPIKeyResourceHandler;
function graphQLSchemaHandler(resourceName, resource, cfnContext, transformResult) {
    return {
        content: transformResult.schema,
        path: 'schema.json',
    };
}
exports.graphQLSchemaHandler = graphQLSchemaHandler;
function graphQLResolverHandler(resourceName, resource, cfnContext, transformResult) {
    const { Properties: properties } = resource;
    const requestMappingTemplate = field_parser_1.parseValue(properties.RequestMappingTemplateS3Location, cfnContext).replace('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/', '');
    const responseMappingTemplate = field_parser_1.parseValue(properties.ResponseMappingTemplateS3Location, cfnContext).replace('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/', '');
    let dataSourceName;
    let functions;
    if (properties.Kind === 'PIPELINE') {
        functions = (properties.PipelineConfig.Functions || []).map(f => getAppSyncFunctionName(f));
    }
    else {
        dataSourceName = getDataSourceName(properties.DataSourceName, cfnContext.resources);
    }
    return {
        dataSourceName,
        typeName: properties.TypeName,
        functions,
        fieldName: properties.FieldName,
        requestMappingTemplateLocation: requestMappingTemplate,
        responseMappingTemplateLocation: responseMappingTemplate,
        kind: properties.Kind || 'UNIT',
    };
}
exports.graphQLResolverHandler = graphQLResolverHandler;
function getDataSourceName(dataSourceName, resources) {
    // XXX: Util to map data source based on type of intrinsic function
    let processedDataSourceName;
    if (typeof dataSourceName === 'string') {
        return dataSourceName;
    }
    if (lodash_1.isPlainObject(dataSourceName) && Object.keys(dataSourceName).length === 1) {
        const intrinsicFn = Object.keys(dataSourceName)[0];
        if (intrinsicFn === 'Fn::GetAtt') {
            processedDataSourceName = dataSourceName[intrinsicFn][0];
        }
    }
    else if (dataSourceName.name === 'Fn::ImportValue') {
        processedDataSourceName = dataSourceName.payload.payload[1][2];
    }
    return resources[processedDataSourceName].name;
}
function getAppSyncFunctionName(functionConfig) {
    if (functionConfig['Fn::GetAtt']) {
        return functionConfig['Fn::GetAtt'][0];
    }
    return functionConfig;
}
function graphqlFunctionHandler(resourceName, resource, cfnContext, transformResult) {
    const { Properties: properties } = resource;
    const requestMappingTemplate = field_parser_1.parseValue(properties.RequestMappingTemplateS3Location, cfnContext).replace('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/', '');
    const responseMappingTemplate = field_parser_1.parseValue(properties.ResponseMappingTemplateS3Location, cfnContext).replace('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/', '');
    const dataSourceName = getDataSourceName(properties.DataSourceName, cfnContext.resources);
    return {
        name: resource.Properties.Name,
        dataSourceName,
        requestMappingTemplateLocation: requestMappingTemplate,
        responseMappingTemplateLocation: responseMappingTemplate,
    };
}
exports.graphqlFunctionHandler = graphqlFunctionHandler;
function processResources(resources, transformResult, params = {}) {
    const cfnContext = {
        conditions: Object.assign({}, CFN_DEFAULT_CONDITIONS),
        params: Object.assign(Object.assign(Object.assign({}, CFN_DEFAULT_PARAMS), { env: '${env}', S3DeploymentBucket: '${S3DeploymentBucket}', S3DeploymentRootKey: '${S3DeploymentRootKey}' }), params),
        resources: {},
        exports: {},
    };
    const processedResources = {
        schema: {},
        resolvers: [],
        functions: [],
        dataSources: [],
        mappingTemplates: [],
        tables: [],
        appSync: {
            name: '',
            defaultAuthenticationType: {},
            apiKey: null,
            additionalAuthenticationProviders: []
        },
    };
    Object.entries(resources).forEach(entry => {
        const [resourceName, resource] = entry;
        const { Type: resourceType } = resource;
        if (Object.keys(resourceProcessorMapping).includes(resourceType)) {
            const result = resourceProcessorMapping[resourceType](resourceName, resource, cfnContext, transformResult);
            cfnContext.resources[resourceName] = result;
            switch (resourceType) {
                case 'AWS::AppSync::DataSource':
                    processedResources.dataSources.push(result);
                    break;
                case 'AWS::AppSync::Resolver':
                    processedResources.resolvers.push(result);
                    break;
                case 'AWS::DynamoDB::Table':
                    processedResources.tables.push(result);
                    break;
                case 'AWS::AppSync::FunctionConfiguration':
                    processedResources.functions.push(result);
                    break;
                case 'AWS::AppSync::GraphQLSchema':
                    processedResources.schema = result;
                    break;
                case 'AWS::AppSync::GraphQLApi':
                    processedResources.appSync.name = result.name;
                    processedResources.appSync.defaultAuthenticationType = result.defaultAuthenticationType;
                    processedResources.appSync.additionalAuthenticationProviders = result.additionalAuthenticationProviders || [];
                    break;
                case 'AWS::AppSync::ApiKey':
                    processedResources.appSync.apiKey = result.value;
                    break;
            }
        }
    });
    Object.entries(transformResult.resolvers).forEach(([path, content]) => {
        processedResources.mappingTemplates.push({
            path: `resolvers/${path}`,
            content,
        });
    });
    Object.entries(transformResult.pipelineFunctions).forEach(([path, content]) => {
        processedResources.mappingTemplates.push({
            path: `pipelineFunctions/${path}`,
            content,
        });
    });
    return processedResources;
}
exports.processResources = processResources;
//# sourceMappingURL=appsync-resource-processor.js.map