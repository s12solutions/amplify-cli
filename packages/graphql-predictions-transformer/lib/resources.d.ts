import { HttpConfig, LambdaConfig } from 'cloudform-types/types/appSync/dataSource';
import DataSource from 'cloudform-types/types/appSync/dataSource';
import { Policy } from 'cloudform-types/types/iam/group';
export interface PredictionsDSConfig {
    id: 'RekognitionDataSource' | 'TranslateDataSource' | 'LambdaDataSource';
    httpConfig?: HttpConfig;
    lambdaConfig?: LambdaConfig;
}
export declare type ActionPolicyMap = {
    [action: string]: Policy;
};
export declare class ResourceFactory {
    createIAMRole(map: ActionPolicyMap, bucketName: string): import("cloudform-types/types/iam/role").default;
    private getStorageARN;
    private addStorageInStash;
    private s3ArnKey;
    mergeActionRole(map: ActionPolicyMap, action: string): ActionPolicyMap;
    mergeLambdaActionRole(map: ActionPolicyMap): ActionPolicyMap;
    createLambdaIAMRole(bucketName: string): import("cloudform-types/types/iam/role").default;
    createPredictionsDataSource(config: PredictionsDSConfig): DataSource;
    getPredictionsDSConfig(action: string): PredictionsDSConfig;
    private joinWithEnv;
    createResolver(type: string, field: string, pipelineFunctions: any[], bucketName: string): import("cloudform-types/types/appSync/resolver").default;
    createActionFunction(action: string, datasourceName: string): import("cloudform-types/types/appSync/functionConfiguration").default;
    private genericFunction;
    createPredictionsLambda(): import("cloudform-types/types/lambda/function").default;
    referencesEnv(value: string): boolean;
    removeEnvReference(value: string): string;
}
