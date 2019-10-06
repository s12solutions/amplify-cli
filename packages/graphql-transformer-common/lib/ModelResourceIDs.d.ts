export declare class ModelResourceIDs {
    static ModelTableResourceID(typeName: string): string;
    static ModelTableStreamArn(typeName: string): string;
    static ModelTableDataSourceID(typeName: string): string;
    static ModelTableIAMRoleID(typeName: string): string;
    static ModelFilterInputTypeName(name: string): string;
    static ModelKeyConditionInputTypeName(name: string): string;
    static ModelCompositeKeyArgumentName(keyFieldNames: string[]): string;
    static ModelCompositeKeySeparator(): string;
    static ModelCompositeAttributeName(keyFieldNames: string[]): string;
    static ModelCompositeKeyConditionInputTypeName(modelName: string, keyName: string): string;
    static ModelCompositeKeyInputTypeName(modelName: string, keyName: string): string;
    static ModelFilterListInputTypeName(name: string): string;
    static ModelScalarFilterInputTypeName(name: string): string;
    static ModelConnectionTypeName(typeName: string): string;
    static ModelDeleteInputObjectName(typeName: string): string;
    static ModelUpdateInputObjectName(typeName: string): string;
    static ModelCreateInputObjectName(typeName: string): string;
    static ModelOnCreateSubscriptionName(typeName: string): string;
    static ModelOnUpdateSubscriptionName(typeName: string): string;
    static ModelOnDeleteSubscriptionName(typeName: string): string;
    static NonModelInputObjectName(typeName: string): string;
    static UrlParamsInputObjectName(typeName: string, fieldName: string): string;
    static HttpQueryInputObjectName(typeName: string, fieldName: string): string;
    static HttpBodyInputObjectName(typeName: string, fieldName: string): string;
}
