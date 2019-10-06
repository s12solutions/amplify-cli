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
const amplify_appsync_simulator_1 = require("amplify-appsync-simulator");
const ddb_utils_1 = require("../../utils/ddb-utils");
const CFNParser_1 = require("../../CFNParser");
const dynamoEmulator = require("amplify-dynamodb-simulator");
const fs = require("fs-extra");
const path = require("path");
const lambda_helper_1 = require("./lambda-helper");
const invoke_1 = require("../../utils/lambda/invoke");
const uuid_1 = require("uuid");
function launchDDBLocal() {
    return __awaiter(this, void 0, void 0, function* () {
        let dbPath;
        while (true) {
            dbPath = path.join('/tmp', `amplify-cli-emulator-dynamodb-${uuid_1.v4()}`);
            if (!fs.existsSync(dbPath))
                break;
        }
        fs.ensureDirSync(dbPath);
        const emulator = yield dynamoEmulator.launch({
            dbPath,
            port: null,
        });
        const client = yield dynamoEmulator.getClient(emulator);
        logDebug(dbPath);
        return { emulator, dbPath, client };
    });
}
exports.launchDDBLocal = launchDDBLocal;
function deploy(transformerOutput, client = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const stacks = Object.values(transformerOutput.stacks).reduce((prev, stack) => {
            return Object.assign(Object.assign({}, prev), stack.Resources);
        }, Object.assign({}, transformerOutput.rootStack.Resources));
        let config = CFNParser_1.processAppSyncResources(stacks, transformerOutput);
        config.appSync.apiKey = 'da-fake-api-key';
        if (client) {
            yield ddb_utils_1.ensureDynamoDBTables(client, config);
            config = ddb_utils_1.configureDDBDataSource(config, client.config);
        }
        configureLambdaDataSource(config);
        const simulator = yield runAppSyncSimulator(config);
        return { simulator, config };
    });
}
exports.deploy = deploy;
function configureLambdaDataSource(config) {
    return __awaiter(this, void 0, void 0, function* () {
        config.dataSources
            .filter(d => d.type === 'AWS_LAMBDA')
            .forEach(d => {
            const arn = d.LambdaFunctionArn;
            const arnParts = arn.split(':');
            let functionName = arnParts[arnParts.length - 1];
            const lambdaConfig = lambda_helper_1.getFunctionDetails(functionName);
            d.invoke = payload => {
                logDebug('Invoking lambda with config', lambdaConfig);
                return invoke_1.invoke(Object.assign(Object.assign({}, lambdaConfig), { event: payload }));
            };
        });
        return config;
    });
}
function terminateDDB(emulator, dbPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (emulator && emulator.terminate) {
                yield emulator.terminate();
            }
        }
        catch (e) {
            logDebug('Failed to terminate the Local DynamoDB Server', e);
        }
        try {
            fs.removeSync(dbPath);
        }
        catch (e) {
            logDebug('Failed delete Local DynamoDB Server Folder', e);
        }
    });
}
exports.terminateDDB = terminateDDB;
function runAppSyncSimulator(config, port, wsPort) {
    return __awaiter(this, void 0, void 0, function* () {
        const appsyncSimulator = new amplify_appsync_simulator_1.AmplifyAppSyncSimulator({ port, wsPort });
        yield appsyncSimulator.start();
        yield appsyncSimulator.init(config);
        return appsyncSimulator;
    });
}
exports.runAppSyncSimulator = runAppSyncSimulator;
function logDebug(...msgs) {
    if (process.env.DEBUG || process.env.CI) {
        console.log(...msgs);
    }
}
exports.logDebug = logDebug;
//# sourceMappingURL=index.js.map