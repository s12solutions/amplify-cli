"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_1 = require("graphql");
var resources_1 = require("./resources");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_common_2 = require("graphql-transformer-common");
var definitions_1 = require("./definitions");
var CONNECTION_STACK_NAME = 'ConnectionStack';
function makeConnectionAttributeName(type, field) {
    return field ? graphql_transformer_common_1.toCamelCase([type, field, 'id']) : graphql_transformer_common_1.toCamelCase([type, 'id']);
}
function validateKeyField(field) {
    if (!field) {
        return;
    }
    var baseType = graphql_transformer_common_1.getBaseType(field.type);
    var isAList = graphql_transformer_common_1.isListType(field.type);
    // The only valid key fields are single String and ID fields.
    if ((baseType === 'ID' || baseType === 'String') &&
        (!isAList)) {
        return;
    }
    throw new graphql_transformer_core_1.InvalidDirectiveError("If you define a field and specify it as a 'keyField', it must be of type 'ID' or 'String'.");
}
/**
 * Ensure that the field passed in is compatible to be a key field
 * (Not a list and of type ID or String)
 * @param field: the field to be checked.
 */
function validateKeyFieldConnectionWithKey(field, ctx) {
    var isNonNull = graphql_transformer_common_1.isNonNullType(field.type);
    var isAList = graphql_transformer_common_1.isListType(field.type);
    var isAScalarOrEnum = graphql_transformer_common_1.isScalarOrEnum(field.type, ctx.getTypeDefinitionsOfKind(graphql_1.Kind.ENUM_TYPE_DEFINITION));
    // The only valid key fields are single non-null fields.
    if (!isAList && isNonNull && isAScalarOrEnum) {
        return;
    }
    throw new graphql_transformer_core_1.InvalidDirectiveError("All fields provided to an @connection must be non-null scalar or enum fields.");
}
/**
 * Returns the type of the field with the field name specified by finding it from the array of fields
 * and returning its type.
 * @param fields Array of FieldDefinitionNodes to search within.
 * @param fieldName Name of the field whose type is to be fetched.
 */
function getFieldType(fields, fieldName) {
    return fields.find(function (f) { return f.name.value === fieldName; }).type;
}
/**
 * Checks that the fields being used to query match the expected key types for the index being used.
 * @param parentFields: All fields of the parent object.
 * @param relatedTypeFields: All fields of the related object.
 * @param inputFieldNames: The fields passed in to the @connection directive.
 * @param keySchema: The key schema for the index being used.
 */
function checkFieldsAgainstIndex(parentFields, relatedTypeFields, inputFieldNames, keySchema) {
    var hashAttributeName = keySchema[0].AttributeName;
    var tablePKType = getFieldType(relatedTypeFields, String(hashAttributeName));
    var queryPKType = getFieldType(parentFields, inputFieldNames[0]);
    var numFields = inputFieldNames.length;
    if (graphql_transformer_common_1.getBaseType(tablePKType) !== graphql_transformer_common_1.getBaseType(queryPKType)) {
        throw new graphql_transformer_core_1.InvalidDirectiveError(inputFieldNames[0] + " field is not of type " + graphql_transformer_common_1.getBaseType(tablePKType));
    }
    if (numFields > keySchema.length && keySchema.length !== 2) {
        throw new graphql_transformer_core_1.InvalidDirectiveError('Too many fields passed in to @connection directive.');
    }
    if (numFields === 2) {
        var sortAttributeName = keySchema[1].AttributeName;
        var tableSKType = getFieldType(relatedTypeFields, String(sortAttributeName));
        var querySKType = getFieldType(parentFields, inputFieldNames[1]);
        if (graphql_transformer_common_1.getBaseType(tableSKType) !== graphql_transformer_common_1.getBaseType(querySKType)) {
            throw new graphql_transformer_core_1.InvalidDirectiveError(inputFieldNames[1] + " field is not of type " + graphql_transformer_common_1.getBaseType(tableSKType));
        }
    }
    else if (numFields > 2) {
        var tableSortFields = String(keySchema[1].AttributeName).split(graphql_transformer_common_2.ModelResourceIDs.ModelCompositeKeySeparator());
        var tableSortKeyTypes_1 = tableSortFields.map(function (name) { return getFieldType(relatedTypeFields, name); });
        var querySortFields_1 = inputFieldNames.slice(1);
        var querySortKeyTypes = querySortFields_1.map(function (name) { return getFieldType(parentFields, name); });
        // Check that types of each attribute match types of the fields that make up the composite sort key for the
        // table or index being queried.
        querySortKeyTypes.forEach(function (fieldType, index) {
            if (graphql_transformer_common_1.getBaseType(fieldType) !== graphql_transformer_common_1.getBaseType(tableSortKeyTypes_1[index])) {
                throw new graphql_transformer_core_1.InvalidDirectiveError(querySortFields_1[index] + " field is not of type " + graphql_transformer_common_1.getBaseType(tableSortKeyTypes_1[index]));
            }
        });
    }
}
/**
 * The @connection transform.
 *
 * This transform configures the GSIs and resolvers needed to implement
 * relationships at the GraphQL level.
 */
var ModelConnectionTransformer = /** @class */ (function (_super) {
    __extends(ModelConnectionTransformer, _super);
    function ModelConnectionTransformer() {
        var _this = _super.call(this, 'ModelConnectionTransformer', graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["directive @connection(name: String,\n                                      keyField: String,\n                                      sortField: String,\n                                      keyName: String,\n                                      fields: [String!]) on FIELD_DEFINITION"], ["directive @connection(name: String,\n                                      keyField: String,\n                                      sortField: String,\n                                      keyName: String,\n                                      fields: [String!]) on FIELD_DEFINITION"])))) || this;
        _this.before = function (ctx) {
            var template = _this.resources.initTemplate();
            ctx.mergeResources(template.Resources);
            ctx.mergeParameters(template.Parameters);
            ctx.mergeOutputs(template.Outputs);
        };
        /**
         * Create a 1-1, 1-M, or M-1 connection between two model types.
         * Throws an error if the related type is not an object type annotated with @model.
         */
        _this.field = function (parent, field, directive, ctx) {
            var parentTypeName = parent.name.value;
            var fieldName = field.name.value;
            ctx.mapResourceToStack(CONNECTION_STACK_NAME, graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parentTypeName, fieldName));
            var parentModelDirective = parent.directives.find(function (dir) { return dir.name.value === 'model'; });
            if (!parentModelDirective) {
                throw new graphql_transformer_core_1.InvalidDirectiveError("@connection must be on an @model object type field.");
            }
            var relatedTypeName = graphql_transformer_common_1.getBaseType(field.type);
            var relatedType = ctx.inputDocument.definitions.find(function (d) { return d.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && d.name.value === relatedTypeName; });
            if (!relatedType) {
                throw new graphql_transformer_core_1.InvalidDirectiveError("Could not find an object type named " + relatedTypeName + ".");
            }
            var modelDirective = relatedType.directives.find(function (dir) { return dir.name.value === 'model'; });
            if (!modelDirective) {
                throw new graphql_transformer_core_1.InvalidDirectiveError("Object type " + relatedTypeName + " must be annotated with @model.");
            }
            // Checks if "fields" argument is provided which indicates use of the new parameterization
            // hence dive straight to new logic and return.
            if (graphql_transformer_common_1.getDirectiveArgument(directive)("fields")) {
                _this.connectionWithKey(parent, field, directive, ctx);
                return;
            }
            var connectionName = graphql_transformer_common_1.getDirectiveArgument(directive)("name");
            var associatedSortFieldName = null;
            var sortType = null;
            // Find the associated connection field if one exists.
            var associatedConnectionField = relatedType.fields.find(function (f) {
                // Make sure we don't associate with the same field in a self connection
                if (f === field) {
                    return false;
                }
                var relatedDirective = f.directives.find(function (dir) { return dir.name.value === 'connection'; });
                if (relatedDirective) {
                    var relatedDirectiveName = graphql_transformer_common_1.getDirectiveArgument(relatedDirective)("name");
                    if (connectionName && relatedDirectiveName && relatedDirectiveName === connectionName) {
                        associatedSortFieldName = graphql_transformer_common_1.getDirectiveArgument(relatedDirective)('sortField');
                        return true;
                    }
                }
                return false;
            });
            if (connectionName && !associatedConnectionField) {
                throw new graphql_transformer_core_1.InvalidDirectiveError("Found one half of connection \"" + connectionName + "\" at " + parentTypeName + "." + fieldName + " but no related field on type " + relatedTypeName);
            }
            connectionName = connectionName || parentTypeName + "." + fieldName;
            var leftConnectionIsList = graphql_transformer_common_1.isListType(field.type);
            var leftConnectionIsNonNull = graphql_transformer_common_1.isNonNullType(field.type);
            var rightConnectionIsList = associatedConnectionField ? graphql_transformer_common_1.isListType(associatedConnectionField.type) : undefined;
            var rightConnectionIsNonNull = associatedConnectionField ? graphql_transformer_common_1.isNonNullType(associatedConnectionField.type) : undefined;
            var connectionAttributeName = graphql_transformer_common_1.getDirectiveArgument(directive)("keyField");
            var associatedSortField = associatedSortFieldName &&
                parent.fields.find(function (f) { return f.name.value === associatedSortFieldName; });
            if (associatedSortField) {
                if (graphql_transformer_common_1.isListType(associatedSortField.type)) {
                    throw new graphql_transformer_core_1.InvalidDirectiveError("sortField \"" + associatedSortFieldName + "\" is a list. It should be a scalar.");
                }
                sortType = graphql_transformer_common_1.getBaseType(associatedSortField.type);
                if (!graphql_transformer_common_1.isScalar(associatedSortField.type) || sortType === graphql_transformer_common_1.STANDARD_SCALARS.Boolean) {
                    throw new graphql_transformer_core_1.InvalidDirectiveError("sortField \"" + associatedSortFieldName + "\" is of type \"" + sortType + "\". " +
                        "It should be a scalar that maps to a DynamoDB \"String\", \"Number\", or \"Binary\"");
                }
            }
            // This grabs the definition of the sort field when it lives on the foreign model.
            // We use this to configure key condition arguments for the resolver on the many side of the @connection.
            var foreignAssociatedSortField = associatedSortFieldName &&
                relatedType.fields.find(function (f) { return f.name.value === associatedSortFieldName; });
            var sortKeyInfo = foreignAssociatedSortField ?
                {
                    fieldName: foreignAssociatedSortField.name.value,
                    attributeType: graphql_transformer_common_1.attributeTypeFromScalar(foreignAssociatedSortField.type),
                    typeName: graphql_transformer_common_1.getBaseType(foreignAssociatedSortField.type)
                } :
                undefined;
            // Relationship Cardinalities:
            // 1. [] to []
            // 2. [] to {}
            // 3. {} to []
            // 4. [] to ?
            // 5. {} to ?
            if (leftConnectionIsList && rightConnectionIsList) {
                // 1. TODO.
                // Use an intermediary table or other strategy like embedded string sets for many to many.
                throw new graphql_transformer_core_1.InvalidDirectiveError("Invalid Connection (" + connectionName + "): Many to Many connections are not yet supported.");
            }
            else if (leftConnectionIsList && rightConnectionIsList === false) {
                // 2. [] to {} when the association exists. Note: false and undefined are not equal.
                // Store a foreign key on the related table and wire up a Query resolver.
                // This is the inverse of 3.
                if (!connectionAttributeName) {
                    connectionAttributeName = makeConnectionAttributeName(relatedTypeName, associatedConnectionField.name.value);
                }
                // Validate the provided key field is legit.
                var existingKeyField = relatedType.fields.find(function (f) { return f.name.value === connectionAttributeName; });
                validateKeyField(existingKeyField);
                var queryResolver = _this.resources.makeQueryConnectionResolver(parentTypeName, fieldName, relatedTypeName, connectionAttributeName, connectionName, 
                // If there is a sort field for this connection query then use
                sortKeyInfo);
                ctx.setResource(graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parentTypeName, fieldName), queryResolver);
                _this.extendTypeWithConnection(ctx, parent, field, relatedType, sortKeyInfo);
            }
            else if (!leftConnectionIsList && rightConnectionIsList) {
                // 3. {} to [] when the association exists.
                // Store foreign key on this table and wire up a GetItem resolver.
                // This is the inverse of 2.
                // if the sortField is not defined as a field, throw an error
                // Cannot assume the required type of the field
                if (associatedSortFieldName && !associatedSortField) {
                    throw new graphql_transformer_core_1.InvalidDirectiveError("sortField \"" + associatedSortFieldName + "\" not found on type \"" + parent.name.value + "\", other half of connection \"" + connectionName + "\".");
                }
                if (!connectionAttributeName) {
                    connectionAttributeName = makeConnectionAttributeName(parentTypeName, fieldName);
                }
                // Validate the provided key field is legit.
                var existingKeyField = parent.fields.find(function (f) { return f.name.value === connectionAttributeName; });
                validateKeyField(existingKeyField);
                var tableLogicalId = graphql_transformer_common_2.ModelResourceIDs.ModelTableResourceID(parentTypeName);
                var table = ctx.getResource(tableLogicalId);
                var sortField = associatedSortField ? { name: associatedSortFieldName, type: sortType } : null;
                var updated = _this.resources.updateTableForConnection(table, connectionName, connectionAttributeName, sortField);
                ctx.setResource(tableLogicalId, updated);
                var getResolver = _this.resources.makeGetItemConnectionResolver(parentTypeName, fieldName, relatedTypeName, connectionAttributeName);
                ctx.setResource(graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parentTypeName, fieldName), getResolver);
                // Update the create & update input objects for this
                var createInputName = graphql_transformer_common_2.ModelResourceIDs.ModelCreateInputObjectName(parentTypeName);
                var createInput = ctx.getType(createInputName);
                if (createInput) {
                    var updated_1 = definitions_1.updateCreateInputWithConnectionField(createInput, connectionAttributeName, leftConnectionIsNonNull);
                    ctx.putType(updated_1);
                }
                var updateInputName = graphql_transformer_common_2.ModelResourceIDs.ModelUpdateInputObjectName(parentTypeName);
                var updateInput = ctx.getType(updateInputName);
                if (updateInput) {
                    var updated_2 = definitions_1.updateUpdateInputWithConnectionField(updateInput, connectionAttributeName);
                    ctx.putType(updated_2);
                }
            }
            else if (leftConnectionIsList) {
                // 4. [] to ?
                // Store foreign key on the related table and wire up a Query resolver.
                // This has no inverse and has limited knowlege of the connection.
                if (!connectionAttributeName) {
                    connectionAttributeName = makeConnectionAttributeName(parentTypeName, fieldName);
                }
                // Validate the provided key field is legit.
                var existingKeyField = relatedType.fields.find(function (f) { return f.name.value === connectionAttributeName; });
                validateKeyField(existingKeyField);
                var tableLogicalId = graphql_transformer_common_2.ModelResourceIDs.ModelTableResourceID(relatedTypeName);
                var table = ctx.getResource(tableLogicalId);
                var updated = _this.resources.updateTableForConnection(table, connectionName, connectionAttributeName);
                ctx.setResource(tableLogicalId, updated);
                var queryResolver = _this.resources.makeQueryConnectionResolver(parentTypeName, fieldName, relatedTypeName, connectionAttributeName, connectionName, sortKeyInfo);
                ctx.setResource(graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parentTypeName, fieldName), queryResolver);
                _this.extendTypeWithConnection(ctx, parent, field, relatedType, sortKeyInfo);
                // Update the create & update input objects for the related type
                var createInputName = graphql_transformer_common_2.ModelResourceIDs.ModelCreateInputObjectName(relatedTypeName);
                var createInput = ctx.getType(createInputName);
                if (createInput) {
                    var updated_3 = definitions_1.updateCreateInputWithConnectionField(createInput, connectionAttributeName);
                    ctx.putType(updated_3);
                }
                var updateInputName = graphql_transformer_common_2.ModelResourceIDs.ModelUpdateInputObjectName(relatedTypeName);
                var updateInput = ctx.getType(updateInputName);
                if (updateInput) {
                    var updated_4 = definitions_1.updateUpdateInputWithConnectionField(updateInput, connectionAttributeName);
                    ctx.putType(updated_4);
                }
            }
            else {
                // 5. {} to ?
                // Store foreign key on this table and wire up a GetItem resolver.
                // This has no inverse and has limited knowlege of the connection.
                if (!connectionAttributeName) {
                    connectionAttributeName = makeConnectionAttributeName(parentTypeName, fieldName);
                }
                // Validate the provided key field is legit.
                var existingKeyField = parent.fields.find(function (f) { return f.name.value === connectionAttributeName; });
                validateKeyField(existingKeyField);
                var getResolver = _this.resources.makeGetItemConnectionResolver(parentTypeName, fieldName, relatedTypeName, connectionAttributeName);
                ctx.setResource(graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parentTypeName, fieldName), getResolver);
                // Update the create & update input objects for this type
                var createInputName = graphql_transformer_common_2.ModelResourceIDs.ModelCreateInputObjectName(parentTypeName);
                var createInput = ctx.getType(createInputName);
                if (createInput) {
                    var updated = definitions_1.updateCreateInputWithConnectionField(createInput, connectionAttributeName, leftConnectionIsNonNull);
                    ctx.putType(updated);
                }
                var updateInputName = graphql_transformer_common_2.ModelResourceIDs.ModelUpdateInputObjectName(parentTypeName);
                var updateInput = ctx.getType(updateInputName);
                if (updateInput) {
                    var updated = definitions_1.updateUpdateInputWithConnectionField(updateInput, connectionAttributeName);
                    ctx.putType(updated);
                }
            }
        };
        /**
         * The @connection parameterization with "fields" can be used to connect objects by running a query on a table.
         * The directive is given an index to query and a list of fields to query by such that it
         * returns a list objects (or in certain cases a single object) that are connected to the
         * object it is called on.
         * This directive is designed to leverage indices configured using @key to create relationships.
         *
         * Directive Definition:
         * @connection(keyName: String, fields: [String!]!) on FIELD_DEFINITION
         * param @keyName The name of the index configured using @key that should be queried to get
         *      connected objects
         * param @fields The names of the fields on the current object to query by.
         */
        _this.connectionWithKey = function (parent, field, directive, ctx) {
            var parentTypeName = parent.name.value;
            var fieldName = field.name.value;
            var args = graphql_transformer_core_1.getDirectiveArguments(directive);
            // Ensure that there is at least one field provided.
            if (args.fields.length === 0) {
                throw new graphql_transformer_core_1.InvalidDirectiveError('No fields passed in to @connection directive.');
            }
            // Check that related type exists and that the connected object is annotated with @model.
            var relatedTypeName = graphql_transformer_common_1.getBaseType(field.type);
            var relatedType = ctx.inputDocument.definitions.find(function (d) { return d.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && d.name.value === relatedTypeName; });
            // Get Child object's table.
            var tableLogicalID = graphql_transformer_common_2.ModelResourceIDs.ModelTableResourceID(relatedType.name.value);
            var tableResource = ctx.getResource(tableLogicalID);
            // Check that each field provided exists in the parent model and that it is a valid key type (single non-null).
            var inputFields = [];
            args.fields.forEach(function (item) {
                var fieldsArrayLength = inputFields.length;
                inputFields.push(parent.fields.find(function (f) { return f.name.value === item; }));
                if (!inputFields[fieldsArrayLength]) {
                    throw new graphql_transformer_core_1.InvalidDirectiveError(item + " is not a field in " + parentTypeName);
                }
                validateKeyFieldConnectionWithKey(inputFields[fieldsArrayLength], ctx);
            });
            var index = undefined;
            // If no index is provided use the default index for the related model type and
            // check that the query fields match the PK/SK of the table. Else confirm that index exists.
            if (!args.keyName) {
                checkFieldsAgainstIndex(parent.fields, relatedType.fields, args.fields, tableResource.Properties.KeySchema);
            }
            else {
                index = (tableResource.Properties.GlobalSecondaryIndexes ?
                    tableResource.Properties.GlobalSecondaryIndexes.find(function (GSI) { return GSI.IndexName === args.keyName; }) : null)
                    || (tableResource.Properties.LocalSecondaryIndexes ?
                        tableResource.Properties.LocalSecondaryIndexes.find(function (LSI) { return LSI.IndexName === args.keyName; }) : null);
                if (!index) {
                    throw new graphql_transformer_core_1.InvalidDirectiveError("Key " + args.keyName + " does not exist for model " + relatedTypeName);
                }
                // Confirm that types of query fields match types of PK/SK of the index being queried.
                checkFieldsAgainstIndex(parent.fields, relatedType.fields, args.fields, index.KeySchema);
            }
            // If the related type is not a list, the index has to be the default index and the fields provided must match the PK/SK of the index.
            if (!graphql_transformer_common_1.isListType(field.type)) {
                if (args.keyName) {
                    // tslint:disable-next-line: max-line-length
                    throw new graphql_transformer_core_1.InvalidDirectiveError("Connection is to a single object but the keyName " + args.keyName + " was provided which does not reference the default table.");
                }
                // Start with GetItem resolver for case where the connection is to a single object.
                var getResolver = _this.resources.makeGetItemConnectionWithKeyResolver(parentTypeName, fieldName, relatedTypeName, args.fields, tableResource.Properties.KeySchema);
                ctx.setResource(graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parentTypeName, fieldName), getResolver);
            }
            else {
                var keySchema_1 = index ? index.KeySchema : tableResource.Properties.KeySchema;
                var queryResolver = _this.resources.makeQueryConnectionWithKeyResolver(parentTypeName, fieldName, relatedType, args.fields, keySchema_1, index ? String(index.IndexName) : undefined);
                ctx.setResource(graphql_transformer_common_2.ResolverResourceIDs.ResolverResourceID(parentTypeName, fieldName), queryResolver);
                var sortKeyInfo = undefined;
                if (args.fields.length > 1) {
                    sortKeyInfo = undefined;
                }
                else {
                    var compositeSortKeyType = 'Composite';
                    var compositeSortKeyName = keySchema_1[1] ? _this.resources.makeCompositeSortKeyName(String(keySchema_1[1].AttributeName)) : undefined;
                    var sortKeyField = keySchema_1[1] ? relatedType.fields.find(function (f) { return f.name.value === keySchema_1[1].AttributeName; }) : undefined;
                    // If a sort key field is found then add a simple sort key, else add a composite sort key.
                    if (sortKeyField) {
                        sortKeyInfo = keySchema_1[1] ?
                            {
                                fieldName: String(keySchema_1[1].AttributeName),
                                typeName: graphql_transformer_common_1.getBaseType(sortKeyField.type),
                                model: relatedTypeName,
                                keyName: index ? String(index.IndexName) : 'Primary'
                            } :
                            undefined;
                    }
                    else {
                        sortKeyInfo = keySchema_1[1] ?
                            {
                                fieldName: compositeSortKeyName,
                                typeName: compositeSortKeyType,
                                model: relatedTypeName,
                                keyName: index ? String(index.IndexName) : 'Primary'
                            } :
                            undefined;
                    }
                }
                _this.extendTypeWithConnection(ctx, parent, field, relatedType, sortKeyInfo);
            }
        };
        _this.resources = new resources_1.ResourceFactory();
        return _this;
    }
    ModelConnectionTransformer.prototype.typeExist = function (type, ctx) {
        return Boolean(type in ctx.nodeMap);
    };
    ModelConnectionTransformer.prototype.generateModelXConnectionType = function (ctx, typeDef) {
        var tableXConnectionName = graphql_transformer_common_2.ModelResourceIDs.ModelConnectionTypeName(typeDef.name.value);
        if (this.typeExist(tableXConnectionName, ctx)) {
            return;
        }
        // Create the ModelXConnection
        var connectionType = graphql_transformer_common_1.blankObject(tableXConnectionName);
        ctx.addObject(connectionType);
        ctx.addObjectExtension(graphql_dynamodb_transformer_1.makeModelConnectionType(typeDef.name.value));
    };
    ModelConnectionTransformer.prototype.extendTypeWithConnection = function (ctx, parent, field, returnType, sortKeyInfo) {
        this.generateModelXConnectionType(ctx, returnType);
        // Extensions are not allowed to redeclare fields so we must replace
        // it in place.
        var type = ctx.getType(parent.name.value);
        if (type &&
            (type.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION || type.kind === graphql_1.Kind.INTERFACE_TYPE_DEFINITION)) {
            // Find the field and replace it in place.
            var newFields = type.fields.map(function (f) {
                if (f.name.value === field.name.value) {
                    var updated = graphql_dynamodb_transformer_1.makeModelConnectionField(field.name.value, returnType.name.value, sortKeyInfo);
                    updated.directives = f.directives;
                    return updated;
                }
                return f;
            });
            var updatedType = __assign(__assign({}, type), { fields: newFields });
            ctx.putType(updatedType);
            if (!this.typeExist('ModelSortDirection', ctx)) {
                var modelSortDirection = graphql_dynamodb_transformer_1.makeModelSortDirectionEnumObject();
                ctx.addEnum(modelSortDirection);
            }
            this.generateFilterAndKeyConditionInputs(ctx, returnType, sortKeyInfo);
        }
        else {
            throw new graphql_transformer_core_1.InvalidDirectiveError("Could not find a object or interface type named " + parent.name.value + ".");
        }
    };
    ModelConnectionTransformer.prototype.generateFilterAndKeyConditionInputs = function (ctx, field, sortKeyInfo) {
        var scalarFilters = graphql_dynamodb_transformer_1.makeScalarFilterInputs();
        for (var _i = 0, scalarFilters_1 = scalarFilters; _i < scalarFilters_1.length; _i++) {
            var filter = scalarFilters_1[_i];
            if (!this.typeExist(filter.name.value, ctx)) {
                ctx.addInput(filter);
            }
        }
        // Create the ModelXFilterInput
        var tableXQueryFilterInput = graphql_dynamodb_transformer_1.makeModelXFilterInputObject(field, ctx);
        if (!this.typeExist(tableXQueryFilterInput.name.value, ctx)) {
            ctx.addInput(tableXQueryFilterInput);
        }
        // Create sort key condition inputs for valid sort key types
        // We only create the KeyConditionInput if it is being used.
        // Don't create a key condition input for composite sort keys since it already done by @key.
        if (sortKeyInfo && (sortKeyInfo.typeName !== 'Composite')) {
            var sortKeyConditionInput = graphql_transformer_common_1.makeScalarKeyConditionForType(graphql_transformer_common_1.makeNamedType(sortKeyInfo.typeName));
            if (!this.typeExist(sortKeyConditionInput.name.value, ctx)) {
                ctx.addInput(sortKeyConditionInput);
            }
        }
    };
    return ModelConnectionTransformer;
}(graphql_transformer_core_1.Transformer));
exports.ModelConnectionTransformer = ModelConnectionTransformer;
var templateObject_1;
//# sourceMappingURL=ModelConnectionTransformer.js.map