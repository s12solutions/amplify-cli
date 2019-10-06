"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const intTypes = [`INTEGER`, `INT`, `SMALLINT`, `TINYINT`, `MEDIUMINT`, `BIGINT`, `BIT`];
const floatTypes = [`FLOAT`, `DOUBLE`, `REAL`, `REAL_AS_FLOAT`, `DOUBLE PRECISION`, `DEC`, `DECIMAL`, `FIXED`, `NUMERIC`];
/**
 * Creates a non-null type, which is a node wrapped around another type that simply defines it is non-nullable.
 *
 * @param typeNode the type to be marked as non-nullable.
 * @returns a non-null wrapper around the provided type.
 */
function getNonNullType(typeNode) {
    return {
        kind: graphql_1.Kind.NON_NULL_TYPE,
        type: typeNode
    };
}
exports.getNonNullType = getNonNullType;
/**
 * Creates a named type for the schema.
 *
 * @param name the name of the type.
 * @returns a named type with the provided name.
 */
function getNamedType(name) {
    return {
        kind: graphql_1.Kind.NAMED_TYPE,
        name: {
            kind: graphql_1.Kind.NAME,
            value: name
        }
    };
}
exports.getNamedType = getNamedType;
/**
 * Creates an input value definition for the schema.
 *
 * @param typeNode the type of the input node.
 * @param name the name of the input.
 * @returns an input value definition node with the provided type and name.
 */
function getInputValueDefinition(typeNode, name) {
    return {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: graphql_1.Kind.NAME,
            value: name
        },
        type: typeNode
    };
}
exports.getInputValueDefinition = getInputValueDefinition;
/**
 * Creates an operation field definition for the schema.
 *
 * @param name the name of the operation.
 * @param args the arguments for the operation.
 * @param type the type of the operation.
 * @param directives the directives (if any) applied to this field. In this context, only subscriptions will have this.
 * @returns an operation field definition with the provided name, args, type, and optionally directives.
 */
function getOperationFieldDefinition(name, args, type, directives) {
    return {
        kind: graphql_1.Kind.FIELD_DEFINITION,
        name: {
            kind: graphql_1.Kind.NAME,
            value: name
        },
        arguments: args,
        type: type,
        directives: directives
    };
}
exports.getOperationFieldDefinition = getOperationFieldDefinition;
/**
 * Creates a field definition node for the schema.
 *
 * @param fieldName the name of the field to be created.
 * @param type the type of the field to be created.
 * @returns a field definition node with the provided name and type.
 */
function getFieldDefinition(fieldName, type) {
    return {
        kind: graphql_1.Kind.FIELD_DEFINITION,
        name: {
            kind: graphql_1.Kind.NAME,
            value: fieldName
        },
        type
    };
}
exports.getFieldDefinition = getFieldDefinition;
/**
 * Creates a type definition node for the schema.
 *
 * @param fields the field set to be included in the type.
 * @param typeName the name of the type.
 * @returns a type definition node defined by the provided fields and name.
 */
function getTypeDefinition(fields, typeName) {
    return {
        kind: graphql_1.Kind.OBJECT_TYPE_DEFINITION,
        name: {
            kind: graphql_1.Kind.NAME,
            value: typeName
        },
        fields: fields
    };
}
exports.getTypeDefinition = getTypeDefinition;
/**
 * Creates an input type definition node for the schema.
 *
 * @param fields the fields in the input type.
 * @param typeName the name of the input type
 * @returns an input type definition node defined by the provided fields and
 */
function getInputTypeDefinition(fields, typeName) {
    return {
        kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
        name: {
            kind: graphql_1.Kind.NAME,
            value: typeName
        },
        fields: fields
    };
}
exports.getInputTypeDefinition = getInputTypeDefinition;
/**
 * Creates a name node for the schema.
 *
 * @param name the name of the name node.
 * @returns the name node defined by the provided name.
 */
function getNameNode(name) {
    return {
        kind: graphql_1.Kind.NAME,
        value: name
    };
}
exports.getNameNode = getNameNode;
/**
 * Creates a list value node for the schema.
 *
 * @param values the list of values to be in the list node.
 * @returns a list value node containing the provided values.
 */
function getListValueNode(values) {
    return {
        kind: graphql_1.Kind.LIST,
        values: values
    };
}
exports.getListValueNode = getListValueNode;
/**
 * Creates a simple string value node for the schema.
 *
 * @param value the value to be set in the string value node.
 * @returns a fleshed-out string value node.
 */
function getStringValueNode(value) {
    return {
        kind: graphql_1.Kind.STRING,
        value: value
    };
}
exports.getStringValueNode = getStringValueNode;
/**
 * Creates a directive node for a subscription in the schema.
 *
 * @param mutationName the name of the mutation the subscription directive is for.
 * @returns a directive node defining the subscription.
 */
function getDirectiveNode(mutationName) {
    return {
        kind: graphql_1.Kind.DIRECTIVE,
        name: this.getNameNode('aws_subscribe'),
        arguments: [this.getArgumentNode(mutationName)]
    };
}
exports.getDirectiveNode = getDirectiveNode;
/**
 * Creates an operation type definition (subscription, query, mutation) for the schema.
 *
 * @param operationType the type node defining the operation type.
 * @param operation  the named type node defining the operation type.
 */
function getOperationTypeDefinition(operationType, operation) {
    return {
        kind: graphql_1.Kind.OPERATION_TYPE_DEFINITION,
        operation: operationType,
        type: operation
    };
}
exports.getOperationTypeDefinition = getOperationTypeDefinition;
/**
 * Creates an argument node for a subscription directive within the schema.
 *
 * @param argument the argument string.
 * @returns the argument node.
 */
function getArgumentNode(argument) {
    return {
        kind: graphql_1.Kind.ARGUMENT,
        name: this.getNameNode('mutations'),
        value: this.getListValueNode([this.getStringValueNode(argument)])
    };
}
exports.getArgumentNode = getArgumentNode;
/**
 * Given the DB type for a column, make a best effort to select the appropriate GraphQL type for
 * the corresponding field.
 *
 * @param dbType the SQL column type.
 * @returns the GraphQL field type.
 */
function getGraphQLTypeFromMySQLType(dbType) {
    const normalizedType = dbType.toUpperCase().split("(")[0];
    if (`BOOL` == normalizedType) {
        return `Boolean`;
    }
    else if (`JSON` == normalizedType) {
        return `AWSJSON`;
    }
    else if (`TIME` == normalizedType) {
        return `AWSTime`;
    }
    else if (`DATE` == normalizedType) {
        return `AWSDate`;
    }
    else if (`DATETIME` == normalizedType) {
        return `AWSDateTime`;
    }
    else if (`TIMESTAMP` == normalizedType) {
        return `AWSTimestamp`;
    }
    else if (intTypes.indexOf(normalizedType) > -1) {
        return `Int`;
    }
    else if (floatTypes.indexOf(normalizedType) > -1) {
        return `Float`;
    }
    return `String`;
}
exports.getGraphQLTypeFromMySQLType = getGraphQLTypeFromMySQLType;
//# sourceMappingURL=RelationalDBSchemaTransformerUtils.js.map