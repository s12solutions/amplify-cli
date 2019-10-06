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
function runTransformer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const transformerOutput = yield context.amplify.executeProviderUtils(context, 'awscloudformation', 'compileSchema', {
            noConfig: true,
            forceCompile: true,
            dryRun: true,
            disableResolverOverrides: true,
        });
        const stack = Object.values(transformerOutput.stacks).reduce((prev, stack) => {
            return Object.assign(Object.assign({}, prev), stack.Resources);
        }, Object.assign({}, transformerOutput.rootStack.Resources));
        return { transformerOutput, stack };
    });
}
exports.runTransformer = runTransformer;
//# sourceMappingURL=run-graphql-transformer.js.map