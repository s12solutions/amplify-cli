"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Resource Constants that are specific to the Relation Database Transform
 */
class ResourceConstants {
}
exports.ResourceConstants = ResourceConstants;
ResourceConstants.ENVIRONMENT_CONTEXT_KEYS = {
    // Aurora Serverless Imports
    RDSRegion: 'rdsRegion',
    RDSClusterIdentifier: 'rdsClusterIdentifier',
    RDSSecretStoreArn: 'rdsSecretStoreArn',
    RDSDatabaseName: 'rdsDatabaseName',
};
ResourceConstants.RESOURCES = {
    // AppSync
    GraphQLAPILogicalID: 'GraphQLAPI',
    GraphQLSchemaLogicalID: 'GraphQLSchema',
    APIKeyLogicalID: 'GraphQLAPIKey',
    // Relational Database
    ResolverFileName: 'ResolverFileName',
    RelationalDatabaseDataSource: 'RelationalDatabaseDataSource',
    RelationalDatabaseAccessRole: 'RelationalDatabaseAccessRole',
};
ResourceConstants.PARAMETERS = {
    // cli
    Env: 'env',
    S3DeploymentBucket: 'S3DeploymentBucket',
    S3DeploymentRootKey: 'S3DeploymentRootKey',
    // AppSync
    AppSyncApiName: 'AppSyncApiName',
    AppSyncApiId: 'AppSyncApiId',
    APIKeyExpirationEpoch: 'APIKeyExpirationEpoch',
    // Aurora Serverless
    rdsRegion: 'rdsRegion',
    rdsClusterIdentifier: 'rdsClusterIdentifier',
    rdsSecretStoreArn: 'rdsSecretStoreArn',
    rdsDatabaseName: 'rdsDatabaseName'
};
//# sourceMappingURL=ResourceConstants.js.map