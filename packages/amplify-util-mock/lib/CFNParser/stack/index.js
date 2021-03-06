"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const topo_1 = require("@hapi/topo");
const lodash_1 = require("lodash");
require("../../CFNParser");
const field_parser_1 = require("../field-parser");
const resource_processors_1 = require("../resource-processors");
exports.CFN_PSEUDO_PARAMS = {
    'AWS::Region': 'us-east-1-fake',
    'AWS::AccountId': '12345678910',
    'AWS::StackId': 'fake-stackId',
    'AWS::StackName': 'local-testing',
};
function nestedStackHandler(resourceName, resource, cfnContext, cfnTemplateFetcher) {
    if (typeof resource.Properties.TemplateURL === 'undefined') {
        throw new Error(`Error in parsing Nested stack ${resourceName}. Stack is missing required property TemplateURL`);
    }
    const parameters = resource.Properties.Parameters || {};
    // process all the parameters
    const processedParameters = Object.entries(parameters).reduce((acc, [parameterName, parameterValue]) => {
        return Object.assign(Object.assign({}, acc), { [parameterName]: field_parser_1.parseValue(parameterValue, cfnContext) });
    }, {});
    // get the template
    const templatePath = field_parser_1.parseValue(resource.Properties.TemplateURL, cfnContext);
    // custom templates have .json extension and Transformer generated ones don't.
    const stackTemplate = cfnTemplateFetcher.getCloudFormationStackTemplate(templatePath);
    if (typeof stackTemplate === 'undefined') {
        throw new Error(`Could not find the CloudFormation template ${templatePath} for resource ${resourceName}`);
    }
    return processCloudFormationStack(stackTemplate, processedParameters, cfnContext.exports, cfnTemplateFetcher);
}
exports.nestedStackHandler = nestedStackHandler;
function mergeParameters(templateParameters, inputParameters) {
    const processedParams = {};
    Object.keys(templateParameters).forEach((paramName) => {
        if (paramName in inputParameters) {
            processedParams[paramName] = inputParameters[paramName];
        }
        else if (typeof templateParameters[paramName].Default === 'undefined') {
            throw new Error(`CloudFormation stack parameter ${paramName} is missing default value`);
        }
        else {
            processedParams[paramName] = templateParameters[paramName].Default;
        }
    });
    return Object.assign(Object.assign({}, exports.CFN_PSEUDO_PARAMS), processedParams);
}
exports.mergeParameters = mergeParameters;
function processConditions(conditions, processedParams) {
    const processedConditions = {};
    Object.keys(conditions).forEach(conditionName => {
        const condition = conditions[conditionName];
        processedConditions[conditionName] = field_parser_1.parseValue(condition, {
            params: processedParams,
            conditions: Object.assign({}, conditions),
            resources: {},
            exports: {},
        });
    });
    return processedConditions;
}
exports.processConditions = processConditions;
function getDependencyResources(node, params = {}) {
    let result = [];
    if (typeof node === 'string') {
        return [];
    }
    if (lodash_1.isPlainObject(node) && Object.keys(node).length === 1) {
        const fnName = Object.keys(node)[0];
        const fnArgs = node[fnName];
        if ('Ref' === fnName) {
            const resourceName = fnArgs;
            if (!Object.keys(params).includes(resourceName)) {
                result.push(resourceName);
            }
        }
        else if ('Fn::GetAtt' === fnName) {
            const resourceName = fnArgs[0];
            result.push(resourceName);
        }
        else if (typeof fnArgs !== 'string') {
            for (var i = 0; i < fnArgs.length; i++) {
                result = [...result, ...getDependencyResources(fnArgs[i], params)];
            }
        }
    }
    else if (Array.isArray(node)) {
        return node.reduce((acc, item) => [...acc, ...getDependencyResources(item, params)], []);
    }
    return result;
}
exports.getDependencyResources = getDependencyResources;
function sortResources(resources, params) {
    const resourceSorter = new topo_1.Sorter();
    Object.keys(resources).forEach(resourceName => {
        const resource = resources[resourceName];
        let dependsOn = [];
        // intrinsic dependency
        const intrinsicDependency = Object.values(resource.Properties)
            .map(propValue => getDependencyResources(propValue, params))
            .reduce((sum, val) => [...sum, ...val], []);
        // Todo: enable this once e2e test invoke transformer the same way as
        // mock
        // throw error if one of the intrinsic resource
        // const missingIntrinsicDeps = intrinsicDependency.filter(res => !(res in resources));
        // if (missingIntrinsicDeps.length) {
        //   throw new Error(
        //     `Resource ${resourceName} has missing intrinsic dependency ${
        //       missingIntrinsicDeps.length === 1 ? 'resource' : 'resources'
        //     } ${missingIntrinsicDeps.join(', ')}`,
        //   );
        // }
        if (resource.DependsOn) {
            if (Array.isArray(resource.DependsOn) || typeof resource.DependsOn === 'string') {
                dependsOn = typeof resource.DependsOn === 'string' ? [resource.DependsOn] : resource.DependsOn;
                if (dependsOn.some(dependsOnResource => !(dependsOnResource in resources))) {
                    throw new Error(`Resource ${resourceName} DependsOn a non-existent resource`);
                }
            }
            else {
                throw new Error(`DependsOn block should be an array or a string for resource ${resourceName}`);
            }
        }
        try {
            resourceSorter.add(resourceName, { group: resourceName, after: [...dependsOn, ...intrinsicDependency] });
        }
        catch (e) {
            if (e.message.indexOf('Item cannot come after itself') !== -1) {
                throw new Error(`Resource ${resourceName} can not depend on itself`);
            }
            if (e.message.indexOf('created a dependencies error') !== -1) {
                throw new Error('Cyclic dependency detected in the Resources');
            }
            throw e;
        }
    });
    return resourceSorter.nodes;
}
exports.sortResources = sortResources;
function filterResourcesBasedOnConditions(resources, conditions) {
    const filteredResources = {};
    Object.entries(resources)
        .filter(([resourceName, resource]) => {
        if (resource.Condition) {
            const condition = conditions[resource.Condition];
            if (typeof condition === 'undefined') {
                throw new Error(`Condition ${resource.Condition} used by resource ${resourceName} is not defined in Condition block`);
            }
            return condition;
        }
        return true;
    })
        .forEach(([resourceName, resource]) => {
        filteredResources[resourceName] = resource;
    });
    return filteredResources;
}
exports.filterResourcesBasedOnConditions = filterResourcesBasedOnConditions;
function processResources(parameters, conditions, resources, cfnExports, cfnTemplateFetcher) {
    const filteredResources = filterResourcesBasedOnConditions(resources, conditions);
    const sortedResourceNames = sortResources(filteredResources, parameters);
    const processedResources = {};
    sortedResourceNames.forEach(resourceName => {
        const resource = filteredResources[resourceName];
        const resourceType = resource.Type;
        const cfnContext = {
            params: Object.assign({}, parameters),
            conditions: Object.assign({}, conditions),
            resources: Object.assign({}, processedResources),
            exports: Object.assign({}, cfnExports),
        };
        if (resourceType === 'AWS::CloudFormation::Stack') {
            const nestedStack = nestedStackHandler(resourceName, resource, cfnContext, cfnTemplateFetcher);
            processedResources[resourceName] = { result: nestedStack, Type: 'AWS::CloudFormation::Stack' };
            cfnExports = Object.assign(Object.assign({}, cfnExports), nestedStack.stackExports);
        }
        else {
            try {
                const resourceProcessor = resource_processors_1.getResourceProcessorFor(resourceType);
                const processedResource = resourceProcessor(resourceName, resource, cfnContext);
                processedResources[resourceName] = { result: processedResource, Type: resourceType };
            }
            catch (e) {
                if (e.message.indexOf('No resource handler found') === -1) {
                    // ignore errors when we don't know how to process the resource
                    throw e;
                }
                else {
                    console.log(`Mock does not handle CloudFormation resource of type ${resourceType}. Skipping processing resource ${resourceName}.`);
                }
            }
        }
    });
    return { resources: processedResources, stackExports: cfnExports };
}
exports.processResources = processResources;
function processOutputs(output, parameters, conditions, resources, cfnExports = {}) {
    const stackExports = {};
    const cfnContext = { params: parameters, conditions, resources, exports: cfnExports };
    Object.values(output).forEach(output => {
        if (output.Export && output.Export.Name) {
            const exportName = field_parser_1.parseValue(output.Export.Name, cfnContext);
            let exportValue;
            try {
                exportValue = field_parser_1.parseValue(output.Value, cfnContext);
            }
            catch (e) {
                // when export section has conditional resource which is not provisioned, skip the export value
                return;
            }
            if (exportName in cfnExports) {
                throw new Error(`export ${exportName} is already exported in a different stack.`);
            }
            stackExports[exportName] = exportValue;
        }
    });
    return stackExports;
}
exports.processOutputs = processOutputs;
function processCloudFormationStack(template, parameters, cfnExports, cfnTemplateFetcher) {
    const mergedParameters = mergeParameters(template.Parameters || {}, parameters || {});
    const processedConditions = processConditions(template.Conditions || {}, mergedParameters);
    const processedResources = processResources(mergedParameters, processedConditions, template.Resources, cfnExports, cfnTemplateFetcher);
    const processedExports = processOutputs(template.Outputs || {}, mergedParameters, processedConditions, processedResources.resources, processedResources.stackExports);
    return {
        resources: processedResources.resources,
        stackExports: processedExports,
    };
}
exports.processCloudFormationStack = processCloudFormationStack;
//# sourceMappingURL=index.js.map