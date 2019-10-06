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
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var resources_1 = require("./resources");
var definitions_1 = require("./definitions");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_mapping_template_1 = require("graphql-mapping-template");
var graphql_transformer_common_2 = require("graphql-transformer-common");
var path = require("path");
var STACK_NAME = 'SearchableStack';
var nonKeywordTypes = ["Int", "Float", "Boolean", "AWSTimestamp", "AWSDate", "AWSDateTime"];
/**
 * Handles the @searchable directive on OBJECT types.
 */
var SearchableModelTransformer = /** @class */ (function (_super) {
    __extends(SearchableModelTransformer, _super);
    function SearchableModelTransformer() {
        var _this = _super.call(this, "SearchableModelTransformer", graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            directive @searchable(queries: SearchableQueryMap) on OBJECT\n            input SearchableQueryMap { search: String }\n            "], ["\n            directive @searchable(queries: SearchableQueryMap) on OBJECT\n            input SearchableQueryMap { search: String }\n            "])))) || this;
        _this.before = function (ctx) {
            var template = _this.resources.initTemplate();
            ctx.mergeResources(template.Resources);
            ctx.mergeParameters(template.Parameters);
            ctx.mergeOutputs(template.Outputs);
            ctx.mergeMappings(template.Mappings);
            ctx.metadata.set('ElasticsearchPathToStreamingLambda', path.resolve(__dirname + "/../lib/streaming-lambda.zip"));
            for (var _i = 0, _a = Object.keys(template.Resources); _i < _a.length; _i++) {
                var resourceId = _a[_i];
                ctx.mapResourceToStack(STACK_NAME, resourceId);
            }
            for (var _b = 0, _c = Object.keys(template.Outputs); _b < _c.length; _b++) {
                var outputId = _c[_b];
                ctx.mapResourceToStack(STACK_NAME, outputId);
            }
            for (var _d = 0, _e = Object.keys(template.Mappings); _d < _e.length; _d++) {
                var mappingId = _e[_d];
                ctx.mapResourceToStack(STACK_NAME, mappingId);
            }
        };
        /**
         * Given the initial input and context manipulate the context to handle this object directive.
         * @param initial The input passed to the transform.
         * @param ctx The accumulated context for the transform.
         */
        _this.object = function (def, directive, ctx) {
            var modelDirective = def.directives.find(function (dir) { return dir.name.value === 'model'; });
            if (!modelDirective) {
                throw new graphql_transformer_core_1.InvalidDirectiveError('Types annotated with @searchable must also be annotated with @model.');
            }
            var directiveArguments = graphql_transformer_core_1.getDirectiveArguments(directive);
            var shouldMakeSearch = true;
            var searchFieldNameOverride = undefined;
            // Figure out which queries to make and if they have name overrides.
            if (directiveArguments.queries) {
                if (!directiveArguments.queries.search) {
                    shouldMakeSearch = false;
                }
                else {
                    searchFieldNameOverride = directiveArguments.queries.search;
                }
            }
            var typeName = def.name.value;
            ctx.setResource(graphql_transformer_common_2.SearchableResourceIDs.SearchableEventSourceMappingID(typeName), _this.resources.makeDynamoDBStreamEventSourceMapping(typeName));
            ctx.mapResourceToStack(STACK_NAME, graphql_transformer_common_2.SearchableResourceIDs.SearchableEventSourceMappingID(typeName));
            // SearchablePostSortableFields
            var queryFields = [];
            var nonKeywordFields = [];
            def.fields.forEach(function (field) {
                if (nonKeywordTypes.includes(graphql_transformer_common_2.getBaseType(field.type))) {
                    nonKeywordFields.push(graphql_mapping_template_1.str(field.name.value));
                }
            });
            // Get primary key to use as the default sort field
            var primaryKey = _this.getPrimaryKey(ctx, typeName);
            // Create list
            if (shouldMakeSearch) {
                _this.generateSearchableInputs(ctx, def);
                _this.generateSearchableXConnectionType(ctx, def);
                var searchResolver = _this.resources.makeSearchResolver(def.name.value, nonKeywordFields, primaryKey, ctx.getQueryTypeName(), searchFieldNameOverride);
                ctx.setResource(graphql_transformer_common_2.ResolverResourceIDs.ElasticsearchSearchResolverResourceID(def.name.value), searchResolver);
                ctx.mapResourceToStack(STACK_NAME, graphql_transformer_common_2.ResolverResourceIDs.ElasticsearchSearchResolverResourceID(def.name.value));
                queryFields.push(graphql_transformer_common_1.makeField(searchResolver.Properties.FieldName, [
                    graphql_transformer_common_1.makeInputValueDefinition('filter', graphql_transformer_common_1.makeNamedType("Searchable" + def.name.value + "FilterInput")),
                    graphql_transformer_common_1.makeInputValueDefinition('sort', graphql_transformer_common_1.makeNamedType("Searchable" + def.name.value + "SortInput")),
                    graphql_transformer_common_1.makeInputValueDefinition('limit', graphql_transformer_common_1.makeNamedType('Int')),
                    graphql_transformer_common_1.makeInputValueDefinition('nextToken', graphql_transformer_common_1.makeNamedType('String'))
                ], graphql_transformer_common_1.makeNamedType("Searchable" + def.name.value + "Connection")));
            }
            ctx.addQueryFields(queryFields);
        };
        _this.resources = new resources_1.ResourceFactory();
        return _this;
    }
    SearchableModelTransformer.prototype.generateSearchableXConnectionType = function (ctx, def) {
        var searchableXConnectionName = "Searchable" + def.name.value + "Connection";
        if (this.typeExist(searchableXConnectionName, ctx)) {
            return;
        }
        // Create the TableXConnection
        var connectionType = graphql_transformer_common_1.blankObject(searchableXConnectionName);
        ctx.addObject(connectionType);
        // Create TableXConnection type with items and nextToken
        var connectionTypeExtension = graphql_transformer_common_1.blankObjectExtension(searchableXConnectionName);
        connectionTypeExtension = graphql_transformer_common_1.extensionWithFields(connectionTypeExtension, [graphql_transformer_common_1.makeField('items', [], graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(def.name.value)))]);
        connectionTypeExtension = graphql_transformer_common_1.extensionWithFields(connectionTypeExtension, [graphql_transformer_common_1.makeField('nextToken', [], graphql_transformer_common_1.makeNamedType('String'))]);
        ctx.addObjectExtension(connectionTypeExtension);
    };
    SearchableModelTransformer.prototype.typeExist = function (type, ctx) {
        return Boolean(type in ctx.nodeMap);
    };
    SearchableModelTransformer.prototype.generateSearchableInputs = function (ctx, def) {
        // Create the Scalar filter inputs
        if (!this.typeExist('SearchableStringFilterInput', ctx)) {
            var searchableStringFilterInput = definitions_1.makeSearchableScalarInputObject('String');
            ctx.addInput(searchableStringFilterInput);
        }
        if (!this.typeExist('SearchableIDFilterInput', ctx)) {
            var searchableIDFilterInput = definitions_1.makeSearchableScalarInputObject('ID');
            ctx.addInput(searchableIDFilterInput);
        }
        if (!this.typeExist('SearchableIntFilterInput', ctx)) {
            var searchableIntFilterInput = definitions_1.makeSearchableScalarInputObject('Int');
            ctx.addInput(searchableIntFilterInput);
        }
        if (!this.typeExist('SearchableFloatFilterInput', ctx)) {
            var searchableFloatFilterInput = definitions_1.makeSearchableScalarInputObject('Float');
            ctx.addInput(searchableFloatFilterInput);
        }
        if (!this.typeExist('SearchableBooleanFilterInput', ctx)) {
            var searchableBooleanFilterInput = definitions_1.makeSearchableScalarInputObject('Boolean');
            ctx.addInput(searchableBooleanFilterInput);
        }
        var searchableXQueryFilterInput = definitions_1.makeSearchableXFilterInputObject(def);
        if (!this.typeExist(searchableXQueryFilterInput.name.value, ctx)) {
            ctx.addInput(searchableXQueryFilterInput);
        }
        if (!this.typeExist('SearchableSortDirection', ctx)) {
            var searchableSortDirection = definitions_1.makeSearchableSortDirectionEnumObject();
            ctx.addEnum(searchableSortDirection);
        }
        if (!this.typeExist("Searchable" + def.name.value + "SortableFields", ctx)) {
            var searchableXSortableFieldsDirection = definitions_1.makeSearchableXSortableFieldsEnumObject(def);
            ctx.addEnum(searchableXSortableFieldsDirection);
        }
        if (!this.typeExist("Searchable" + def.name.value + "SortInput", ctx)) {
            var searchableXSortableInputDirection = definitions_1.makeSearchableXSortInputObject(def);
            ctx.addInput(searchableXSortableInputDirection);
        }
    };
    SearchableModelTransformer.prototype.getPrimaryKey = function (ctx, typeName) {
        var tableResourceID = graphql_transformer_common_2.ModelResourceIDs.ModelTableResourceID(typeName);
        var tableResource = ctx.getResource(tableResourceID);
        var primaryKeySchemaElement = tableResource.Properties.KeySchema.find(function (keyElement) { return keyElement.KeyType === 'HASH'; });
        return primaryKeySchemaElement.AttributeName;
    };
    return SearchableModelTransformer;
}(graphql_transformer_core_1.Transformer));
exports.SearchableModelTransformer = SearchableModelTransformer;
var templateObject_1;
//# sourceMappingURL=SearchableModelTransformer.js.map