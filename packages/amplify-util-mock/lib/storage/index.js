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
const storage_1 = require("./storage");
const MOCK_SUPPORTED_CATEGORY = ['S3'];
const RESOURCE_NEEDS_PUSH = ['Cognito'];
function start(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const resources = yield context.amplify.getResourceStatus();
        const mockableResources = resources.allResources.filter(resource => resource.service && MOCK_SUPPORTED_CATEGORY.includes(resource.service));
        const resourceToBePushed = [...resources.resourcesToBeCreated].filter(resource => resource.service && RESOURCE_NEEDS_PUSH.includes(resource.service));
        if (mockableResources.length) {
            if (resourceToBePushed.length) {
                context.print.info('Storage Mocking needs Auth resources to be pushed to the cloud. Please run `amplify auth push` before running storage mock');
                return Promise.resolve(false);
            }
            const mockStorage = new storage_1.StorageTest();
            try {
                yield mockStorage.start(context);
                // call s3 trigger
                mockStorage.trigger(context);
            }
            catch (e) {
                console.log(e);
                // Sending term signal so we clean up after ourself
                process.kill(process.pid, 'SIGTERM');
            }
        }
    });
}
exports.start = start;
//# sourceMappingURL=index.js.map