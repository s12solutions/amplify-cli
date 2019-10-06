"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var table_1 = require("cloudform-types/types/dynamoDb/table");
var resolver_1 = require("cloudform-types/types/appSync/resolver");
var cloudform_types_1 = require("cloudform-types");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var ResourceFactory = /** @class */ (function () {
    function ResourceFactory() {
    }
    ResourceFactory.prototype.makeParams = function () {
        return {};
    };
    /**
     * Creates the barebones template for an application.
     */
    ResourceFactory.prototype.initTemplate = function () {
        return {
            Parameters: this.makeParams(),
            Resources: {},
            Outputs: {}
        };
    };
    /**
     * Add a GSI for the connection if one does not already exist.
     * @param table The table to add the GSI to.
     */
    ResourceFactory.prototype.updateTableForConnection = function (table, connectionName, connectionAttributeName, sortField) {
        if (sortField === void 0) { sortField = null; }
        var gsis = table.Properties.GlobalSecondaryIndexes || [];
        if (gsis.length >= 20) {
            throw new graphql_transformer_core_1.InvalidDirectiveError("Cannot create connection " + connectionName + ". Table " + table.Properties.TableName + " out of GSI capacity.");
        }
        var connectionGSIName = "gsi-" + connectionName;
        // If the GSI does not exist yet then add it.
        var existingGSI = gsis.find(function (gsi) { return gsi.IndexName === connectionGSIName; });
        if (!existingGSI) {
            var keySchema = [new table_1.KeySchema({ AttributeName: connectionAttributeName, KeyType: 'HASH' })];
            if (sortField) {
                keySchema.push(new table_1.KeySchema({ AttributeName: sortField.name, KeyType: 'RANGE' }));
            }
            gsis.push(new table_1.GlobalSecondaryIndex({
                IndexName: connectionGSIName,
                KeySchema: keySchema,
                Projection: new table_1.Projection({
                    ProjectionType: 'ALL'
                }),
                ProvisionedThroughput: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.ShouldUsePayPerRequestBilling, cloudform_types_1.Refs.NoValue, {
                    ReadCapacityUnits: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableReadIOPS),
                    WriteCapacityUnits: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.DynamoDBModelTableWriteIOPS)
                }),
            }));
        }
        // If the attribute definition does not exist yet, add it.
        var attributeDefinitions = table.Properties.AttributeDefinitions;
        var existingAttribute = attributeDefinitions.find(function (attr) { return attr.AttributeName === connectionAttributeName; });
        if (!existingAttribute) {
            attributeDefinitions.push(new table_1.AttributeDefinition({
                AttributeName: connectionAttributeName,
                AttributeType: 'S'
            }));
        }
        // If the attribute definition does not exist yet, add it.
        if (sortField) {
            var existingSortAttribute = attributeDefinitions.find(function (attr) { return attr.AttributeName === sortField.name; });
            if (!existingSortAttribute) {
                var scalarType = graphql_transformer_common_1.DEFAULT_SCALARS[sortField.type];
                var attributeType = scalarType === 'String' ? 'S' : 'N';
                attributeDefinitions.push(new table_1.AttributeDefinition({ AttributeName: sortField.name, AttributeType: attributeType }));
            }
        }
        table.Properties.GlobalSecondaryIndexes = gsis;
        table.Properties.AttributeDefinitions = attributeDefinitions;
        return table;
    };
    /**
     * Create a get item resolver for singular connections.
     * @param type The parent type name.
     * @param field The connection field name.
     * @param relatedType The name of the related type to fetch from.
     * @param connectionAttribute The name of the underlying attribute containing the id.
     */
    ResourceFactory.prototype.makeGetItemConnectionResolver = function (type, field, relatedType, connectionAttribute) {
        return new resolver_1.default({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(relatedType), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.DynamoDBMappingTemplate.getItem({
                key: graphql_mapping_template_1.obj({
                    id: graphql_mapping_template_1.ref("util.dynamodb.toDynamoDBJson($util.defaultIfNullOrBlank($ctx.source." + connectionAttribute + ", \"" + graphql_transformer_common_1.NONE_VALUE + "\"))")
                })
            })),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ref('util.toJson($context.result)'))
        }).dependsOn(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLSchemaLogicalID);
    };
    /**
     * Create a resolver that queries an item in DynamoDB.
     * @param type
     */
    ResourceFactory.prototype.makeQueryConnectionResolver = function (type, field, relatedType, connectionAttribute, connectionName, sortKeyInfo) {
        var defaultPageLimit = 10;
        var setup = [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('limit'), graphql_mapping_template_1.ref("util.defaultIfNull($context.args.limit, " + defaultPageLimit + ")")),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('query'), graphql_mapping_template_1.obj({
                'expression': graphql_mapping_template_1.str('#connectionAttribute = :connectionAttribute'),
                'expressionNames': graphql_mapping_template_1.obj({
                    '#connectionAttribute': graphql_mapping_template_1.str(connectionAttribute)
                }),
                'expressionValues': graphql_mapping_template_1.obj({
                    ':connectionAttribute': graphql_mapping_template_1.obj({
                        'S': graphql_mapping_template_1.str('$context.source.id')
                    })
                })
            }))
        ];
        if (sortKeyInfo) {
            setup.push(graphql_transformer_common_1.applyKeyConditionExpression(sortKeyInfo.fieldName, sortKeyInfo.attributeType, 'query'));
        }
        return new resolver_1.default({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(relatedType), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(__spreadArrays(setup, [
                graphql_mapping_template_1.DynamoDBMappingTemplate.query({
                    query: graphql_mapping_template_1.raw('$util.toJson($query)'),
                    scanIndexForward: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.sortDirection'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.equals(graphql_mapping_template_1.ref('context.args.sortDirection'), graphql_mapping_template_1.str('ASC')), graphql_mapping_template_1.bool(true), graphql_mapping_template_1.bool(false)), graphql_mapping_template_1.bool(true)),
                    filter: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.filter'), graphql_mapping_template_1.ref('util.transform.toDynamoDBFilterExpression($ctx.args.filter)'), graphql_mapping_template_1.nul()),
                    limit: graphql_mapping_template_1.ref('limit'),
                    nextToken: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.nextToken'), graphql_mapping_template_1.str('$context.args.nextToken'), graphql_mapping_template_1.nul()),
                    index: graphql_mapping_template_1.str("gsi-" + connectionName)
                })
            ]))),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('!$result'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('result'), graphql_mapping_template_1.ref('ctx.result'))),
                graphql_mapping_template_1.raw('$util.toJson($result)')
            ]))
        }).dependsOn(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLSchemaLogicalID);
    };
    // Resources for new way to parameterize @connection
    /**
     * Create a get item resolver for singular connections.
     * @param type The parent type name.
     * @param field The connection field name.
     * @param relatedType The name of the related type to fetch from.
     * @param connectionAttributes The names of the underlying attributes containing the fields to query by.
     * @param keySchema Key schema of the index or table being queried.
     */
    ResourceFactory.prototype.makeGetItemConnectionWithKeyResolver = function (type, field, relatedType, connectionAttributes, keySchema) {
        var _a;
        var partitionKeyName = keySchema[0].AttributeName;
        var keyObj = graphql_mapping_template_1.obj((_a = {},
            _a[partitionKeyName] = graphql_mapping_template_1.ref("util.dynamodb.toDynamoDBJson($util.defaultIfNullOrBlank($ctx.source." + connectionAttributes[0] + ", \"" + graphql_transformer_common_1.NONE_VALUE + "\"))"),
            _a));
        // Add a composite sort key or simple sort key if there is one.
        if (connectionAttributes.length > 2) {
            var rangeKeyFields = connectionAttributes.slice(1);
            var sortKeyName = keySchema[1].AttributeName;
            var condensedSortKeyValue = this.condenseRangeKey(rangeKeyFields.map(function (keyField) { return "${ctx.source." + keyField + "}"; }));
            keyObj.attributes.push([
                sortKeyName,
                graphql_mapping_template_1.ref("util.dynamodb.toDynamoDBJson($util.defaultIfNullOrBlank(\"" + condensedSortKeyValue + "\", \"" + graphql_transformer_common_1.NONE_VALUE + "\"))")
            ]);
        }
        else if (connectionAttributes[1]) {
            var sortKeyName = keySchema[1].AttributeName;
            keyObj.attributes.push([
                sortKeyName,
                graphql_mapping_template_1.ref("util.dynamodb.toDynamoDBJson($util.defaultIfNullOrBlank($ctx.source." + connectionAttributes[1] + ", \"" + graphql_transformer_common_1.NONE_VALUE + "\"))")
            ]);
        }
        return new resolver_1.default({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(relatedType), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.DynamoDBMappingTemplate.getItem({
                    key: keyObj
                })
            ])),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.ref('util.toJson($context.result)'))
        }).dependsOn(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLSchemaLogicalID);
    };
    /**
     * Create a resolver that queries an item in DynamoDB.
     * @param type The parent type name.
     * @param field The connection field name.
     * @param relatedType The related type to fetch from.
     * @param connectionAttributes The names of the underlying attributes containing the fields to query by.
     * @param keySchema The keySchema for the table or index being queried.
     * @param indexName The index to run the query on.
     */
    ResourceFactory.prototype.makeQueryConnectionWithKeyResolver = function (type, field, relatedType, connectionAttributes, keySchema, indexName) {
        var defaultPageLimit = 10;
        var setup = [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('limit'), graphql_mapping_template_1.ref("util.defaultIfNull($context.args.limit, " + defaultPageLimit + ")")),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('query'), this.makeExpression(keySchema, connectionAttributes))
        ];
        // If the key schema has a sort key but one is not provided for the query, let a sort key be
        // passed in via $ctx.args.
        if (keySchema[1] && !connectionAttributes[1]) {
            var sortKeyField = relatedType.fields.find(function (f) { return f.name.value === keySchema[1].AttributeName; });
            if (sortKeyField) {
                setup.push(graphql_transformer_common_1.applyKeyConditionExpression(String(keySchema[1].AttributeName), graphql_transformer_common_1.attributeTypeFromScalar(sortKeyField.type), 'query'));
            }
            else {
                setup.push(graphql_transformer_common_1.applyCompositeKeyConditionExpression(this.getSortKeyNames(String(keySchema[1].AttributeName)), 'query', this.makeCompositeSortKeyName(String(keySchema[1].AttributeName)), String(keySchema[1].AttributeName)));
            }
        }
        var queryArguments = {
            query: graphql_mapping_template_1.raw('$util.toJson($query)'),
            scanIndexForward: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.sortDirection'), graphql_mapping_template_1.ifElse(graphql_mapping_template_1.equals(graphql_mapping_template_1.ref('context.args.sortDirection'), graphql_mapping_template_1.str('ASC')), graphql_mapping_template_1.bool(true), graphql_mapping_template_1.bool(false)), graphql_mapping_template_1.bool(true)),
            filter: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.filter'), graphql_mapping_template_1.ref('util.transform.toDynamoDBFilterExpression($ctx.args.filter)'), graphql_mapping_template_1.nul()),
            limit: graphql_mapping_template_1.ref('limit'),
            nextToken: graphql_mapping_template_1.ifElse(graphql_mapping_template_1.ref('context.args.nextToken'), graphql_mapping_template_1.str('$context.args.nextToken'), graphql_mapping_template_1.nul()),
            index: indexName ? graphql_mapping_template_1.str(indexName) : undefined
        };
        if (!indexName) {
            var indexArg = 'index';
            delete queryArguments[indexArg];
        }
        var queryObj = graphql_mapping_template_1.DynamoDBMappingTemplate.query(queryArguments);
        return new resolver_1.default({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DataSourceName: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(relatedType.name.value), 'Name'),
            FieldName: field,
            TypeName: type,
            RequestMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(__spreadArrays(setup, [
                queryObj
            ]))),
            ResponseMappingTemplate: graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw('!$result'), graphql_mapping_template_1.set(graphql_mapping_template_1.ref('result'), graphql_mapping_template_1.ref('ctx.result'))),
                graphql_mapping_template_1.raw('$util.toJson($result)')
            ]))
        }).dependsOn(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLSchemaLogicalID);
    };
    /**
     * Makes the query expression based on whether there is a sort key to be used for the query
     * or not.
     * @param keySchema The key schema for the table or index being queried.
     * @param connectionAttributes The names of the underlying attributes containing the fields to query by.
     */
    ResourceFactory.prototype.makeExpression = function (keySchema, connectionAttributes) {
        if (keySchema[1] && connectionAttributes[1]) {
            var condensedSortKeyValue = undefined;
            if (connectionAttributes.length > 2) {
                var rangeKeyFields = connectionAttributes.slice(1);
                condensedSortKeyValue = this.condenseRangeKey(rangeKeyFields.map(function (keyField) { return "${context.source." + keyField + "}"; }));
            }
            return graphql_mapping_template_1.obj({
                'expression': graphql_mapping_template_1.str('#partitionKey = :partitionKey AND #sortKey = :sortKey'),
                'expressionNames': graphql_mapping_template_1.obj({
                    '#partitionKey': graphql_mapping_template_1.str(String(keySchema[0].AttributeName)),
                    '#sortKey': graphql_mapping_template_1.str(String(keySchema[1].AttributeName)),
                }),
                'expressionValues': graphql_mapping_template_1.obj({
                    ':partitionKey': graphql_mapping_template_1.obj({
                        'S': graphql_mapping_template_1.str("$context.source." + connectionAttributes[0])
                    }),
                    ':sortKey': graphql_mapping_template_1.obj({
                        'S': graphql_mapping_template_1.str(condensedSortKeyValue || "$context.source." + connectionAttributes[1])
                    }),
                })
            });
        }
        return graphql_mapping_template_1.obj({
            'expression': graphql_mapping_template_1.str('#partitionKey = :partitionKey'),
            'expressionNames': graphql_mapping_template_1.obj({
                '#partitionKey': graphql_mapping_template_1.str(String(keySchema[0].AttributeName))
            }),
            'expressionValues': graphql_mapping_template_1.obj({
                ':partitionKey': graphql_mapping_template_1.obj({
                    'S': graphql_mapping_template_1.str("$context.source." + connectionAttributes[0])
                })
            })
        });
    };
    ResourceFactory.prototype.condenseRangeKey = function (fields) {
        return fields.join(graphql_transformer_common_1.ModelResourceIDs.ModelCompositeKeySeparator());
    };
    ResourceFactory.prototype.makeCompositeSortKeyName = function (sortKeyName) {
        var attributeNames = sortKeyName.split(graphql_transformer_common_1.ModelResourceIDs.ModelCompositeKeySeparator());
        return graphql_transformer_common_1.toCamelCase(attributeNames);
    };
    ResourceFactory.prototype.getSortKeyNames = function (compositeSK) {
        return compositeSK.split(graphql_transformer_common_1.ModelResourceIDs.ModelCompositeKeySeparator());
    };
    return ResourceFactory;
}());
exports.ResourceFactory = ResourceFactory;
//# sourceMappingURL=resources.js.map