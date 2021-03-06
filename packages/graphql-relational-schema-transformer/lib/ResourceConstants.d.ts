/**
 * Resource Constants that are specific to the Relation Database Transform
 */
export declare class ResourceConstants {
    static readonly ENVIRONMENT_CONTEXT_KEYS: {
        RDSRegion: string;
        RDSClusterIdentifier: string;
        RDSSecretStoreArn: string;
        RDSDatabaseName: string;
    };
    static readonly RESOURCES: {
        GraphQLAPILogicalID: string;
        GraphQLSchemaLogicalID: string;
        APIKeyLogicalID: string;
        ResolverFileName: string;
        RelationalDatabaseDataSource: string;
        RelationalDatabaseAccessRole: string;
    };
    static PARAMETERS: {
        Env: string;
        S3DeploymentBucket: string;
        S3DeploymentRootKey: string;
        AppSyncApiName: string;
        AppSyncApiId: string;
        APIKeyExpirationEpoch: string;
        rdsRegion: string;
        rdsClusterIdentifier: string;
        rdsSecretStoreArn: string;
        rdsDatabaseName: string;
    };
}
