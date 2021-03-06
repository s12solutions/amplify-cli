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
const api_1 = require("./api");
const storage_1 = require("./storage");
const MOCK_SUPPORTED_CATEGORY = ['AppSync', 'S3', 'Lambda'];
function mockAllCategories(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const resources = yield context.amplify.getResourceStatus();
        const mockableResources = resources.allResources.filter(resource => resource.service && MOCK_SUPPORTED_CATEGORY.includes(resource.service));
        const resourceToBePushed = [...resources.resourcesToBeUpdated, ...resources.resourcesToBeCreated].filter(resource => resource.service && !MOCK_SUPPORTED_CATEGORY.includes(resource.service));
        if (mockableResources.length) {
            if (resourceToBePushed.length) {
                try {
                    // push these resources
                    context.print.info('Some resources have changed locally and these resources are not mockable. The resources listed below need to be pushed to the cloud before starting the mock server.');
                    const didPush = yield context.amplify.pushResources(context, undefined, undefined, resourceToBePushed);
                    if (!didPush) {
                        context.print.info('\n\nMocking may not work as expected since some of the changed resources were not pushed.');
                    }
                }
                catch (e) {
                    context.print.info(`Pushing to the cloud failed with the following error \n${e.message}\n\n`);
                    const startServer = yield yield context.amplify.confirmPrompt.run('Do you still want to start the mock server?');
                    if (!startServer) {
                        return;
                    }
                }
            }
            // Run the mock servers
            const serverPromises = [];
            if (mockableResources.find(r => r.service === 'AppSync')) {
                serverPromises.push(api_1.start(context));
            }
            if (mockableResources.find(r => r.service === 'S3')) {
                serverPromises.push(storage_1.start(context));
            }
            yield Promise.all(serverPromises);
        }
        else {
            context.print.info('No resource in project can be mocked locally.');
        }
    });
}
exports.mockAllCategories = mockAllCategories;
//# sourceMappingURL=mockAll.js.map