"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const RelationalDBSchemaTransformerUtils_1 = require("./RelationalDBSchemaTransformerUtils");
const RelationalDBParsingException_1 = require("./RelationalDBParsingException");
const graphql_transformer_common_1 = require("graphql-transformer-common");
/**
 * This class is used to transition all of the columns and key metadata from a table for use
 * in generating appropriate GraphQL schema structures. It will track type definitions for
 * the base table, update mutation inputs, create mutation inputs, and primary key metadata.
 */
class TableContext {
    constructor(typeDefinition, createDefinition, updateDefinition, primaryKeyField, primaryKeyType, stringFieldList, intFieldList) {
        this.tableTypeDefinition = typeDefinition;
        this.tableKeyField = primaryKeyField;
        this.createTypeDefinition = createDefinition;
        this.updateTypeDefinition = updateDefinition;
        this.tableKeyFieldType = primaryKeyType;
        this.stringFieldList = stringFieldList;
        this.intFieldList = intFieldList;
    }
}
exports.TableContext = TableContext;
/**
 * This class is used to transition all of the information needed to generate the
 * CloudFormation template. This is the class that is outputted by the SchemaTransformer and the one that
 * RelationalDBTemplateGenerator takes in for the constructor. It tracks the graphql schema document,
 * map of the primary keys for each of the types. It is also being used to track the CLI inputs needed
 * for DataSource Creation, as data source creation is apart of the cfn template generation.
 */
class TemplateContext {
    constructor(schemaDoc, typePrimaryKeyMap, stringFieldMap, intFieldMap, typePrimaryKeyTypeMap) {
        this.schemaDoc = schemaDoc;
        this.typePrimaryKeyMap = typePrimaryKeyMap;
        this.stringFieldMap = stringFieldMap;
        this.intFieldMap = intFieldMap;
        this.typePrimaryKeyTypeMap = typePrimaryKeyTypeMap;
    }
}
exports.default = TemplateContext;
class RelationalDBSchemaTransformer {
    constructor(dbReader, database) {
        this.introspectDatabaseSchema = () => __awaiter(this, void 0, void 0, function* () {
            // Get all of the tables within the provided db
            let tableNames = null;
            try {
                tableNames = yield this.dbReader.listTables();
            }
            catch (err) {
                throw new RelationalDBParsingException_1.RelationalDBParsingException(`Failed to list tables in ${this.database}`, err.stack);
            }
            let typeContexts = new Array();
            let types = new Array();
            let pkeyMap = new Map();
            let pkeyTypeMap = new Map();
            let stringFieldMap = new Map();
            let intFieldMap = new Map();
            for (const tableName of tableNames) {
                let type = null;
                try {
                    type = yield this.dbReader.describeTable(tableName);
                }
                catch (err) {
                    throw new RelationalDBParsingException_1.RelationalDBParsingException(`Failed to describe table ${tableName}`, err.stack);
                }
                // NOTE from @mikeparisstuff. The GraphQL schema generation breaks
                // when the table does not have an explicit primary key.
                if (type.tableKeyField) {
                    typeContexts.push(type);
                    // Generate the 'connection' type for each table type definition
                    // TODO: Determine if Connection is needed as Data API doesn't provide pagination
                    // TODO: As we add different db sources, we should conditionally do this even if we don't for Aurora serverless.
                    //types.push(this.getConnectionType(tableName))
                    // Generate the create operation input for each table type definition
                    types.push(type.createTypeDefinition);
                    // Generate the default shape for the table's structure
                    types.push(type.tableTypeDefinition);
                    // Generate the update operation input for each table type definition
                    types.push(type.updateTypeDefinition);
                    // Update the field map with the new field lists for the current table
                    stringFieldMap.set(tableName, type.stringFieldList);
                    intFieldMap.set(tableName, type.intFieldList);
                    pkeyMap.set(tableName, type.tableKeyField);
                    pkeyTypeMap.set(tableName, type.tableKeyFieldType);
                }
                else {
                    console.warn(`Skipping table ${type.tableTypeDefinition.name.value} because it does not have a single PRIMARY KEY.`);
                }
            }
            // Generate the mutations and queries based on the table structures
            types.push(this.getMutations(typeContexts));
            types.push(this.getQueries(typeContexts));
            types.push(this.getSubscriptions(typeContexts));
            types.push(this.getSchemaType());
            let context = this.dbReader.hydrateTemplateContext(new TemplateContext({ kind: graphql_1.Kind.DOCUMENT,
                definitions: types }, pkeyMap, stringFieldMap, intFieldMap, pkeyTypeMap));
            return context;
        });
        this.dbReader = dbReader;
        this.database = database;
    }
    /**
     * Creates a schema type definition node, including operations for each of query, mutation, and subscriptions.
     *
     * @returns a basic schema definition node.
     */
    getSchemaType() {
        return {
            kind: graphql_1.Kind.SCHEMA_DEFINITION,
            directives: [],
            operationTypes: [
                RelationalDBSchemaTransformerUtils_1.getOperationTypeDefinition('query', RelationalDBSchemaTransformerUtils_1.getNamedType('Query')),
                RelationalDBSchemaTransformerUtils_1.getOperationTypeDefinition('mutation', RelationalDBSchemaTransformerUtils_1.getNamedType('Mutation')),
                RelationalDBSchemaTransformerUtils_1.getOperationTypeDefinition('subscription', RelationalDBSchemaTransformerUtils_1.getNamedType('Subscription'))
            ]
        };
    }
    /**
     * Generates the basic mutation operations, given the provided table contexts. This will
     * create a create, delete, and update operation for each table.
     *
     * @param types the table contexts from which the mutations are to be generated.
     * @returns the type definition for mutations, including a create, delete, and update for each table.
     */
    getMutations(types) {
        const fields = [];
        for (const typeContext of types) {
            const type = typeContext.tableTypeDefinition;
            const formattedTypeValue = graphql_transformer_common_1.toUpper(type.name.value);
            fields.push(RelationalDBSchemaTransformerUtils_1.getOperationFieldDefinition(`delete${formattedTypeValue}`, [RelationalDBSchemaTransformerUtils_1.getInputValueDefinition(RelationalDBSchemaTransformerUtils_1.getNonNullType(RelationalDBSchemaTransformerUtils_1.getNamedType(typeContext.tableKeyFieldType)), typeContext.tableKeyField)], RelationalDBSchemaTransformerUtils_1.getNamedType(`${type.name.value}`), null));
            fields.push(RelationalDBSchemaTransformerUtils_1.getOperationFieldDefinition(`create${formattedTypeValue}`, [RelationalDBSchemaTransformerUtils_1.getInputValueDefinition(RelationalDBSchemaTransformerUtils_1.getNonNullType(RelationalDBSchemaTransformerUtils_1.getNamedType(`Create${formattedTypeValue}Input`)), `create${formattedTypeValue}Input`)], RelationalDBSchemaTransformerUtils_1.getNamedType(`${type.name.value}`), null));
            fields.push(RelationalDBSchemaTransformerUtils_1.getOperationFieldDefinition(`update${formattedTypeValue}`, [RelationalDBSchemaTransformerUtils_1.getInputValueDefinition(RelationalDBSchemaTransformerUtils_1.getNonNullType(RelationalDBSchemaTransformerUtils_1.getNamedType(`Update${formattedTypeValue}Input`)), `update${formattedTypeValue}Input`)], RelationalDBSchemaTransformerUtils_1.getNamedType(`${type.name.value}`), null));
        }
        return RelationalDBSchemaTransformerUtils_1.getTypeDefinition(fields, 'Mutation');
    }
    /**
     * Generates the basic subscription operations, given the provided table contexts. This will
     * create an onCreate subscription for each table.
     *
     * @param types the table contexts from which the subscriptions are to be generated.
     * @returns the type definition for subscriptions, including an onCreate for each table.
     */
    getSubscriptions(types) {
        const fields = [];
        for (const typeContext of types) {
            const type = typeContext.tableTypeDefinition;
            const formattedTypeValue = graphql_transformer_common_1.toUpper(type.name.value);
            fields.push(RelationalDBSchemaTransformerUtils_1.getOperationFieldDefinition(`onCreate${formattedTypeValue}`, [], RelationalDBSchemaTransformerUtils_1.getNamedType(`${type.name.value}`), [RelationalDBSchemaTransformerUtils_1.getDirectiveNode(`create${formattedTypeValue}`)]));
        }
        return RelationalDBSchemaTransformerUtils_1.getTypeDefinition(fields, 'Subscription');
    }
    /**
     * Generates the basic query operations, given the provided table contexts. This will
     * create a get and list operation for each table.
     *
     * @param types the table contexts from which the queries are to be generated.
     * @returns the type definition for queries, including a get and list for each table.
     */
    getQueries(types) {
        const fields = [];
        for (const typeContext of types) {
            const type = typeContext.tableTypeDefinition;
            const formattedTypeValue = graphql_transformer_common_1.toUpper(type.name.value);
            fields.push(RelationalDBSchemaTransformerUtils_1.getOperationFieldDefinition(`get${formattedTypeValue}`, [RelationalDBSchemaTransformerUtils_1.getInputValueDefinition(RelationalDBSchemaTransformerUtils_1.getNonNullType(RelationalDBSchemaTransformerUtils_1.getNamedType(typeContext.tableKeyFieldType)), typeContext.tableKeyField)], RelationalDBSchemaTransformerUtils_1.getNamedType(`${type.name.value}`), null));
            fields.push(RelationalDBSchemaTransformerUtils_1.getOperationFieldDefinition(`list${formattedTypeValue}s`, [], RelationalDBSchemaTransformerUtils_1.getNamedType(`[${type.name.value}]`), null));
        }
        return RelationalDBSchemaTransformerUtils_1.getTypeDefinition(fields, 'Query');
    }
    /**
     * Creates a GraphQL connection type for a given GraphQL type, corresponding to a SQL table name.
     *
     * @param tableName the name of the SQL table (and GraphQL type).
     * @returns a type definition node defining the connection type for the provided type name.
     */
    getConnectionType(tableName) {
        return RelationalDBSchemaTransformerUtils_1.getTypeDefinition([
            RelationalDBSchemaTransformerUtils_1.getFieldDefinition('items', RelationalDBSchemaTransformerUtils_1.getNamedType(`[${tableName}]`)),
            RelationalDBSchemaTransformerUtils_1.getFieldDefinition('nextToken', RelationalDBSchemaTransformerUtils_1.getNamedType('String'))
        ], `${tableName}Connection`);
    }
}
exports.RelationalDBSchemaTransformer = RelationalDBSchemaTransformer;
//# sourceMappingURL=RelationalDBSchemaTransformer.js.map