import { ObjectTypeDefinitionNode, InputObjectTypeDefinitionNode, FieldDefinitionNode, EnumTypeDefinitionNode, ObjectTypeExtensionNode, DirectiveNode, InterfaceTypeDefinitionNode } from 'graphql';
import { TransformerContext } from 'graphql-transformer-core';
export declare function getNonModelObjectArray(obj: ObjectTypeDefinitionNode, ctx: TransformerContext, pMap: Map<string, ObjectTypeDefinitionNode>): ObjectTypeDefinitionNode[];
export declare function makeNonModelInputObject(obj: ObjectTypeDefinitionNode, nonModelTypes: ObjectTypeDefinitionNode[], ctx: TransformerContext): InputObjectTypeDefinitionNode;
export declare function makeCreateInputObject(obj: ObjectTypeDefinitionNode, nonModelTypes: ObjectTypeDefinitionNode[], ctx: TransformerContext, isSync?: boolean): InputObjectTypeDefinitionNode;
export declare function makeUpdateInputObject(obj: ObjectTypeDefinitionNode, nonModelTypes: ObjectTypeDefinitionNode[], ctx: TransformerContext, isSync?: boolean): InputObjectTypeDefinitionNode;
export declare function makeDeleteInputObject(obj: ObjectTypeDefinitionNode, isSync?: boolean): InputObjectTypeDefinitionNode;
export declare function makeModelXFilterInputObject(obj: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, ctx: TransformerContext, supportsConditions: Boolean): InputObjectTypeDefinitionNode;
export declare function makeModelXConditionInputObject(obj: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, ctx: TransformerContext, supportsConditions: Boolean): InputObjectTypeDefinitionNode;
export declare function makeEnumFilterInputObjects(obj: ObjectTypeDefinitionNode, ctx: TransformerContext, supportsConditions: Boolean): InputObjectTypeDefinitionNode[];
export declare function makeModelSortDirectionEnumObject(): EnumTypeDefinitionNode;
export declare function makeModelScalarFilterInputObject(type: string, supportsConditions: Boolean): InputObjectTypeDefinitionNode;
export declare function makeAttributeTypeEnum(): EnumTypeDefinitionNode;
export declare function makeModelConnectionType(typeName: string, isSync?: Boolean): ObjectTypeExtensionNode;
export declare function makeSubscriptionField(fieldName: string, returnTypeName: string, mutations: string[]): FieldDefinitionNode;
export declare type SortKeyFieldInfoTypeName = 'Composite' | string;
export interface SortKeyFieldInfo {
    fieldName: string;
    typeName: SortKeyFieldInfoTypeName;
    model?: string;
    keyName?: string;
}
export declare function makeModelConnectionField(fieldName: string, returnTypeName: string, sortKeyInfo?: SortKeyFieldInfo, directives?: DirectiveNode[]): FieldDefinitionNode;
export declare function makeScalarFilterInputs(supportsConditions: Boolean): InputObjectTypeDefinitionNode[];
