"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const lambda_resource_processor_1 = require("../../CFNParser/lambda-resource-processor");
function getAllLambdaFunctions(context, backendPath) {
    const lambdas = [];
    const lambdaCategoryPath = path.join(backendPath, 'function');
    if (fs.existsSync(lambdaCategoryPath) && fs.lstatSync(lambdaCategoryPath).isDirectory) {
        fs.readdirSync(lambdaCategoryPath)
            .filter(p => {
            const lambdaDir = path.join(lambdaCategoryPath, p);
            return fs.existsSync(lambdaDir) && fs.lstatSync(lambdaDir).isDirectory;
        })
            .forEach(resourceName => {
            const lambdaDir = path.join(lambdaCategoryPath, resourceName);
            const cfnPath = path.join(lambdaDir, `${resourceName}-cloudformation-template.json`);
            const cfnParams = path.join(lambdaDir, 'function-parameters.json');
            try {
                const lambdaCfn = context.amplify.readJsonFile(cfnPath);
                const lambdaCfnParams = fs.existsSync(cfnParams) ? context.amplify.readJsonFile(cfnParams) : {};
                const lambdaConfig = lambda_resource_processor_1.processResources(lambdaCfn.Resources, {}, Object.assign(Object.assign({}, lambdaCfnParams), { env: 'NONE' }));
                lambdaConfig.basePath = path.join(lambdaDir, 'src');
                lambdas.push(lambdaConfig);
            }
            catch (e) {
                context.print.error(`Failed to parse Lambda function cloudformation in ${cfnPath}`);
                context.print.error(`\n${e}`);
            }
        });
    }
    return lambdas;
}
exports.getAllLambdaFunctions = getAllLambdaFunctions;
//# sourceMappingURL=load.js.map