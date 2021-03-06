import { InputObjectTypeDefinitionNode, InputValueDefinitionNode, InterfaceTypeDefinitionNode, ObjectTypeDefinitionNode, FieldDefinitionNode } from 'graphql';
export declare function makeHttpArgument(name: string, inputType: InputObjectTypeDefinitionNode, makeNonNull: boolean): InputValueDefinitionNode;
export declare function makeUrlParamInputObject(parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, field: FieldDefinitionNode, urlParams: string[]): InputObjectTypeDefinitionNode;
export declare function makeHttpQueryInputObject(parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, field: FieldDefinitionNode, queryArgArray: InputValueDefinitionNode[], deNull: boolean): InputObjectTypeDefinitionNode;
export declare function makeHttpBodyInputObject(parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, field: FieldDefinitionNode, bodyArgArray: InputValueDefinitionNode[], deNull: boolean): InputObjectTypeDefinitionNode;
