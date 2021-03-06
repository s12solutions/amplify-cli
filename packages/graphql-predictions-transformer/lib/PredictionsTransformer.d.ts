import { ObjectTypeDefinitionNode, FieldDefinitionNode, DirectiveNode } from 'graphql';
import { Transformer, TransformerContext } from 'graphql-transformer-core';
import { ResourceFactory } from './resources';
export declare type PredictionsConfig = {
    bucketName: string;
};
export declare class PredictionsTransformer extends Transformer {
    resources: ResourceFactory;
    predictionsConfig: PredictionsConfig;
    constructor(predictionsConfig?: PredictionsConfig);
    field: (parent: ObjectTypeDefinitionNode, definition: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => void;
    private validateActions;
    private createResources;
    private getActions;
    private needsList;
    private typeExist;
}
