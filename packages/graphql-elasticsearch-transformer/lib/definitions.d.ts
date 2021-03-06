import { ObjectTypeDefinitionNode, InputObjectTypeDefinitionNode, EnumTypeDefinitionNode } from 'graphql';
export declare function makeSearchableScalarInputObject(type: string): InputObjectTypeDefinitionNode;
export declare function makeSearchableXFilterInputObject(obj: ObjectTypeDefinitionNode): InputObjectTypeDefinitionNode;
export declare function makeSearchableSortDirectionEnumObject(): EnumTypeDefinitionNode;
export declare function makeSearchableXSortableFieldsEnumObject(obj: ObjectTypeDefinitionNode): EnumTypeDefinitionNode;
export declare function makeSearchableXSortInputObject(obj: ObjectTypeDefinitionNode): InputObjectTypeDefinitionNode;
