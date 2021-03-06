import { CloudFormationProcessedResourceResult } from '../stack/types';
import { CloudFormationParseContext } from '../types';
export declare function dynamoDBResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): any;
export declare type AppSyncDataSourceProcessedResource = CloudFormationProcessedResourceResult & {
    name: string;
    type: 'AMAZON_DYNAMODB' | 'AWS_LAMBDA' | 'NONE';
    LambdaFunctionArn?: string;
    config?: {
        tableName: string;
    };
};
export declare function appSyncDataSourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): AppSyncDataSourceProcessedResource;
export declare type AppSyncAPIProcessedResource = CloudFormationProcessedResourceResult & {
    name: string;
    Ref: string;
    Arn: string;
    defaultAuthenticationType: any;
    ApiId: string;
    GraphQLUrl: string;
    additionalAuthenticationProviders: any;
};
export declare function appSyncAPIResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): AppSyncAPIProcessedResource;
export declare type AppSyncAPIKeyProcessedResource = CloudFormationProcessedResourceResult & {
    ApiKey: string;
    Ref: string;
};
export declare function appSyncAPIKeyResourceHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): AppSyncAPIKeyProcessedResource;
export declare type AppSyncSchemaProcessedResource = CloudFormationProcessedResourceResult & {
    definitionS3Location?: string;
    definition?: string;
};
export declare function appSyncSchemaHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): AppSyncSchemaProcessedResource;
export declare type AppSyncResolverProcessedResource = CloudFormationProcessedResourceResult & {
    dataSourceName?: string;
    functions: string[];
    typeName: string;
    fieldName: string;
    requestMappingTemplateLocation: string;
    responseMappingTemplateLocation: string;
    ResolverArn: string;
    kind: 'UNIT' | 'PIPELINE';
};
export declare function appSyncResolverHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): AppSyncResolverProcessedResource;
export declare type AppSyncFunctionProcessedResource = CloudFormationProcessedResourceResult & {
    dataSourceName: string;
    ref: string;
    name: string;
    requestMappingTemplateLocation: string;
    responseMappingTemplateLocation: string;
};
export declare function appSyncFunctionHandler(resourceName: any, resource: any, cfnContext: CloudFormationParseContext): AppSyncFunctionProcessedResource;
