import { ObjectTypeDefinitionNode, InputValueDefinitionNode, FieldDefinitionNode, TypeNode, SchemaDefinitionNode, OperationTypeNode, OperationTypeDefinitionNode, ObjectTypeExtensionNode, NamedTypeNode, NonNullTypeNode, ListTypeNode, ArgumentNode, DirectiveNode, EnumTypeDefinitionNode, ValueNode, InputObjectTypeDefinitionNode } from 'graphql';
declare type ScalarMap = {
    [k: string]: 'String' | 'Int' | 'Float' | 'Boolean' | 'ID';
};
export declare const STANDARD_SCALARS: ScalarMap;
export declare const APPSYNC_DEFINED_SCALARS: ScalarMap;
export declare const DEFAULT_SCALARS: ScalarMap;
export declare const NUMERIC_SCALARS: {
    [k: string]: boolean;
};
export declare const MAP_SCALARS: {
    [k: string]: boolean;
};
export declare function attributeTypeFromScalar(scalar: TypeNode): "S" | "N";
export declare function isScalar(type: TypeNode): any;
export declare function isScalarOrEnum(type: TypeNode, enums: EnumTypeDefinitionNode[]): any;
export declare function getBaseType(type: TypeNode): string;
export declare function isListType(type: TypeNode): boolean;
export declare function isNonNullType(type: TypeNode): boolean;
export declare const getDirectiveArgument: (directive: DirectiveNode) => (arg: string, dflt?: any) => any;
export declare function unwrapNonNull(type: TypeNode): any;
export declare function wrapNonNull(type: TypeNode): NonNullTypeNode;
export declare function makeOperationType(operation: OperationTypeNode, type: string): OperationTypeDefinitionNode;
export declare function makeSchema(operationTypes: OperationTypeDefinitionNode[]): SchemaDefinitionNode;
export declare function blankObject(name: string): ObjectTypeDefinitionNode;
export declare function blankObjectExtension(name: string): ObjectTypeExtensionNode;
export declare function extensionWithFields(object: ObjectTypeExtensionNode, fields: FieldDefinitionNode[]): ObjectTypeExtensionNode;
export declare function extensionWithDirectives(object: ObjectTypeExtensionNode, directives: DirectiveNode[]): ObjectTypeExtensionNode;
export declare function extendFieldWithDirectives(field: FieldDefinitionNode, directives: DirectiveNode[]): FieldDefinitionNode;
export declare function makeInputObjectDefinition(name: string, inputs: InputValueDefinitionNode[]): InputObjectTypeDefinitionNode;
export declare function makeField(name: string, args: InputValueDefinitionNode[], type: TypeNode, directives?: DirectiveNode[]): FieldDefinitionNode;
export declare function makeDirective(name: string, args: ArgumentNode[]): DirectiveNode;
export declare function makeArgument(name: string, value: ValueNode): ArgumentNode;
export declare function makeValueNode(value: any): ValueNode;
export declare function makeInputValueDefinition(name: string, type: TypeNode): InputValueDefinitionNode;
export declare function makeNamedType(name: string): NamedTypeNode;
export declare function makeNonNullType(type: NamedTypeNode | ListTypeNode): NonNullTypeNode;
export declare function makeListType(type: TypeNode): TypeNode;
export {};
