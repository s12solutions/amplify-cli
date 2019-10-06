"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var AmplifyToolkit = /** @class */ (function () {
    function AmplifyToolkit() {
        this._amplifyHelpersDirPath = path_1.default.normalize(path_1.default.join(__dirname, '../extensions/amplify-helpers'));
    }
    Object.defineProperty(AmplifyToolkit.prototype, "buildResources", {
        get: function () {
            this._buildResources = this._buildResources ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'build-resources')).buildResources;
            return this._buildResources;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "confirmPrompt", {
        get: function () {
            this._confirmPrompt = this._confirmPrompt ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'confirm-prompt'));
            return this._confirmPrompt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "constants", {
        get: function () {
            this._constants = this._constants ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'constants'));
            return this._constants;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "constructExeInfo", {
        get: function () {
            this._constructExeInfo = this._constructExeInfo ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'construct-exeInfo')).constructExeInfo;
            return this._constructExeInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "copyBatch", {
        get: function () {
            this._copyBatch = this._copyBatch ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'copy-batch')).copyBatch;
            return this._copyBatch;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "crudFlow", {
        get: function () {
            this._crudFlow = this._crudFlow ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'permission-flow')).crudFlow;
            return this._crudFlow;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "deleteProject", {
        get: function () {
            this._deleteProject = this._deleteProject ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'delete-project')).deleteProject;
            return this._deleteProject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "executeProviderUtils", {
        get: function () {
            this._executeProviderUtils = this._executeProviderUtils ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'execute-provider-utils')).executeProviderUtils;
            return this._executeProviderUtils;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getAllEnvs", {
        get: function () {
            this._getAllEnvs = this._getAllEnvs ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-all-envs')).getAllEnvs;
            return this._getAllEnvs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getPlugin", {
        get: function () {
            this._getPlugin = this._getPlugin ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-plugin')).getPlugin;
            return this._getPlugin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getCategoryPlugins", {
        get: function () {
            this._getCategoryPlugins = this._getCategoryPlugins ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-category-plugins')).getCategoryPlugins;
            return this._getCategoryPlugins;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getFrontendPlugins", {
        get: function () {
            this._getFrontendPlugins = this._getFrontendPlugins ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-frontend-plugins')).getFrontendPlugins;
            return this._getFrontendPlugins;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getProviderPlugins", {
        get: function () {
            this._getProviderPlugins = this._getProviderPlugins ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-provider-plugins')).getProviderPlugins;
            return this._getProviderPlugins;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getEnvDetails", {
        get: function () {
            this._getEnvDetails = this._getEnvDetails ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-env-details')).getEnvDetails;
            return this._getEnvDetails;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getEnvInfo", {
        get: function () {
            this._getEnvInfo = this._getEnvInfo ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-env-info')).getEnvInfo;
            return this._getEnvInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getPluginInstance", {
        get: function () {
            this._getPluginInstance = this._getPluginInstance ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-plugin-instance')).getPluginInstance;
            return this._getPluginInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getProjectConfig", {
        get: function () {
            this._getProjectConfig = this._getProjectConfig ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-project-config')).getProjectConfig;
            return this._getProjectConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getProjectDetails", {
        get: function () {
            this._getProjectDetails = this._getProjectDetails ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-project-details')).getProjectDetails;
            return this._getProjectDetails;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getProjectMeta", {
        get: function () {
            this._getProjectMeta = this._getProjectMeta ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-project-meta')).getProjectMeta;
            return this._getProjectMeta;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getResourceStatus", {
        get: function () {
            this._getResourceStatus = this._getResourceStatus ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'resource-status')).getResourceStatus;
            return this._getResourceStatus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getResourceOutputs", {
        get: function () {
            this._getResourceOutputs = this._getResourceOutputs ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-resource-outputs')).getResourceOutputs;
            return this._getResourceOutputs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getWhen", {
        get: function () {
            this._getWhen = this._getWhen ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'get-when-function')).getWhen;
            return this._getWhen;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "inputValidation", {
        get: function () {
            this._inputValidation = this._inputValidation ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'input-validation')).inputValidation;
            return this._inputValidation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "isRunningOnEC2", {
        get: function () {
            this._isRunningOnEC2 = this._isRunningOnEC2 ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'is-running-on-EC2')).isRunningOnEC2;
            return this._isRunningOnEC2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "listCategories", {
        get: function () {
            this._listCategories = this._listCategories ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'list-categories')).listCategories;
            return this._listCategories;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "makeId", {
        get: function () {
            this._makeId = this._makeId ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'make-id')).makeId;
            return this._makeId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "openEditor", {
        get: function () {
            this._openEditor = this._openEditor ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'open-editor')).openEditor;
            return this._openEditor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "onCategoryOutputsChange", {
        get: function () {
            this._onCategoryOutputsChange = this._onCategoryOutputsChange ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'on-category-outputs-change')).onCategoryOutputsChange;
            return this._onCategoryOutputsChange;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "pathManager", {
        get: function () {
            this._pathManager = this._pathManager ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'path-manager'));
            return this._pathManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "pressEnterToContinue", {
        get: function () {
            this._pressEnterToContinue = this._pressEnterToContinue ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'press-enter-to-continue'));
            return this._pressEnterToContinue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "pushResources", {
        get: function () {
            this._pushResources = this._pushResources ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'push-resources')).pushResources;
            return this._pushResources;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "readJsonFile", {
        get: function () {
            this._readJsonFile = this._readJsonFile ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'read-json-file')).readJsonFile;
            return this._readJsonFile;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "removeEnvFromCloud", {
        get: function () {
            this._removeEnvFromCloud = this._removeEnvFromCloud ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'remove-env-from-cloud')).removeEnvFromCloud;
            return this._removeEnvFromCloud;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "removeResource", {
        get: function () {
            this._removeResource = this._removeResource ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'remove-resource')).removeResource;
            return this._removeResource;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "sharedQuestions", {
        get: function () {
            this._sharedQuestions = this._sharedQuestions ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'shared-questions')).sharedQuestions;
            return this._sharedQuestions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "showHelp", {
        get: function () {
            this._showHelp = this._showHelp ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'show-help')).showHelp;
            return this._showHelp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "showAllHelp", {
        get: function () {
            this._showAllHelp = this._showAllHelp ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'show-all-help')).showAllHelp;
            return this._showAllHelp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "showHelpfulProviderLinks", {
        get: function () {
            this._showHelpfulProviderLinks = this._showHelpfulProviderLinks ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'show-helpful-provider-links')).showHelpfulProviderLinks;
            return this._showHelpfulProviderLinks;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "showResourceTable", {
        get: function () {
            this._showResourceTable = this._showResourceTable ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'resource-status')).showResourceTable;
            return this._showResourceTable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "serviceSelectionPrompt", {
        get: function () {
            this._serviceSelectionPrompt = this._serviceSelectionPrompt ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'service-select-prompt')).serviceSelectionPrompt;
            return this._serviceSelectionPrompt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateProjectConfig", {
        get: function () {
            this._updateProjectConfig = this._updateProjectConfig ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-project-config')).updateProjectConfig;
            return this._updateProjectConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateamplifyMetaAfterResourceUpdate", {
        get: function () {
            this._updateamplifyMetaAfterResourceUpdate = this._updateamplifyMetaAfterResourceUpdate ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-amplify-meta')).updateamplifyMetaAfterResourceUpdate;
            return this._updateamplifyMetaAfterResourceUpdate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateamplifyMetaAfterResourceAdd", {
        get: function () {
            this._updateamplifyMetaAfterResourceAdd = this._updateamplifyMetaAfterResourceAdd ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-amplify-meta')).updateamplifyMetaAfterResourceAdd;
            return this._updateamplifyMetaAfterResourceAdd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateamplifyMetaAfterResourceDelete", {
        get: function () {
            this._updateamplifyMetaAfterResourceDelete = this._updateamplifyMetaAfterResourceDelete ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-amplify-meta')).updateamplifyMetaAfterResourceDelete;
            return this._updateamplifyMetaAfterResourceDelete;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateProvideramplifyMeta", {
        get: function () {
            this._updateProvideramplifyMeta = this._updateProvideramplifyMeta ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-amplify-meta')).updateProvideramplifyMeta;
            return this._updateProvideramplifyMeta;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateamplifyMetaAfterPush", {
        get: function () {
            this._updateamplifyMetaAfterPush = this._updateamplifyMetaAfterPush ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-amplify-meta')).updateamplifyMetaAfterPush;
            return this._updateamplifyMetaAfterPush;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateamplifyMetaAfterBuild", {
        get: function () {
            this._updateamplifyMetaAfterBuild = this._updateamplifyMetaAfterBuild ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-amplify-meta')).updateamplifyMetaAfterBuild;
            return this._updateamplifyMetaAfterBuild;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateAmplifyMetaAfterPackage", {
        get: function () {
            this._updateAmplifyMetaAfterPackage = this._updateAmplifyMetaAfterPackage ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-amplify-meta')).updateAmplifyMetaAfterPackage;
            return this._updateAmplifyMetaAfterPackage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateBackendConfigAfterResourceAdd", {
        get: function () {
            this._updateBackendConfigAfterResourceAdd = this._updateBackendConfigAfterResourceAdd ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-backend-config')).updateBackendConfigAfterResourceAdd;
            return this._updateBackendConfigAfterResourceAdd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateBackendConfigAfterResourceRemove", {
        get: function () {
            this._updateBackendConfigAfterResourceRemove = this._updateBackendConfigAfterResourceRemove ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'update-backend-config')).updateBackendConfigAfterResourceRemove;
            return this._updateBackendConfigAfterResourceRemove;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "loadEnvResourceParameters", {
        get: function () {
            this._loadEnvResourceParameters = this._loadEnvResourceParameters ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'envResourceParams')).loadEnvResourceParameters;
            return this._loadEnvResourceParameters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "saveEnvResourceParameters", {
        get: function () {
            this._saveEnvResourceParameters = this._saveEnvResourceParameters ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'envResourceParams')).saveEnvResourceParameters;
            return this._saveEnvResourceParameters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "removeResourceParameters", {
        get: function () {
            this._removeResourceParameters = this._removeResourceParameters ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'envResourceParams')).removeResourceParameters;
            return this._removeResourceParameters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "triggerFlow", {
        get: function () {
            this._triggerFlow = this._triggerFlow ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).triggerFlow;
            return this._triggerFlow;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "addTrigger", {
        get: function () {
            this._addTrigger = this._addTrigger ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).addTrigger;
            return this._addTrigger;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "updateTrigger", {
        get: function () {
            this._updateTrigger = this._updateTrigger ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).updateTrigger;
            return this._updateTrigger;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "deleteTrigger", {
        get: function () {
            this._deleteTrigger = this._deleteTrigger ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).deleteTrigger;
            return this._deleteTrigger;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "deleteAllTriggers", {
        get: function () {
            this._deleteAllTriggers = this._deleteAllTriggers ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).deleteAllTriggers;
            return this._deleteAllTriggers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "deleteDeselectedTriggers", {
        get: function () {
            this._deleteDeselectedTriggers = this._deleteDeselectedTriggers ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).deleteDeselectedTriggers;
            return this._deleteDeselectedTriggers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "dependsOnBlock", {
        get: function () {
            this._dependsOnBlock = this._dependsOnBlock ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).dependsOnBlock;
            return this._dependsOnBlock;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getTriggerMetadata", {
        get: function () {
            this._getTriggerMetadata = this._getTriggerMetadata ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).getTriggerMetadata;
            return this._getTriggerMetadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getTriggerPermissions", {
        get: function () {
            this._getTriggerPermissions = this._getTriggerPermissions ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).getTriggerPermissions;
            return this._getTriggerPermissions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getTriggerEnvVariables", {
        get: function () {
            this._getTriggerEnvVariables = this._getTriggerEnvVariables ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).getTriggerEnvVariables;
            return this._getTriggerEnvVariables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AmplifyToolkit.prototype, "getTriggerEnvInputs", {
        get: function () {
            this._getTriggerEnvInputs = this._getTriggerEnvInputs ||
                require(path_1.default.join(this._amplifyHelpersDirPath, 'trigger-flow')).getTriggerEnvInputs;
            return this._getTriggerEnvInputs;
        },
        enumerable: true,
        configurable: true
    });
    return AmplifyToolkit;
}());
exports.default = AmplifyToolkit;
//# sourceMappingURL=../../src/lib/domain/amplify-toolkit.js.map