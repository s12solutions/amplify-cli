import { ModelQuery, ModelMutation } from './AuthRule';
import { DirectiveNode, ObjectTypeDefinitionNode } from 'graphql';
export interface QueryNameMap {
    get?: string;
    list?: string;
    query?: string;
}
export interface MutationNameMap {
    create?: string;
    update?: string;
    delete?: string;
}
export declare type ModelSubscriptionLevel = 'off' | 'public' | 'on';
export interface SubscriptionNameMap {
    onCreate?: string[];
    onUpdate?: string[];
    onDelete?: string[];
    level?: ModelSubscriptionLevel;
}
export interface ModelDirectiveArgs {
    queries?: QueryNameMap;
    mutations?: MutationNameMap;
    subscriptions?: SubscriptionNameMap;
}
export declare type ModelDirectiveOperationType = ModelQuery | ModelMutation | 'onCreate' | 'onUpdate' | 'onDelete' | 'level';
declare type ModelDirectiveOperation = {
    shouldHave: boolean;
    name?: string;
    names?: string[];
};
export declare class ModelDirectiveConfiguration {
    map: Map<ModelDirectiveOperationType, ModelDirectiveOperation>;
    constructor(directive: DirectiveNode, def: ObjectTypeDefinitionNode);
    shouldHave(op: ModelDirectiveOperationType): boolean;
    getName(op: ModelDirectiveOperationType): string | undefined;
    getNames(op: ModelDirectiveOperationType): string[] | undefined;
}
export {};
