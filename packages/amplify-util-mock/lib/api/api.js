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
const fs = require("fs-extra");
const dynamoEmulator = require("amplify-dynamodb-simulator");
const amplify_appsync_simulator_1 = require("amplify-appsync-simulator");
const amplify_codegen_1 = require("amplify-codegen");
const path = require("path");
const chokidar = require("chokidar");
const utils_1 = require("../utils");
const run_graphql_transformer_1 = require("./run-graphql-transformer");
const CFNParser_1 = require("../CFNParser");
const resolver_overrides_1 = require("./resolver-overrides");
const config_override_1 = require("../utils/config-override");
const ddb_utils_1 = require("../utils/ddb-utils");
const invoke_1 = require("../utils/lambda/invoke");
const load_1 = require("../utils/lambda/load");
class APITest {
    start(context, port = 20002, wsPort = 20003) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                utils_1.addCleanupTask(context, (context) => __awaiter(this, void 0, void 0, function* () {
                    yield this.stop(context);
                }));
                this.projectRoot = context.amplify.getEnvInfo().projectPath;
                this.configOverrideManager = config_override_1.ConfigOverrideManager.getInstance(context);
                this.apiName = yield this.getAppSyncAPI(context);
                this.ddbClient = yield this.startDynamoDBLocalServer(context);
                const resolverDirectory = yield this.getResolverTemplateDirectory(context);
                this.resolverOverrideManager = new resolver_overrides_1.ResolverOverrides(resolverDirectory);
                this.appSyncSimulator = new amplify_appsync_simulator_1.AmplifyAppSyncSimulator({
                    port,
                    wsPort,
                });
                yield this.appSyncSimulator.start();
                yield this.resolverOverrideManager.start();
                yield this.watch(context);
                const appSyncConfig = yield this.runTransformer(context);
                this.appSyncSimulator.init(appSyncConfig);
                yield this.generateTestFrontendExports(context);
                yield this.generateCode(context);
                context.print.info(`AppSync Mock endpoint is running at ${this.appSyncSimulator.url}`);
            }
            catch (e) {
                context.print.error(`Failed to start API Mock endpoint ${e}`);
            }
        });
    }
    stop(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ddbClient = null;
            if (this.watcher) {
                this.watcher.close();
                this.watcher = null;
            }
            try {
                if (this.ddbEmulator) {
                    yield this.ddbEmulator.terminate();
                    this.ddbEmulator = null;
                }
            }
            catch (e) {
                // failed to stop DDB emulator
                context.print.error(`Failed to stop DynamoDB Local Server ${e.message}`);
            }
            yield this.appSyncSimulator.stop();
            this.resolverOverrideManager.stop();
        });
    }
    runTransformer(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transformerOutput, stack } = yield run_graphql_transformer_1.runTransformer(context);
            let config = CFNParser_1.processAppSyncResources(stack, transformerOutput);
            yield this.ensureDDBTables(config);
            config = this.configureDDBDataSource(config);
            this.transformerResult = this.configureLambdaDataSource(context, config);
            const overriddenTemplates = yield this.resolverOverrideManager.sync(this.transformerResult.mappingTemplates);
            return Object.assign(Object.assign({}, this.transformerResult), { mappingTemplates: overriddenTemplates });
        });
    }
    generateCode(context, transformerOutput = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                context.print.info('Running GraphQL codegen');
                const { projectPath } = context.amplify.getEnvInfo();
                const schemaPath = path.join(projectPath, 'amplify', 'backend', 'api', this.apiName, 'build', 'schema.graphql');
                if (transformerOutput) {
                    fs.writeFileSync(schemaPath, transformerOutput.schema);
                }
                if (!amplify_codegen_1.isCodegenConfigured(context, this.apiName)) {
                    yield amplify_codegen_1.add(context);
                }
                else {
                    amplify_codegen_1.switchToSDLSchema(context, this.apiName);
                    yield amplify_codegen_1.generate(context);
                }
            }
            catch (e) {
                context.print.info(`Failed to run GraphQL codegen with following error:\n${e.message}`);
            }
        });
    }
    reload(context, filePath, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiDir = yield this.getAPIBackendDirectory(context);
            const inputSchemaPath = path.join(apiDir, 'schema');
            try {
                let shouldReload;
                if (this.resolverOverrideManager.isTemplateFile(filePath, action === 'unlink' ? true : false)) {
                    switch (action) {
                        case 'add':
                            shouldReload = this.resolverOverrideManager.onAdd(filePath);
                            break;
                        case 'change':
                            shouldReload = this.resolverOverrideManager.onChange(filePath);
                            break;
                        case 'unlink':
                            shouldReload = this.resolverOverrideManager.onUnlink(filePath);
                            break;
                    }
                    if (shouldReload) {
                        context.print.info('Mapping template change detected. Reloading...');
                        const mappingTemplates = this.resolverOverrideManager.sync(this.transformerResult.mappingTemplates);
                        yield this.appSyncSimulator.reload(Object.assign(Object.assign({}, this.transformerResult), { mappingTemplates }));
                    }
                }
                else if (filePath.includes(inputSchemaPath)) {
                    context.print.info('GraphQL Schema change detected. Reloading...');
                    const config = yield this.runTransformer(context);
                    yield this.appSyncSimulator.reload(config);
                    yield this.generateCode(context);
                }
            }
            catch (e) {
                context.print.info(`Reloading failed with error\n${e}`);
            }
        });
    }
    generateTestFrontendExports(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.generateFrontendExports(context, {
                endpoint: `${this.appSyncSimulator.url}/graphql`,
                name: this.apiName,
                GraphQLAPIKeyOutput: this.transformerResult.appSync.apiKey,
                additionalAuthenticationProviders: [],
                securityType: this.transformerResult.appSync.authenticationType,
                testMode: true,
            });
        });
    }
    ensureDDBTables(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const tables = config.tables.map(t => t.Properties);
            yield ddb_utils_1.ensureDynamoDBTables(this.ddbClient, config);
        });
    }
    configureLambdaDataSource(context, config) {
        const lambdaDataSources = config.dataSources.filter(d => d.type === 'AWS_LAMBDA');
        if (lambdaDataSources.length === 0) {
            return config;
        }
        const provisionedLambdas = load_1.getAllLambdaFunctions(context, path.join(this.projectRoot, 'amplify', 'backend'));
        return Object.assign(Object.assign({}, config), { dataSources: config.dataSources.map(d => {
                if (d.type !== 'AWS_LAMBDA') {
                    return d;
                }
                const arn = d.LambdaFunctionArn;
                const arnParts = arn.split(':');
                let functionName = arnParts[arnParts.length - 1];
                if (functionName.endsWith('-${env}')) {
                    functionName = functionName.replace('-${env}', '');
                    const lambdaConfig = provisionedLambdas.find(fn => fn.name === functionName);
                    if (!lambdaConfig) {
                        throw new Error(`Lambda function ${functionName} does not exist in your project. \nPlease run amplify add function`);
                    }
                    const [fileName, handlerFn] = lambdaConfig.handler.split('.');
                    const lambdaPath = path.join(lambdaConfig.basePath, `${fileName}.js`);
                    if (!fs.existsSync(lambdaPath)) {
                        throw new Error(`Lambda function ${functionName} does not exist in your project. \nPlease run amplify add function`);
                    }
                    return Object.assign(Object.assign({}, d), { invoke: payload => {
                            return invoke_1.invoke({
                                packageFolder: lambdaConfig.basePath,
                                handler: handlerFn,
                                fileName: `${fileName}.js`,
                                event: payload,
                                environment: lambdaConfig.environment,
                            });
                        } });
                }
                else {
                    throw new Error('Local mocking does not support AWS_LAMBDA data source that is not provisioned in the project.\nEnsure that the environment is specified as described in https://aws-amplify.github.io/docs/cli-toolchain/graphql#function');
                }
            }) });
    }
    watch(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.watcher = yield this.registerWatcher(context);
            this.watcher
                .on('add', path => {
                this.reload(context, path, 'add');
            })
                .on('change', path => {
                this.reload(context, path, 'change');
            })
                .on('unlink', path => {
                this.reload(context, path, 'unlink');
            });
        });
    }
    configureDDBDataSource(config) {
        const ddbConfig = this.ddbClient.config;
        return ddb_utils_1.configureDDBDataSource(config, ddbConfig);
    }
    getAppSyncAPI(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMeta = yield utils_1.getAmplifyMeta(context);
            const { api: apis = {} } = currentMeta;
            let appSyncApi = null;
            let name = null;
            Object.entries(apis).some((entry) => {
                if (entry[1].service === 'AppSync' && entry[1].providerPlugin === 'awscloudformation') {
                    appSyncApi = entry[1];
                    name = entry[0];
                    return true;
                }
            });
            if (!name) {
                throw new Error('No AppSync API is added to the project');
            }
            return name;
        });
    }
    startDynamoDBLocalServer(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { projectPath } = context.amplify.getEnvInfo();
            const dbPath = path.join(yield utils_1.getMockDataDirectory(context), 'dynamodb');
            fs.ensureDirSync(dbPath);
            this.ddbEmulator = yield dynamoEmulator.launch({
                dbPath,
                port: null,
            });
            return dynamoEmulator.getClient(this.ddbEmulator);
        });
    }
    getAPIBackendDirectory(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { projectPath } = context.amplify.getEnvInfo();
            return path.join(projectPath, 'amplify', 'backend', 'api', this.apiName);
        });
    }
    getResolverTemplateDirectory(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiDirectory = yield this.getAPIBackendDirectory(context);
            return apiDirectory;
        });
    }
    registerWatcher(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const watchDir = yield this.getAPIBackendDirectory(context);
            return chokidar.watch(watchDir, {
                interval: 100,
                ignoreInitial: true,
                followSymlinks: false,
                ignored: '**/build/**',
                awaitWriteFinish: true,
            });
        });
    }
    generateFrontendExports(context, localAppSyncDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMeta = yield utils_1.getAmplifyMeta(context);
            const override = currentMeta.api || {};
            if (localAppSyncDetails) {
                const appSyncApi = override[localAppSyncDetails.name] || { output: {} };
                override[localAppSyncDetails.name] = Object.assign(Object.assign({ service: 'AppSync' }, appSyncApi), { output: Object.assign(Object.assign({}, appSyncApi.output), { GraphQLAPIEndpointOutput: localAppSyncDetails.endpoint, projectRegion: localAppSyncDetails.region, aws_appsync_authenticationType: localAppSyncDetails.securityType, GraphQLAPIKeyOutput: localAppSyncDetails.GraphQLAPIKeyOutput }), testMode: localAppSyncDetails.testMode, lastPushTimeStamp: new Date() });
            }
            this.configOverrideManager.addOverride('api', override);
            yield this.configOverrideManager.generateOverriddenFrontendExports(context);
        });
    }
}
exports.APITest = APITest;
//# sourceMappingURL=api.js.map