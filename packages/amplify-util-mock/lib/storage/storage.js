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
const amplify_storage_simulator_1 = require("amplify-storage-simulator");
const path = require("path");
const fs = require("fs-extra");
const utils_1 = require("../utils");
const config_override_1 = require("../utils/config-override");
const amplify_category_function_1 = require("amplify-category-function");
const category = 'function';
const port = 20005; // port for S3
class StorageTest {
    start(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // loading s3 resource config form parameters.json
            const meta = context.amplify.getProjectDetails().amplifyMeta;
            const existingStorage = meta.storage;
            this.storageRegion = meta.providers.awscloudformation.Region;
            if (existingStorage === undefined || Object.keys(existingStorage).length === 0) {
                return context.print.warning('Storage has not yet been added to this project.');
            }
            let backendPath = context.amplify.pathManager.getBackendDirPath();
            const resourceName = Object.keys(existingStorage)[0];
            const parametersFilePath = path.join(backendPath, 'storage', resourceName, 'parameters.json');
            const localEnvFilePath = context.amplify.pathManager.getLocalEnvFilePath();
            const localEnvInfo = context.amplify.readJsonFile(localEnvFilePath);
            const storageParams = context.amplify.readJsonFile(parametersFilePath);
            this.bucketName = `${storageParams.bucketName}-${localEnvInfo.envName}`;
            const route = path.join('/', this.bucketName);
            let localDirS3 = this.createLocalStorage(context, `${storageParams.bucketName}`);
            try {
                utils_1.addCleanupTask(context, (context) => __awaiter(this, void 0, void 0, function* () {
                    yield this.stop(context);
                }));
                this.configOverrideManager = config_override_1.ConfigOverrideManager.getInstance(context);
                this.storageName = yield this.getStorage(context);
                const storageConfig = { port, route, localDirS3 };
                this.storageSimulator = new amplify_storage_simulator_1.AmplifyStorageSimulator(storageConfig);
                yield this.storageSimulator.start();
                console.log('Mock Storage endpoint is running at', this.storageSimulator.url);
                yield this.generateTestFrontendExports(context);
            }
            catch (e) {
                console.error('Failed to start Mock Storage server', e);
            }
        });
    }
    stop(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storageSimulator.stop();
        });
    }
    // to fire s3 triggers attached on the bucket
    trigger(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let region = this.storageRegion;
            this.storageSimulator.getServer.on('event', (eventObj) => {
                const meta = context.amplify.getProjectDetails().amplifyMeta;
                const existingStorage = meta.storage;
                let backendPath = context.amplify.pathManager.getBackendDirPath();
                const resourceName = Object.keys(existingStorage)[0];
                const CFNFilePath = path.join(backendPath, 'storage', resourceName, 's3-cloudformation-template.json');
                const storageParams = context.amplify.readJsonFile(CFNFilePath);
                const lambdaConfig = storageParams.Resources.S3Bucket.Properties.NotificationConfiguration &&
                    storageParams.Resources.S3Bucket.Properties.NotificationConfiguration.LambdaConfigurations;
                //no trigger case
                if (lambdaConfig === undefined) {
                    return;
                }
                // loop over lambda config to check for trigger based on prefix
                let triggerName;
                for (let obj of lambdaConfig) {
                    let prefix_arr = obj.Filter;
                    if (prefix_arr === undefined) {
                        let eventName = String(eventObj.Records[0].event.eventName).split(':')[0];
                        if (eventName === 'ObjectRemoved' || eventName === 'ObjectCreated') {
                            triggerName = String(obj.Function.Ref)
                                .split('function')[1]
                                .split('Arn')[0];
                            break;
                        }
                    }
                    else {
                        let keyName = String(eventObj.Records[0].s3.object.key);
                        prefix_arr = obj.Filter.S3Key.Rules;
                        for (let rules of prefix_arr) {
                            let node;
                            if (typeof rules.Value === 'object') {
                                node = String(Object.values(rules.Value)[0][1][0] + String(region) + ':');
                            }
                            if (typeof rules.Value === 'string') {
                                node = String(rules.Value);
                            }
                            // check prefix given  is the prefix of keyname in the event object
                            if (keyName.indexOf(node) === 0) {
                                triggerName = String(obj.Function.Ref)
                                    .split('function')[1]
                                    .split('Arn')[0];
                                break;
                            }
                        }
                    }
                    if (triggerName !== undefined) {
                        break;
                    }
                }
                const srcDir = path.normalize(path.join(backendPath, category, String(triggerName), 'src'));
                const event = eventObj;
                const invokeOptions = {
                    packageFolder: srcDir,
                    fileName: `${srcDir}/index.js`,
                    handler: 'handler',
                    event,
                };
                amplify_category_function_1.invoke(invokeOptions);
            });
        });
    }
    generateTestFrontendExports(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.generateFrontendExports(context, {
                endpoint: this.storageSimulator.url,
                name: this.storageName,
                testMode: true,
            });
        });
    }
    // generate aws-exports.js
    generateFrontendExports(context, localStorageDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMeta = yield utils_1.getAmplifyMeta(context);
            const override = currentMeta.storage || {};
            if (localStorageDetails) {
                const storageMeta = override[localStorageDetails.name] || { output: {} };
                override[localStorageDetails.name] = Object.assign(Object.assign({ service: 'S3' }, storageMeta), { output: Object.assign({ BucketName: this.bucketName, Region: this.storageRegion }, storageMeta.output), testMode: localStorageDetails.testMode, lastPushTimeStamp: new Date() });
            }
            this.configOverrideManager.addOverride('storage', override);
            yield this.configOverrideManager.generateOverriddenFrontendExports(context);
        });
    }
    getStorage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMeta = yield utils_1.getAmplifyMeta(context);
            const { storage: tmp = {} } = currentMeta;
            let name = null;
            Object.entries(tmp).some((entry) => {
                if (entry[1].service === 'S3') {
                    name = entry[0];
                    return true;
                }
            });
            return name;
        });
    }
    // create local storage for S3 on disk which is fixes as the test folder
    createLocalStorage(context, resourceName) {
        const directoryPath = path.join(utils_1.getMockDataDirectory(context), 'S3'); // get bucket through parameters remove afterwards
        fs.ensureDirSync(directoryPath);
        const localPath = path.join(directoryPath, resourceName);
        fs.ensureDirSync(localPath);
        return localPath;
    }
    get getSimulatorObject() {
        return this.storageSimulator;
    }
}
exports.StorageTest = StorageTest;
//# sourceMappingURL=storage.js.map