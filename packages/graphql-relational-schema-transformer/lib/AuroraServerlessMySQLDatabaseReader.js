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
const RelationalDBSchemaTransformer_1 = require("./RelationalDBSchemaTransformer");
const RelationalDBSchemaTransformerUtils_1 = require("./RelationalDBSchemaTransformerUtils");
const AuroraDataAPIClient_1 = require("./AuroraDataAPIClient");
const graphql_transformer_common_1 = require("graphql-transformer-common");
/**
 * A class to manage interactions with a Aurora Serverless MySQL Relational Databse
 * using the Aurora Data API
 */
class AuroraServerlessMySQLDatabaseReader {
    constructor(dbRegion, awsSecretStoreArn, dbClusterOrInstanceArn, database, aws) {
        /**
         * Stores some of the Aurora Serverless MySQL context into the template context,
         * for later consumption.
         *
         * @param contextShell the basic template context, with db source independent fields set.
         * @returns a fully hydrated template context, complete with Aurora Serverless MySQL context.
         */
        this.hydrateTemplateContext = (contextShell) => __awaiter(this, void 0, void 0, function* () {
            /**
             * Information needed for creating the AppSync - RDS Data Source
             * Store as part of the TemplateContext
             */
            contextShell.secretStoreArn = this.awsSecretStoreArn;
            contextShell.rdsClusterIdentifier = this.dbClusterOrInstanceArn;
            contextShell.databaseSchema = 'mysql';
            contextShell.databaseName = this.database;
            contextShell.region = this.dbRegion;
            return contextShell;
        });
        /**
         * Gets a list of all the table names in the provided database.
         *
         * @returns a list of tablenames inside the database.
         */
        this.listTables = () => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.auroraClient.listTables();
            return results;
        });
        /**
         * Looks up any foreign key constraints that might exist for the provided table.
         * This is done to ensure our generated schema includes nested types, where possible.
         *
         * @param tableName the name of the table to be checked for foreign key constraints.
         * @returns a list of table names that are applicable as having constraints.
         */
        this.getTableForeignKeyReferences = (tableName) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.auroraClient.getTableForeignKeyReferences(tableName);
            return results;
        });
        /**
         * For the provided table, this will create a table context. That context holds definitions for
         * the base table type, the create input type, and the update input type (e.g. Post, CreatePostInput, and UpdatePostInput, respectively),
         * as well as the table primary key structure for proper operation definition.
         *
         * Create inputs will only differ from the base table type in that any nested types will not be present. Update table
         * inputs will differ in that the only required field will be the primary key/identifier, as all fields don't have to
         * be updated. Instead, it assumes the proper ones were provided on create.
         *
         * @param tableName the name of the table to be translated into a GraphQL type.
         * @returns a promise of a table context structure.
         */
        this.describeTable = (tableName) => __awaiter(this, void 0, void 0, function* () {
            const columnDescriptions = yield this.auroraClient.describeTable(tableName);
            // Fields in the general type (e.g. Post). Both the identifying field and any others the db dictates will be required.
            const fields = new Array();
            // Fields in the update input type (e.g. UpdatePostInput). Only the identifying field will be required, any others will be optional.
            const updateFields = new Array();
            // Field in the create input type (e.g. CreatePostInput).
            const createFields = new Array();
            // The primary key, used to help generate queries and mutations
            let primaryKey = "";
            let primaryKeyType = "";
            // Field Lists needed as context for auto-generating the Query Resolvers
            const intFieldList = new Array();
            const stringFieldList = new Array();
            const formattedTableName = graphql_transformer_common_1.toUpper(tableName);
            for (const columnDescription of columnDescriptions) {
                // If a field is the primary key, save it.
                if (columnDescription.Key == 'PRI') {
                    primaryKey = columnDescription.Field;
                    primaryKeyType = RelationalDBSchemaTransformerUtils_1.getGraphQLTypeFromMySQLType(columnDescription.Type);
                }
                else {
                    /**
                     * If the field is not a key, then store it in the fields list.
                     * As we need this information later to generate query resolvers
                     *
                     * Currently we will only auto-gen query resolvers for the Int and String scalars
                     */
                    const type = RelationalDBSchemaTransformerUtils_1.getGraphQLTypeFromMySQLType(columnDescription.Type);
                    if (type === 'Int') {
                        intFieldList.push(columnDescription.Field);
                    }
                    else if (type === 'String') {
                        stringFieldList.push(columnDescription.Field);
                    }
                }
                // Create the basic field type shape, to be consumed by every field definition
                const baseType = RelationalDBSchemaTransformerUtils_1.getNamedType(RelationalDBSchemaTransformerUtils_1.getGraphQLTypeFromMySQLType(columnDescription.Type));
                const isPrimaryKey = columnDescription.Key == 'PRI';
                const isNullable = columnDescription.Null == 'YES';
                // Generate the field for the general type and the create input type
                const type = (!isPrimaryKey && isNullable) ? baseType : RelationalDBSchemaTransformerUtils_1.getNonNullType(baseType);
                fields.push(RelationalDBSchemaTransformerUtils_1.getFieldDefinition(columnDescription.Field, type));
                createFields.push(RelationalDBSchemaTransformerUtils_1.getInputValueDefinition(type, columnDescription.Field));
                // Update<type>Input has only the primary key as required, ignoring all other that the database requests as non-nullable
                const updateType = !isPrimaryKey ? baseType : RelationalDBSchemaTransformerUtils_1.getNonNullType(baseType);
                updateFields.push(RelationalDBSchemaTransformerUtils_1.getInputValueDefinition(updateType, columnDescription.Field));
            }
            // Add foreign key for this table
            // NOTE from @mikeparisstuff: It would be great to re-enable this such that foreign key relationships are
            // resolver automatically. This code was breaking compilation because it was not
            // creating XConnection types correctly. This package also does not yet support
            // wiring up the resolvers (or ideally selection set introspection & automatic JOINs)
            // so there is not point in creating these connection fields anyway. Disabling until
            // supported.
            // let tablesWithRef = await this.getTableForeignKeyReferences(tableName)
            // for (const tableWithRef of tablesWithRef) {
            //     if (tableWithRef && tableWithRef.length > 0) {
            //         const baseType = getNamedType(`${tableWithRef}Connection`)
            //         fields.push(getFieldDefinition(`${tableWithRef}`, baseType))
            //     }
            // }
            return new RelationalDBSchemaTransformer_1.TableContext(RelationalDBSchemaTransformerUtils_1.getTypeDefinition(fields, tableName), RelationalDBSchemaTransformerUtils_1.getInputTypeDefinition(createFields, `Create${formattedTableName}Input`), RelationalDBSchemaTransformerUtils_1.getInputTypeDefinition(updateFields, `Update${formattedTableName}Input`), primaryKey, primaryKeyType, stringFieldList, intFieldList);
        });
        this.auroraClient = new AuroraDataAPIClient_1.AuroraDataAPIClient(dbRegion, awsSecretStoreArn, dbClusterOrInstanceArn, database, aws);
        this.dbRegion = dbRegion;
        this.awsSecretStoreArn = awsSecretStoreArn;
        this.dbClusterOrInstanceArn = dbClusterOrInstanceArn;
        this.database = database;
    }
    setAuroraClient(auroraClient) {
        this.auroraClient = auroraClient;
    }
}
exports.AuroraServerlessMySQLDatabaseReader = AuroraServerlessMySQLDatabaseReader;
//# sourceMappingURL=AuroraServerlessMySQLDatabaseReader.js.map