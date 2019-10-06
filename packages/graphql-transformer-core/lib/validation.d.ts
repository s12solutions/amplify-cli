import { DocumentNode } from 'graphql/language';
import { ASTDefinitionBuilder } from 'graphql/utilities/buildASTSchema';
import { SingleFieldSubscriptions } from 'graphql/validation/rules/SingleFieldSubscriptions';
/**
 * This set includes all validation rules defined by the GraphQL spec.
 *
 * The order of the rules in this list has been adjusted to lead to the
 * most clear output when encountering multiple validation errors.
 */
export declare const specifiedRules: (typeof SingleFieldSubscriptions)[];
export declare function astBuilder(doc: DocumentNode): ASTDefinitionBuilder;
export declare function validateModelSchema(doc: DocumentNode): readonly import("graphql").GraphQLError[];
