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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_1 = require("graphql");
var cloudform_types_1 = require("cloudform-types");
var table_1 = require("cloudform-types/types/dynamoDb/table");
var KeyTransformer = /** @class */ (function (_super) {
    __extends(KeyTransformer, _super);
    function KeyTransformer() {
        var _this = _super.call(this, 'KeyTransformer', graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["directive @key(name: String, fields: [String!]!, queryField: String) on OBJECT"], ["directive @key(name: String, fields: [String!]!, queryField: String) on OBJECT"])))) || this;
        /**
         * Augment the table key structures based on the @key.
         */
        _this.object = function (definition, directive, ctx) {
            _this.validate(definition, directive, ctx);
            _this.updateIndexStructures(definition, directive, ctx);
            _this.updateSchema(definition, directive, ctx);
            _this.updateResolvers(definition, directive, ctx);
            _this.addKeyConditionInputs(definition, directive, ctx);
        };
        /**
         * Update the existing @model table's index structures. Includes primary key, GSI, and LSIs.
         * @param definition The object type definition node.
         * @param directive The @key directive
         * @param ctx The transformer context
         */
        _this.updateIndexStructures = function (definition, directive, ctx) {
            if (_this.isPrimaryKey(directive)) {
                // Set the table's primary key using the @key definition.
                _this.replacePrimaryKey(definition, directive, ctx);
            }
            else {
                // Append a GSI/LSI to the table configuration.
                _this.appendSecondaryIndex(definition, directive, ctx);
            }
        };
        /**
         * Update the structural components of the schema that are relevant to the new index structures.
         *
         * Updates:
         * 1. getX with new primary key information.
         * 2. listX with new primary key information.
         *
         * Creates:
         * 1. A query field for each secondary index.
         */
        _this.updateSchema = function (definition, directive, ctx) {
            _this.updateQueryFields(definition, directive, ctx);
            _this.updateInputObjects(definition, directive, ctx);
        };
        /**
         * Update the get, list, create, update, and delete resolvers with updated key information.
         */
        _this.updateResolvers = function (definition, directive, ctx) {
            var directiveArgs = graphql_transformer_core_1.getDirectiveArguments(directive);
            var getResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBGetResolverResourceID(definition.name.value));
            var listResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBListResolverResourceID(definition.name.value));
            var createResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBCreateResolverResourceID(definition.name.value));
            var updateResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBUpdateResolverResourceID(definition.name.value));
            var deleteResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBDeleteResolverResourceID(definition.name.value));
            if (_this.isPrimaryKey(directive)) {
                // When looking at a primary key we update the primary paths for writing/reading data.
                // and ensure any composite sort keys for the primary index.
                if (getResolver) {
                    getResolver.Properties.RequestMappingTemplate = joinSnippets([
                        _this.setKeySnippet(directive),
                        getResolver.Properties.RequestMappingTemplate
                    ]);
                }
                if (listResolver) {
                    listResolver.Properties.RequestMappingTemplate = joinSnippets([
                        graphql_mapping_template_1.print(setQuerySnippet(definition, directive, ctx)),
                        listResolver.Properties.RequestMappingTemplate
                    ]);
                }
                if (createResolver) {
                    createResolver.Properties.RequestMappingTemplate = joinSnippets([
                        _this.setKeySnippet(directive, true),
                        ensureCompositeKeySnippet(directive),
                        createResolver.Properties.RequestMappingTemplate
                    ]);
                }
                if (updateResolver) {
                    updateResolver.Properties.RequestMappingTemplate = joinSnippets([
                        _this.setKeySnippet(directive, true),
                        ensureCompositeKeySnippet(directive),
                        updateResolver.Properties.RequestMappingTemplate
                    ]);
                }
                if (deleteResolver) {
                    deleteResolver.Properties.RequestMappingTemplate = joinSnippets([
                        _this.setKeySnippet(directive, true),
                        deleteResolver.Properties.RequestMappingTemplate
                    ]);
                }
            }
            else {
                // When looking at a secondary key we need to ensure any composite sort key values
                // and validate update operations to protect the integrity of composite sort keys.
                if (createResolver) {
                    createResolver.Properties.RequestMappingTemplate = joinSnippets([
                        ensureCompositeKeySnippet(directive),
                        createResolver.Properties.RequestMappingTemplate
                    ]);
                }
                if (updateResolver) {
                    updateResolver.Properties.RequestMappingTemplate = joinSnippets([
                        _this.validateKeyUpdateArgumentsSnippet(directive),
                        ensureCompositeKeySnippet(directive),
                        updateResolver.Properties.RequestMappingTemplate
                    ]);
                }
                if (deleteResolver) {
                    deleteResolver.Properties.RequestMappingTemplate = joinSnippets([
                        ensureCompositeKeySnippet(directive),
                        deleteResolver.Properties.RequestMappingTemplate
                    ]);
                }
                if (directiveArgs.queryField) {
                    var queryTypeName = ctx.getQueryTypeName();
                    var queryResolverId = graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID(queryTypeName, directiveArgs.queryField);
                    var queryResolver = makeQueryResolver(definition, directive, ctx);
                    ctx.mapResourceToStack(definition.name.value, queryResolverId);
                    ctx.setResource(queryResolverId, queryResolver);
                }
            }
        };
        _this.addKeyConditionInputs = function (definition, directive, ctx) {
            var args = graphql_transformer_core_1.getDirectiveArguments(directive);
            if (args.fields.length > 2) {
                var compositeKeyFieldNames = args.fields.slice(1);
                // To make sure we get the intended behavior and type conversion we have to keep the order of the fields
                // as it is in the key field list
                var compositeKeyFields = [];
                var _loop_1 = function (compositeKeyFieldName) {
                    var field = definition.fields.find(function (field) { return field.name.value === compositeKeyFieldName; });
                    if (!field) {
                        throw new graphql_transformer_core_1.InvalidDirectiveError("Can't find field: " + compositeKeyFieldName + " in " + definition.name.value + ", but it was specified in the @key definition.");
                    }
                    else {
                        compositeKeyFields.push(field);
                    }
                };
                for (var _i = 0, compositeKeyFieldNames_1 = compositeKeyFieldNames; _i < compositeKeyFieldNames_1.length; _i++) {
                    var compositeKeyFieldName = compositeKeyFieldNames_1[_i];
                    _loop_1(compositeKeyFieldName);
                }
                var keyName = graphql_transformer_common_1.toUpper(args.name || 'Primary');
                var keyConditionInput = graphql_transformer_common_1.makeCompositeKeyConditionInputForKey(definition.name.value, keyName, compositeKeyFields);
                if (!ctx.getType(keyConditionInput.name.value)) {
                    ctx.addInput(keyConditionInput);
                }
                var compositeKeyInput = graphql_transformer_common_1.makeCompositeKeyInputForKey(definition.name.value, keyName, compositeKeyFields);
                if (!ctx.getType(compositeKeyInput.name.value)) {
                    ctx.addInput(compositeKeyInput);
                }
            }
            else if (args.fields.length === 2) {
                var finalSortKeyFieldName_1 = args.fields[1];
                var finalSortKeyField = definition.fields.find(function (f) { return f.name.value === finalSortKeyFieldName_1; });
                var typeResolver = function (baseType) {
                    var resolvedEnumType = ctx.getType(baseType);
                    return resolvedEnumType ? 'String' : undefined;
                };
                var sortKeyConditionInput = graphql_transformer_common_1.makeScalarKeyConditionForType(finalSortKeyField.type, typeResolver);
                if (!sortKeyConditionInput) {
                    var checkedKeyName = args.name ? args.name : "<unnamed>";
                    throw new graphql_transformer_core_1.InvalidDirectiveError("Cannot resolve type for field '" + finalSortKeyFieldName_1 + "' in @key '" + checkedKeyName + "' on type '" + definition.name.value + "'.");
                }
                if (!ctx.getType(sortKeyConditionInput.name.value)) {
                    ctx.addInput(sortKeyConditionInput);
                }
            }
        };
        /**
         * Updates query fields to include any arguments required by the key structures.
         * @param definition The object type definition node.
         * @param directive The @key directive
         * @param ctx The transformer context
         */
        _this.updateQueryFields = function (definition, directive, ctx) {
            _this.updateGetField(definition, directive, ctx);
            _this.updateListField(definition, directive, ctx);
            _this.ensureQueryField(definition, directive, ctx);
        };
        // If the get field exists, update its arguments with primary key information.
        _this.updateGetField = function (definition, directive, ctx) {
            var query = ctx.getQuery();
            var getResourceID = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBGetResolverResourceID(definition.name.value);
            var getResolverResource = ctx.getResource(getResourceID);
            if (getResolverResource && _this.isPrimaryKey(directive)) {
                // By default takes a single argument named 'id'. Replace it with the updated primary key structure.
                var getField_1 = query.fields.find(function (field) { return field.name.value === getResolverResource.Properties.FieldName; });
                var args = graphql_transformer_core_1.getDirectiveArguments(directive);
                var getArguments = args.fields.map(function (keyAttributeName) {
                    var keyField = definition.fields.find(function (field) { return field.name.value === keyAttributeName; });
                    var keyArgument = graphql_transformer_common_1.makeInputValueDefinition(keyAttributeName, graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.getBaseType(keyField.type))));
                    return keyArgument;
                });
                getField_1 = __assign(__assign({}, getField_1), { arguments: getArguments });
                query = __assign(__assign({}, query), { fields: query.fields.map(function (field) { return field.name.value === getField_1.name.value ? getField_1 : field; }) });
                ctx.putType(query);
            }
        };
        // If the list field exists, update its arguments with primary key information.
        _this.updateListField = function (definition, directive, ctx) {
            var listResourceID = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBListResolverResourceID(definition.name.value);
            var listResolverResource = ctx.getResource(listResourceID);
            if (listResolverResource && _this.isPrimaryKey(directive)) {
                // By default takes a single argument named 'id'. Replace it with the updated primary key structure.
                var query = ctx.getQuery();
                var listField_1 = query.fields.find(function (field) { return field.name.value === listResolverResource.Properties.FieldName; });
                var listArguments = __spreadArrays(listField_1.arguments);
                var args = graphql_transformer_core_1.getDirectiveArguments(directive);
                if (args.fields.length > 2) {
                    listArguments = addCompositeSortKey(definition, args, listArguments);
                    listArguments = addHashField(definition, args, listArguments);
                }
                else if (args.fields.length === 2) {
                    listArguments = addSimpleSortKey(ctx, definition, args, listArguments);
                    listArguments = addHashField(definition, args, listArguments);
                }
                else {
                    listArguments = addHashField(definition, args, listArguments);
                }
                listArguments.push(graphql_transformer_common_1.makeInputValueDefinition('sortDirection', graphql_transformer_common_1.makeNamedType('ModelSortDirection')));
                listField_1 = __assign(__assign({}, listField_1), { arguments: listArguments });
                query = __assign(__assign({}, query), { fields: query.fields.map(function (field) { return field.name.value === listField_1.name.value ? listField_1 : field; }) });
                ctx.putType(query);
            }
        };
        // If this is a secondary key and a queryField has been provided, create the query field.
        _this.ensureQueryField = function (definition, directive, ctx) {
            var args = graphql_transformer_core_1.getDirectiveArguments(directive);
            if (args.queryField && !_this.isPrimaryKey(directive)) {
                var queryType = ctx.getQuery();
                var queryArguments = [];
                if (args.fields.length > 2) {
                    queryArguments = addCompositeSortKey(definition, args, queryArguments);
                    queryArguments = addHashField(definition, args, queryArguments);
                }
                else if (args.fields.length === 2) {
                    queryArguments = addSimpleSortKey(ctx, definition, args, queryArguments);
                    queryArguments = addHashField(definition, args, queryArguments);
                }
                else {
                    queryArguments = addHashField(definition, args, queryArguments);
                }
                queryArguments.push(graphql_transformer_common_1.makeInputValueDefinition('sortDirection', graphql_transformer_common_1.makeNamedType('ModelSortDirection')));
                var queryField = graphql_transformer_common_1.makeConnectionField(args.queryField, definition.name.value, queryArguments);
                queryType = __assign(__assign({}, queryType), { fields: __spreadArrays(queryType.fields, [queryField]) });
                ctx.putType(queryType);
            }
        };
        // Update the create, update, and delete input objects to account for any changes to the primary key.
        _this.updateInputObjects = function (definition, directive, ctx) {
            if (_this.isPrimaryKey(directive)) {
                var directiveArgs = graphql_transformer_core_1.getDirectiveArguments(directive);
                var createInput = ctx.getType(graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName(definition.name.value));
                if (createInput) {
                    ctx.putType(replaceCreateInput(definition, createInput, directiveArgs.fields));
                }
                var updateInput = ctx.getType(graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName(definition.name.value));
                if (updateInput) {
                    ctx.putType(replaceUpdateInput(definition, updateInput, directiveArgs.fields));
                }
                var deleteInput = ctx.getType(graphql_transformer_common_1.ModelResourceIDs.ModelDeleteInputObjectName(definition.name.value));
                if (deleteInput) {
                    ctx.putType(replaceDeleteInput(definition, deleteInput, directiveArgs.fields));
                }
            }
        };
        // Return a VTL snippet that sets the key for key for get, update, and delete operations.
        _this.setKeySnippet = function (directive, isMutation) {
            if (isMutation === void 0) { isMutation = false; }
            var directiveArgs = graphql_transformer_core_1.getDirectiveArguments(directive);
            var cmds = [graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelObjectKey), modelObjectKey(directiveArgs, isMutation))];
            return graphql_mapping_template_1.printBlock("Set the primary @key")(graphql_mapping_template_1.compoundExpression(cmds));
        };
        // When issuing an update mutation that changes one part of a composite sort key,
        // you must supply the entire key so that the underlying composite key can be resaved
        // in the update operation. We only need to update for composite sort keys on secondary indexes.
        _this.validateKeyUpdateArgumentsSnippet = function (directive) {
            var directiveArgs = graphql_transformer_core_1.getDirectiveArguments(directive);
            if (!_this.isPrimaryKey(directive) && directiveArgs.fields.length > 2) {
                var sortKeyFields = directiveArgs.fields.slice(1);
                return graphql_mapping_template_1.printBlock("Validate update mutation for @key '" + directiveArgs.name + "'")(graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('hasSeenSomeKeyArg'), graphql_mapping_template_1.bool(false)),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref('keyFieldNames'), graphql_mapping_template_1.list(sortKeyFields.map(function (f) { return graphql_mapping_template_1.str(f); }))),
                    graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('keyFieldName'), graphql_mapping_template_1.ref('keyFieldNames'), [
                        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("$ctx.args.input.containsKey(\"$keyFieldName\")"), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('hasSeenSomeKeyArg'), graphql_mapping_template_1.bool(true)), true)
                    ]),
                    graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('keyFieldName'), graphql_mapping_template_1.ref('keyFieldNames'), [
                        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("$hasSeenSomeKeyArg && !$ctx.args.input.containsKey(\"$keyFieldName\")"), graphql_mapping_template_1.raw("$util.error(\"When updating any part of the composite sort key for @key '" + directiveArgs.name + "'," +
                            " you must provide all fields for the key. Missing key: '$keyFieldName'.\")"))
                    ])
                ]));
            }
            return '';
        };
        /**
         * Validates the directive usage is semantically valid.
         *
         * 1. There may only be 1 @key without a name (specifying the primary key)
         * 2. There may only be 1 @key with a given name.
         * 3. @key must only reference existing scalar fields that map to DynamoDB S, N, or B.
         * 4. A primary key must not include a 'queryField'.
         * 5. If there is no primary sort key, make sure there are no more LSIs.
         * @param definition The object type definition node.
         * @param directive The @key directive
         * @param ctx The transformer context
         */
        _this.validate = function (definition, directive, ctx) {
            var directiveArgs = graphql_transformer_core_1.getDirectiveArguments(directive);
            if (!directiveArgs.name) {
                // 1. Make sure there are no more directives without a name.
                for (var _i = 0, _a = definition.directives.filter(function (d) { return d.name.value === 'key'; }); _i < _a.length; _i++) {
                    var otherDirective = _a[_i];
                    var otherArgs = graphql_transformer_core_1.getDirectiveArguments(otherDirective);
                    if (otherDirective !== directive && !otherArgs.name) {
                        throw new graphql_transformer_core_1.InvalidDirectiveError("You may only supply one primary @key on type '" + definition.name.value + "'.");
                    }
                    // 5. If there is no primary sort key, make sure there are no more LSIs.
                    var hasPrimarySortKey = directiveArgs.fields.length > 1;
                    var primaryHashField = directiveArgs.fields[0];
                    var otherHashField = otherArgs.fields[0];
                    if (otherDirective !== directive &&
                        !hasPrimarySortKey &&
                        // If the primary key and other key share the first field and are not the same directive it is an LSI.
                        primaryHashField === otherHashField) {
                        throw new graphql_transformer_core_1.InvalidDirectiveError("Invalid @key \"" + otherArgs.name + "\". You may not create a @key where the first field in 'fields' " +
                            "is the same as that of the primary @key unless the primary @key has multiple 'fields'. " +
                            "You cannot have a local secondary index without a sort key in the primary index.");
                    }
                }
                // 4. Make sure that a 'queryField' is not included on a primary @key.
                if (directiveArgs.queryField) {
                    throw new graphql_transformer_core_1.InvalidDirectiveError("You cannot pass 'queryField' to the primary @key on type '" + definition.name.value + "'.");
                }
            }
            else {
                // 2. Make sure there are no more directives with the same name.
                for (var _b = 0, _c = definition.directives.filter(function (d) { return d.name.value === 'key'; }); _b < _c.length; _b++) {
                    var otherDirective = _c[_b];
                    var otherArgs = graphql_transformer_core_1.getDirectiveArguments(otherDirective);
                    if (otherDirective !== directive && otherArgs.name === directiveArgs.name) {
                        throw new graphql_transformer_core_1.InvalidDirectiveError("You may only supply one @key with the name '" + directiveArgs.name + "' on type '" + definition.name.value + "'.");
                    }
                }
            }
            // 3. Check that fields exists and are valid key types.
            var fieldMap = new Map();
            for (var _d = 0, _e = definition.fields; _d < _e.length; _d++) {
                var field = _e[_d];
                fieldMap.set(field.name.value, field);
            }
            for (var _f = 0, _g = directiveArgs.fields; _f < _g.length; _f++) {
                var fieldName = _g[_f];
                if (!fieldMap.has(fieldName)) {
                    var checkedKeyName = directiveArgs.name ? directiveArgs.name : "<unnamed>";
                    throw new graphql_transformer_core_1.InvalidDirectiveError("You cannot specify a non-existant field '" + fieldName + "' in @key '" + checkedKeyName + "' on type '" + definition.name.value + "'.");
                }
                else {
                    var existingField = fieldMap.get(fieldName);
                    var ddbKeyType = attributeTypeFromType(existingField.type, ctx);
                    if (_this.isPrimaryKey(directive) && !graphql_transformer_common_1.isNonNullType(existingField.type)) {
                        throw new graphql_transformer_core_1.InvalidDirectiveError("The primary @key on type '" + definition.name.value + "' must reference non-null fields.");
                    }
                    else if (ddbKeyType !== 'S' && ddbKeyType !== 'N' && ddbKeyType !== 'B') {
                        throw new graphql_transformer_core_1.InvalidDirectiveError("A @key on type '" + definition.name.value + "' cannot reference non-scalar field " + fieldName + ".");
                    }
                }
            }
        };
        /**
         * Returns true if the directive specifies a primary key.
         * @param directive The directive node.
         */
        _this.isPrimaryKey = function (directive) {
            var directiveArgs = graphql_transformer_core_1.getDirectiveArguments(directive);
            return !Boolean(directiveArgs.name);
        };
        /**
         * Replace the primary key schema with one defined by a @key.
         * @param definition The object type definition node.
         * @param directive The @key directive
         * @param ctx The transformer context
         */
        _this.replacePrimaryKey = function (definition, directive, ctx) {
            var args = graphql_transformer_core_1.getDirectiveArguments(directive);
            var ks = keySchema(args);
            var attrDefs = attributeDefinitions(args, definition, ctx);
            var tableLogicalID = graphql_transformer_common_1.ModelResourceIDs.ModelTableResourceID(definition.name.value);
            var tableResource = ctx.getResource(tableLogicalID);
            if (!tableResource) {
                throw new graphql_transformer_core_1.InvalidDirectiveError("The @key directive may only be added to object definitions annotated with @model.");
            }
            else {
                // First remove any attribute definitions in the current primary key.
                var existingAttrDefSet = new Set(tableResource.Properties.AttributeDefinitions.map(function (ad) { return ad.AttributeName; }));
                var _loop_2 = function (existingKey) {
                    if (existingAttrDefSet.has(existingKey.AttributeName)) {
                        tableResource.Properties.AttributeDefinitions = tableResource.Properties.AttributeDefinitions.filter(function (ad) { return ad.AttributeName !== existingKey.AttributeName; });
                        existingAttrDefSet.delete(existingKey.AttributeName);
                    }
                };
                for (var _i = 0, _a = tableResource.Properties.KeySchema; _i < _a.length; _i++) {
                    var existingKey = _a[_i];
                    _loop_2(existingKey);
                }
                // Then replace the KeySchema and add any new attribute definitions back.
                tableResource.Properties.KeySchema = ks;
                for (var _b = 0, attrDefs_1 = attrDefs; _b < attrDefs_1.length; _b++) {
                    var attr = attrDefs_1[_b];
                    if (!existingAttrDefSet.has(attr.AttributeName)) {
                        tableResource.Properties.AttributeDefinitions.push(attr);
                    }
                }
            }
        };
        /**
         * Add a LSI or GSI to the table as defined by a @key.
         * @param definition The object type definition node.
         * @param directive The @key directive
         * @param ctx The transformer context
         */
        _this.appendSecondaryIndex = function (definition, directive, ctx) {
            var args = graphql_transformer_core_1.getDirectiveArguments(directive);
            var ks = keySchema(args);
            var attrDefs = attributeDefinitions(args, definition, ctx);
            var tableLogicalID = graphql_transformer_common_1.ModelResourceIDs.ModelTableResourceID(definition.name.value);
            var tableResource = ctx.getResource(tableLogicalID);
            var primaryKeyDirective = getPrimaryKey(definition);
            var primaryPartitionKeyName = primaryKeyDirective ? graphql_transformer_core_1.getDirectiveArguments(primaryKeyDirective).fields[0] : 'id';
            if (!tableResource) {
                throw new graphql_transformer_core_1.InvalidDirectiveError("The @key directive may only be added to object definitions annotated with @model.");
            }
            else {
                var baseIndexProperties = {
                    IndexName: args.name,
                    KeySchema: ks,
                    Projection: new table_1.Projection({
                        ProjectionType: 'ALL'
                    })
                };
                if (primaryPartitionKeyName === ks[0].AttributeName) {
                    // This is an LSI.
                    // Add the new secondary index and update the table's attribute definitions.
                    tableResource.Properties.LocalSecondaryIndexes = append(tableResource.Properties.LocalSecondaryIndexes, new table_1.LocalSecondaryIndex(baseIndexProperties));
                }
                else {
                    // This is a GSI.
                    // Add the new secondary index and update the table's attribute definitions.
                    tableResource.Properties.GlobalSecondaryIndexes = append(tableResource.Properties.GlobalSecondaryIndexes, new table_1.GlobalSecondaryIndex(__assign(__assign({}, baseIndexProperties), { ProvisionedThroughput: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUsePayPerRequestBilling, cloudform_types_1.Refs.NoValue, {
                            ReadCapacityUnits: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableReadIOPS),
                            WriteCapacityUnits: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableWriteIOPS)
                        }) })));
                }
                var existingAttrDefSet = new Set(tableResource.Properties.AttributeDefinitions.map(function (ad) { return ad.AttributeName; }));
                for (var _i = 0, attrDefs_2 = attrDefs; _i < attrDefs_2.length; _i++) {
                    var attr = attrDefs_2[_i];
                    if (!existingAttrDefSet.has(attr.AttributeName)) {
                        tableResource.Properties.AttributeDefinitions.push(attr);
                    }
                }
            }
        };
        return _this;
    }
    return KeyTransformer;
}(graphql_transformer_core_1.Transformer));
exports.default = KeyTransformer;
/**
 * Return a key schema given @key directive arguments.
 * @param args The arguments of the @key directive.
 */
function keySchema(args) {
    if (args.fields.length > 1) {
        var condensedSortKey = condenseRangeKey(args.fields.slice(1));
        return [
            { AttributeName: args.fields[0], KeyType: 'HASH' },
            { AttributeName: condensedSortKey, KeyType: 'RANGE' },
        ];
    }
    else {
        return [{ AttributeName: args.fields[0], KeyType: 'HASH' }];
    }
}
function attributeTypeFromType(type, ctx) {
    var baseTypeName = graphql_transformer_common_1.getBaseType(type);
    var ofType = ctx.getType(baseTypeName);
    if (ofType && ofType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION) {
        return 'S';
    }
    return graphql_transformer_common_1.attributeTypeFromScalar(type);
}
/**
 * Return a list of attribute definitions given a @key directive arguments and an object definition.
 * @param args The arguments passed to @key.
 * @param def The object type definition containing the @key.
 */
function attributeDefinitions(args, def, ctx) {
    var fieldMap = new Map();
    for (var _i = 0, _a = def.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        fieldMap.set(field.name.value, field);
    }
    if (args.fields.length > 2) {
        var hashName = args.fields[0];
        var condensedSortKey = condenseRangeKey(args.fields.slice(1));
        return [
            { AttributeName: hashName, AttributeType: attributeTypeFromType(fieldMap.get(hashName).type, ctx) },
            { AttributeName: condensedSortKey, AttributeType: 'S' },
        ];
    }
    else if (args.fields.length === 2) {
        var hashName = args.fields[0];
        var sortName = args.fields[1];
        return [
            { AttributeName: hashName, AttributeType: attributeTypeFromType(fieldMap.get(hashName).type, ctx) },
            { AttributeName: sortName, AttributeType: attributeTypeFromType(fieldMap.get(sortName).type, ctx) },
        ];
    }
    else {
        var fieldName = args.fields[0];
        return [{ AttributeName: fieldName, AttributeType: attributeTypeFromType(fieldMap.get(fieldName).type, ctx) }];
    }
}
function append(maybeList, item) {
    if (maybeList) {
        return __spreadArrays(maybeList, [item]);
    }
    return [item];
}
function getPrimaryKey(obj) {
    for (var _i = 0, _a = obj.directives; _i < _a.length; _i++) {
        var directive = _a[_i];
        if (directive.name.value === 'key' && !graphql_transformer_core_1.getDirectiveArguments(directive).name) {
            return directive;
        }
    }
}
function primaryIdFields(definition, keyFields) {
    return keyFields.map(function (keyFieldName) {
        var keyField = definition.fields.find(function (field) { return field.name.value === keyFieldName; });
        return graphql_transformer_common_1.makeInputValueDefinition(keyFieldName, graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.getBaseType(keyField.type))));
    });
}
// Key fields are non-nullable, non-key fields follow what their @model declaration makes.
function replaceCreateInput(definition, input, keyFields) {
    return __assign(__assign({}, input), { fields: input.fields.reduce(function (acc, f) {
            // If the field is a key, make it non-null.
            if (keyFields.find(function (k) { return k === f.name.value; })) {
                return __spreadArrays(acc, [graphql_transformer_common_1.makeInputValueDefinition(f.name.value, graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.getBaseType(f.type))))]);
            }
            return __spreadArrays(acc, [f]);
        }, []) });
}
;
// Key fields are non-nullable, non-key fields are not non-nullable.
function replaceUpdateInput(definition, input, keyFields) {
    return __assign(__assign({}, input), { fields: input.fields.map(function (f) {
            if (keyFields.find(function (k) { return k === f.name.value; })) {
                return graphql_transformer_common_1.makeInputValueDefinition(f.name.value, graphql_transformer_common_1.wrapNonNull(graphql_transformer_common_1.withNamedNodeNamed(f.type, graphql_transformer_common_1.getBaseType(f.type))));
            }
            else {
                return f;
            }
        }) });
}
;
// Key fields are non-nullable, non-key fields are not non-nullable.
function replaceDeleteInput(definition, input, keyFields) {
    return __assign(__assign({}, input), { fields: primaryIdFields(definition, keyFields) });
}
;
/**
 * Return a VTL object containing the compressed key information.
 * @param args The arguments of the @key directive.
 */
function modelObjectKey(args, isMutation) {
    var _a, _b, _c;
    var argsPrefix = isMutation ?
        'ctx.args.input' :
        'ctx.args';
    if (args.fields.length > 2) {
        var rangeKeyFields = args.fields.slice(1);
        var condensedSortKey = condenseRangeKey(rangeKeyFields);
        var condensedSortKeyValue = condenseRangeKey(rangeKeyFields.map(function (keyField) { return "${" + argsPrefix + "." + keyField + "}"; }));
        return graphql_mapping_template_1.obj((_a = {},
            _a[args.fields[0]] = graphql_mapping_template_1.ref("util.dynamodb.toDynamoDB($" + argsPrefix + "." + args.fields[0] + ")"),
            _a[condensedSortKey] = graphql_mapping_template_1.ref("util.dynamodb.toDynamoDB(\"" + condensedSortKeyValue + "\")"),
            _a));
    }
    else if (args.fields.length === 2) {
        return graphql_mapping_template_1.obj((_b = {},
            _b[args.fields[0]] = graphql_mapping_template_1.ref("util.dynamodb.toDynamoDB($" + argsPrefix + "." + args.fields[0] + ")"),
            _b[args.fields[1]] = graphql_mapping_template_1.ref("util.dynamodb.toDynamoDB($" + argsPrefix + "." + args.fields[1] + ")"),
            _b));
    }
    else if (args.fields.length === 1) {
        return graphql_mapping_template_1.obj((_c = {},
            _c[args.fields[0]] = graphql_mapping_template_1.ref("util.dynamodb.toDynamoDB($" + argsPrefix + "." + args.fields[0] + ")"),
            _c));
    }
    throw new graphql_transformer_core_1.InvalidDirectiveError('@key directives must include at least one field.');
}
function ensureCompositeKeySnippet(dir) {
    var _a;
    var args = graphql_transformer_core_1.getDirectiveArguments(dir);
    var argsPrefix = 'ctx.args.input';
    if (args.fields.length > 2) {
        var rangeKeyFields = args.fields.slice(1);
        var condensedSortKey = condenseRangeKey(rangeKeyFields);
        var dynamoDBFriendlySortKeyName = graphql_transformer_common_1.toCamelCase(rangeKeyFields.map(function (f) { return graphql_transformer_common_1.graphqlName(f); }));
        var condensedSortKeyValue = condenseRangeKey(rangeKeyFields.map(function (keyField) { return "${" + argsPrefix + "." + keyField + "}"; }));
        return graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw("$util.isNull($" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.DynamoDBNameOverrideMap + ")"), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.DynamoDBNameOverrideMap), graphql_mapping_template_1.obj((_a = {},
                _a[condensedSortKey] = graphql_mapping_template_1.str(dynamoDBFriendlySortKeyName),
                _a))), graphql_mapping_template_1.qref("$" + graphql_transformer_common_1.ResourceConstants.SNIPPETS.DynamoDBNameOverrideMap + ".put(\"" + condensedSortKey + "\", \"" + dynamoDBFriendlySortKeyName + "\")")),
            graphql_mapping_template_1.qref("$ctx.args.input.put(\"" + condensedSortKey + "\",\"" + condensedSortKeyValue + "\")")
        ]));
    }
    return '';
}
function condenseRangeKey(fields) {
    return fields.join(graphql_transformer_common_1.ModelResourceIDs.ModelCompositeKeySeparator());
}
function makeQueryResolver(definition, directive, ctx) {
    var type = definition.name.value;
    var directiveArgs = graphql_transformer_core_1.getDirectiveArguments(directive);
    var index = directiveArgs.name;
    var fieldName = directiveArgs.queryField;
    var queryTypeName = ctx.getQueryTypeName();
    var defaultPageLimit = 10;
    var requestVariable = 'QueryRequest';
    return new cloudform_types_1.AppSync.Resolver({
        ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
        DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(type), 'Name'),
        FieldName: fieldName,
        TypeName: queryTypeName,
        RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
            setQuerySnippet(definition, directive, ctx),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('limit'), graphql_mapping_template_1.ref("util.defaultIfNull($context.args.limit, " + defaultPageLimit + ")")),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable), graphql_mapping_template_1.obj({
                version: graphql_mapping_template_1.str('2017-02-28'),
                operation: graphql_mapping_template_1.str('Query'),
                limit: graphql_mapping_template_1.ref('limit'),
                query: graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelQueryExpression),
                index: graphql_mapping_template_1.str(index)
            })),
            graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw("!$util.isNull($ctx.args.sortDirection)\n                    && $ctx.args.sortDirection == \"DESC\""), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".scanIndexForward"), graphql_mapping_template_1.bool(false)), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".scanIndexForward"), graphql_mapping_template_1.bool(true))),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('context.args.nextToken'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".nextToken"), graphql_mapping_template_1.str('$context.args.nextToken')), true),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.ref('context.args.filter'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref(requestVariable + ".filter"), graphql_mapping_template_1.ref('util.parseJson("$util.transform.toDynamoDBFilterExpression($ctx.args.filter)")')), true),
            graphql_mapping_template_1.raw("$util.toJson($" + requestVariable + ")")
        ])),
        ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.raw('$util.toJson($ctx.result)'))
    });
}
function setQuerySnippet(definition, directive, ctx) {
    var args = graphql_transformer_core_1.getDirectiveArguments(directive);
    var keys = args.fields;
    var keyTypes = keys.map(function (k) {
        var field = definition.fields.find(function (f) { return f.name.value === k; });
        return attributeTypeFromType(field.type, ctx);
    });
    return graphql_mapping_template_1.block("Set query expression for @key", [
        graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelQueryExpression), graphql_mapping_template_1.obj({})),
        graphql_transformer_common_1.applyKeyExpressionForCompositeKey(keys, keyTypes, graphql_transformer_common_1.ResourceConstants.SNIPPETS.ModelQueryExpression)
    ]);
}
function addHashField(definition, args, elems) {
    var hashFieldName = args.fields[0];
    var hashField = definition.fields.find(function (field) { return field.name.value === hashFieldName; });
    var hashKey = graphql_transformer_common_1.makeInputValueDefinition(hashFieldName, graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.getBaseType(hashField.type)));
    return __spreadArrays([hashKey], elems);
}
function addSimpleSortKey(ctx, definition, args, elems) {
    var sortKeyName = args.fields[1];
    var sortField = definition.fields.find(function (field) { return field.name.value === sortKeyName; });
    var baseType = graphql_transformer_common_1.getBaseType(sortField.type);
    var resolvedTypeIfEnum = ctx.getType(baseType) ? 'String' : undefined;
    var resolvedType = resolvedTypeIfEnum ? resolvedTypeIfEnum : baseType;
    var hashKey = graphql_transformer_common_1.makeInputValueDefinition(sortKeyName, graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelKeyConditionInputTypeName(resolvedType)));
    return __spreadArrays([hashKey], elems);
}
function addCompositeSortKey(definition, args, elems) {
    var sortKeyNames = args.fields.slice(1);
    var compositeSortKeyName = graphql_transformer_common_1.toCamelCase(sortKeyNames);
    var hashKey = graphql_transformer_common_1.makeInputValueDefinition(compositeSortKeyName, graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelCompositeKeyConditionInputTypeName(definition.name.value, graphql_transformer_common_1.toUpper(args.name || 'Primary'))));
    return __spreadArrays([hashKey], elems);
}
function joinSnippets(lines) {
    return lines.join('\n');
}
var templateObject_1;
//# sourceMappingURL=KeyTransformer.js.map