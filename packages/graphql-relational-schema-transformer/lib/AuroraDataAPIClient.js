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
/**
 * A wrapper around the RDS data service client, forming their responses for
 * easier consumption.
 */
class AuroraDataAPIClient {
    constructor(databaseRegion, awsSecretStoreArn, dbClusterOrInstanceArn, database, aws) {
        /**
         * Lists all of the tables in the set database.
         *
         * @return a list of tables in the database.
         */
        this.listTables = () => __awaiter(this, void 0, void 0, function* () {
            this.Params.sql = 'SHOW TABLES';
            const response = yield this.RDS.executeStatement(this.Params).promise();
            let tableList = [];
            const records = response['records'];
            for (const record of records) {
                tableList.push(record[0]['stringValue']);
            }
            return tableList;
        });
        /**
         * Describes the table given, by breaking it down into individual column descriptions.
         *
         * @param the name of the table to be described.
         * @return a list of column descriptions.
         */
        this.describeTable = (tableName) => __awaiter(this, void 0, void 0, function* () {
            this.Params.sql = `DESCRIBE ${tableName}`;
            const response = yield this.RDS.executeStatement(this.Params).promise();
            const listOfColumns = response['records'];
            let columnDescriptions = [];
            for (const column of listOfColumns) {
                let colDescription = new ColumnDescription();
                colDescription.Field = column[MYSQL_DESCRIBE_TABLE_ORDER.Field]['stringValue'];
                colDescription.Type = column[MYSQL_DESCRIBE_TABLE_ORDER.Type]['stringValue'];
                colDescription.Null = column[MYSQL_DESCRIBE_TABLE_ORDER.Null]['stringValue'];
                colDescription.Key = column[MYSQL_DESCRIBE_TABLE_ORDER.Key]['stringValue'];
                colDescription.Default = column[MYSQL_DESCRIBE_TABLE_ORDER.Default]['stringValue'];
                colDescription.Extra = column[MYSQL_DESCRIBE_TABLE_ORDER.Extra]['stringValue'];
                columnDescriptions.push(colDescription);
            }
            return columnDescriptions;
        });
        /**
         * Gets foreign keys for the given table, if any exist.
         *
         * @param tableName the name of the table to be checked.
         * @return a list of tables referencing the provided table, if any exist.
         */
        this.getTableForeignKeyReferences = (tableName) => __awaiter(this, void 0, void 0, function* () {
            this.Params.sql = `SELECT TABLE_NAME FROM information_schema.key_column_usage 
            WHERE referenced_table_name is not null 
            AND REFERENCED_TABLE_NAME = '${tableName}';`;
            const response = yield this.RDS.executeStatement(this.Params).promise();
            let tableList = [];
            const records = response['records'];
            for (const record of records) {
                tableList.push(record[0]['stringValue']);
            }
            return tableList;
        });
        this.AWS = aws;
        this.AWS.config.update({
            region: databaseRegion
        });
        this.RDS = new this.AWS.RDSDataService();
        this.Params = new DataApiParams();
        this.Params.secretArn = awsSecretStoreArn;
        this.Params.resourceArn = dbClusterOrInstanceArn;
        this.Params.database = database;
    }
    setRDSClient(rdsClient) {
        this.RDS = rdsClient;
    }
}
exports.AuroraDataAPIClient = AuroraDataAPIClient;
class DataApiParams {
}
exports.DataApiParams = DataApiParams;
class ColumnDescription {
}
exports.ColumnDescription = ColumnDescription;
var MYSQL_DESCRIBE_TABLE_ORDER;
(function (MYSQL_DESCRIBE_TABLE_ORDER) {
    MYSQL_DESCRIBE_TABLE_ORDER[MYSQL_DESCRIBE_TABLE_ORDER["Field"] = 0] = "Field";
    MYSQL_DESCRIBE_TABLE_ORDER[MYSQL_DESCRIBE_TABLE_ORDER["Type"] = 1] = "Type";
    MYSQL_DESCRIBE_TABLE_ORDER[MYSQL_DESCRIBE_TABLE_ORDER["Null"] = 2] = "Null";
    MYSQL_DESCRIBE_TABLE_ORDER[MYSQL_DESCRIBE_TABLE_ORDER["Key"] = 3] = "Key";
    MYSQL_DESCRIBE_TABLE_ORDER[MYSQL_DESCRIBE_TABLE_ORDER["Default"] = 4] = "Default";
    MYSQL_DESCRIBE_TABLE_ORDER[MYSQL_DESCRIBE_TABLE_ORDER["Extra"] = 5] = "Extra";
})(MYSQL_DESCRIBE_TABLE_ORDER || (MYSQL_DESCRIBE_TABLE_ORDER = {}));
//# sourceMappingURL=AuroraDataAPIClient.js.map