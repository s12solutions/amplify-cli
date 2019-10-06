import { DeploymentResources } from './DeploymentResources';
import ITransformer from './ITransformer';
/**
 * A generic transformation library that takes as input a graphql schema
 * written in SDL and a set of transformers that operate on it. At the
 * end of a transformation, a fully specified cloudformation template
 * is emitted.
 */
export interface GraphQLTransformOptions {
    transformers: ITransformer[];
    stackMapping?: StackMapping;
}
export declare type StackMapping = {
    [resourceId: string]: string;
};
export default class GraphQLTransform {
    private transformers;
    private stackMappingOverrides;
    private seenTransformations;
    constructor(options: GraphQLTransformOptions);
    /**
     * Reduces the final context by running the set of transformers on
     * the schema. Each transformer returns a new context that is passed
     * on to the next transformer. At the end of the transformation a
     * cloudformation template is returned.
     * @param schema The model schema.
     * @param references Any cloudformation references.
     */
    transform(schema: string): DeploymentResources;
    private updateContextForStackMappingOverrides;
    private transformObject;
    private transformField;
    private transformArgument;
    private transformInterface;
    private transformScalar;
    private transformUnion;
    private transformEnum;
    private transformEnumValue;
    private transformInputObject;
    private transformInputField;
}
