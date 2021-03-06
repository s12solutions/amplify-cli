import { SyncConfigLAMBDA, SyncConfigOPTIMISTIC, SyncConfigSERVER } from './transformConfig';
declare type SyncConfig = {
    ConflictDetection: string;
    ConflictHandler: string;
    LambdaConflictHandlerArn?: any;
};
declare type DeltaSyncConfig = {
    DeltaSyncTableName: any;
    DeltaSyncTableTTL: number;
    BaseTableTTL: number;
};
export declare module SyncUtils {
    function createSyncTable(): import("cloudform-types/types/dynamoDb/table").default;
    function createSyncIAMRole(): import("cloudform-types/types/iam/role").default;
    function syncLambdaArnResource({ name, region }: {
        name: string;
        region?: string;
    }): import("cloudform-types").ConditionIntrinsicFunction;
    function lambdaArnKey(name: string, region?: string): string;
    function syncLambdaIAMRole({ name, region }: {
        name: string;
        region?: string;
    }): import("cloudform-types/types/iam/role").default;
    function createSyncLambdaIAMPolicy({ name, region }: {
        name: string;
        region?: string;
    }): import("cloudform-types/types/iam/role").Policy;
    function syncTTLConfig(): {
        AttributeName: string;
        Enabled: boolean;
    };
    function syncDataSourceConfig(): DeltaSyncConfig;
    function syncResolverConfig(syncConfig: SyncConfigOPTIMISTIC | SyncConfigLAMBDA | SyncConfigSERVER): SyncConfig;
    function isLambdaSyncConfig(obj: any): obj is SyncConfigLAMBDA;
}
export {};
