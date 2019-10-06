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
function ensureDynamoDBTables(dynamodb, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const tables = config.tables.map(t => t.Properties);
        return yield Promise.all(tables.map((resource) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.info(`Creating table ${resource.TableName} locally`);
                yield dynamodb.createTable(resource).promise();
            }
            catch (err) {
                if (err.code !== 'ResourceInUseException')
                    throw err;
            }
        })));
    });
}
exports.ensureDynamoDBTables = ensureDynamoDBTables;
function configureDDBDataSource(config, ddbConfig) {
    return Object.assign(Object.assign({}, config), { dataSources: config.dataSources.map(d => {
            if (d.type !== 'AMAZON_DYNAMODB') {
                return d;
            }
            return Object.assign(Object.assign({}, d), { config: Object.assign(Object.assign({}, d.config), { endpoint: ddbConfig.endpoint, region: ddbConfig.region, accessKeyId: ddbConfig.accessKeyId, secretAccessKey: ddbConfig.secretAccessKey }) });
        }) });
}
exports.configureDDBDataSource = configureDDBDataSource;
//# sourceMappingURL=ddb-utils.js.map