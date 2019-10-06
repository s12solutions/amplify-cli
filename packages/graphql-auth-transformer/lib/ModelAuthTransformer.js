"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_transformer_core_1 = require("graphql-transformer-core");
const cloudform_types_1 = require("cloudform-types");
const resources_1 = require("./resources");
const graphql_1 = require("graphql");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const graphql_mapping_template_1 = require("graphql-mapping-template");
const ModelDirectiveConfiguration_1 = require("./ModelDirectiveConfiguration");
const constants_1 = require("./constants");
const validateAuthModes = (authConfig) => {
    let additionalAuthModes = [];
    if (authConfig.additionalAuthenticationProviders) {
        additionalAuthModes = authConfig.additionalAuthenticationProviders.map(p => p.authenticationType).filter(t => !!t);
    }
    const authModes = [...additionalAuthModes, authConfig.defaultAuthentication.authenticationType];
    for (let i = 0; i < authModes.length; i++) {
        const mode = authModes[i];
        if (mode !== 'API_KEY' &&
            mode !== 'AMAZON_COGNITO_USER_POOLS' &&
            mode !== 'AWS_IAM' &&
            mode !== 'OPENID_CONNECT') {
            throw new Error(`Invalid auth mode ${mode}`);
        }
    }
};
class ModelAuthTransformer extends graphql_transformer_core_1.Transformer {
    constructor(config) {
        super('ModelAuthTransformer', graphql_transformer_core_1.gql `
            directive @auth(rules: [AuthRule!]!) on OBJECT | FIELD_DEFINITION
            input AuthRule {
                # Specifies the auth rule's strategy. Allowed values are 'owner', 'groups', 'public', 'private'.
                allow: AuthStrategy!

                # Legacy name for identityClaim
                identityField: String
                    @deprecated(reason: "The 'identityField' argument is replaced by the 'identityClaim'.")

                # Specifies the name of the provider to use for the rule. This overrides the default provider
                # when 'public' and 'private' AuthStrategy is used. Specifying a provider for 'owner' or 'groups'
                # are not allowed.
                provider: AuthProvider

                # Specifies the name of the claim to look for on the request's JWT token
                # from Cognito User Pools (and in the future OIDC) that contains the identity
                # of the user. If 'allow' is 'groups', this value should point to a list of groups
                # in the claims. If 'allow' is 'owner', this value should point to the logged in user identity string.
                # Defaults to "cognito:username" for Cognito User Pools auth.
                identityClaim: String

                # Allows for custom config of 'groups' which is validated against the JWT
                # Specifies a static list of groups that should have access to the object
                groupClaim: String

                # Allowed when the 'allow' argument is 'owner'.
                # Specifies the field of type String or [String] that contains owner(s) that can access the object.
                ownerField: String # defaults to "owner"

                # Allowed when the 'allow' argument is 'groups'.
                # Specifies the field of type String or [String] that contains group(s) that can access the object.
                groupsField: String

                # Allowed when the 'allow' argument is 'groups'.
                # Specifies a static list of groups that should have access to the object.
                groups: [String]

                # Specifies operations to which this auth rule should be applied.
                operations: [ModelOperation]

                # Connection to other auth rules with matching string. All rules with the same name must be true.
                and: String

                # Deprecated. It is recommended to use the 'operations' arguments.
                queries: [ModelQuery]
                    @deprecated(reason: "The 'queries' argument will be replaced by the 'operations' argument in a future release.")

                # Deprecated. It is recommended to use the 'operations' arguments.
                mutations: [ModelMutation]
                    @deprecated(reason: "The 'mutations' argument will be replaced by the 'operations' argument in a future release.")
            }
            enum AuthStrategy { owner groups private public }
            enum AuthProvider { apiKey iam oidc userPools }
            enum ModelOperation { create update delete read }
            enum ModelQuery
                @deprecated(reason: "ModelQuery will be replaced by the 'ModelOperation' in a future release.")
            {
                get
                list
            }
            enum ModelMutation
                @deprecated(reason: "ModelMutation will be replaced by the 'ModelOperation' in a future release.")
            {
                create
                update
                delete
            }
            `);
        /**
         * Updates the GraphQL API record with configured authentication providers
         */
        this.updateAPIAuthentication = (ctx) => {
            const apiRecord = ctx.getResource(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID);
            const updated = this.resources.updateGraphQLAPIWithAuth(apiRecord, this.config.authConfig);
            ctx.setResource(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, updated);
            // Check if we need to create an API key resource or not.
        };
        this.before = (ctx) => {
            const template = this.resources.initTemplate(this.getApiKeyConfig());
            ctx.mergeResources(template.Resources);
            ctx.mergeParameters(template.Parameters);
            ctx.mergeOutputs(template.Outputs);
            ctx.mergeConditions(template.Conditions);
            this.updateAPIAuthentication(ctx);
        };
        this.after = (ctx) => {
            if (this.generateIAMPolicyforAuthRole === true) {
                // Sanity check to make sure we're not generating invalid policies, where no resources are defined.
                if (this.authPolicyResources.size === 0) {
                    throw new Error('AuthRole policies should be generated, but no resources were added');
                }
                ctx.mergeParameters({
                    [graphql_transformer_common_1.ResourceConstants.PARAMETERS.AuthRoleName]: new cloudform_types_1.StringParameter({
                        Description: 'Reference to the name of the Auth Role created for the project.'
                    }),
                });
                ctx.mergeResources({
                    [graphql_transformer_common_1.ResourceConstants.RESOURCES.AuthRolePolicy]: this.resources.makeIAMPolicyForRole(true, this.authPolicyResources)
                });
            }
            if (this.generateIAMPolicyforUnauthRole === true) {
                // Sanity check to make sure we're not generating invalid policies, where no resources are defined.
                if (this.unauthPolicyResources.size === 0) {
                    throw new Error('UnauthRole policies should be generated, but no resources were added');
                }
                ctx.mergeParameters({
                    [graphql_transformer_common_1.ResourceConstants.PARAMETERS.UnauthRoleName]: new cloudform_types_1.StringParameter({
                        Description: 'Reference to the name of the Unauth Role created for the project.'
                    }),
                });
                ctx.mergeResources({
                    [graphql_transformer_common_1.ResourceConstants.RESOURCES.UnauthRolePolicy]: this.resources.makeIAMPolicyForRole(false, this.unauthPolicyResources)
                });
            }
        };
        /**
         * Implement the transform for an object type. Depending on which operations are to be protected
         */
        this.object = (def, directive, ctx) => {
            const modelDirective = def.directives.find((dir) => dir.name.value === 'model');
            if (!modelDirective) {
                throw new graphql_transformer_core_1.InvalidDirectiveError('Types annotated with @auth must also be annotated with @model.');
            }
            // Get and validate the auth rules.
            const rules = this.getAuthRulesFromDirective(directive);
            // Assign default providers to rules where no provider was explicitly defined
            this.ensureDefaultAuthProviderAssigned(rules);
            this.validateRules(rules);
            // Check the rules if we've to generate IAM policies for Unauth role or not
            this.setAuthPolicyFlag(rules);
            this.setUnauthPolicyFlag(rules);
            const { operationRules, queryRules } = this.splitRules(rules);
            // Retrieve the configuration options for the related @model directive
            const modelConfiguration = new ModelDirectiveConfiguration_1.ModelDirectiveConfiguration(modelDirective, def);
            // Get the directives we need to add to the GraphQL nodes
            const directives = this.getDirectivesForRules(rules, false);
            // Add the directives to the Type node itself
            if (directives.length > 0) {
                this.extendTypeWithDirectives(ctx, def.name.value, directives);
            }
            this.addTypeToResourceReferences(def.name.value, rules);
            // For each operation evaluate the rules and apply the changes to the relevant resolver.
            this.protectCreateMutation(ctx, graphql_transformer_common_1.ResolverResourceIDs.DynamoDBCreateResolverResourceID(def.name.value), operationRules.create, def, modelConfiguration);
            this.protectUpdateMutation(ctx, graphql_transformer_common_1.ResolverResourceIDs.DynamoDBUpdateResolverResourceID(def.name.value), operationRules.update, def, modelConfiguration);
            this.protectDeleteMutation(ctx, graphql_transformer_common_1.ResolverResourceIDs.DynamoDBDeleteResolverResourceID(def.name.value), operationRules.delete, def, modelConfiguration);
            this.protectGetQuery(ctx, graphql_transformer_common_1.ResolverResourceIDs.DynamoDBGetResolverResourceID(def.name.value), queryRules.get, def, modelConfiguration);
            this.protectListQuery(ctx, graphql_transformer_common_1.ResolverResourceIDs.DynamoDBListResolverResourceID(def.name.value), queryRules.list, def, modelConfiguration);
            this.protectConnections(ctx, def, operationRules.read, modelConfiguration);
            this.protectQueries(ctx, def, operationRules.read, modelConfiguration);
            // Check if subscriptions is enabled
            if (modelConfiguration.getName('level') !== "off") {
                this.protectOnCreateSubscription(ctx, operationRules.create, def, modelConfiguration);
                this.protectOnUpdateSubscription(ctx, operationRules.update, def, modelConfiguration);
                this.protectOnDeleteSubscription(ctx, operationRules.delete, def, modelConfiguration);
            }
        };
        this.field = (parent, definition, directive, ctx) => {
            if (parent.kind === graphql_1.Kind.INTERFACE_TYPE_DEFINITION) {
                throw new graphql_transformer_core_1.InvalidDirectiveError(`The @auth directive cannot be placed on an interface's field. See ${parent.name.value}${definition.name.value}`);
            }
            const modelDirective = parent.directives.find((dir) => dir.name.value === 'model');
            if (!modelDirective) {
                throw new graphql_transformer_core_1.InvalidDirectiveError('Types annotated with @auth must also be annotated with @model.');
            }
            // Retrieve the configuration options for the related @model directive
            const modelConfiguration = new ModelDirectiveConfiguration_1.ModelDirectiveConfiguration(modelDirective, parent);
            if (parent.name.value === ctx.getQueryTypeName() ||
                parent.name.value === ctx.getMutationTypeName() ||
                parent.name.value === ctx.getSubscriptionTypeName()) {
                console.warn(`Be careful when using @auth directives on a field in a root type. @auth directives on field definitions use the source \
object to perform authorization logic and the source will be an empty object for fields on root types. \
Static group authorization should perform as expected.`);
            }
            // Get and validate the auth rules.
            const rules = this.getAuthRulesFromDirective(directive);
            // Assign default providers to rules where no provider was explicitly defined
            this.ensureDefaultAuthProviderAssigned(rules);
            this.validateFieldRules(rules);
            // Check the rules if we've to generate IAM policies for Unauth role or not
            this.setAuthPolicyFlag(rules);
            this.setUnauthPolicyFlag(rules);
            this.addFieldToResourceReferences(parent.name.value, definition.name.value, rules);
            // Add the directives to the parent type as well, we've to add the default provider if
            // - The type has no @auth directives, so there are NO restrictions on the type
            // or
            // - The type has @auth rules for the default provider
            const includeDefault = this.isTypeNeedsDefaultProviderAccess(parent);
            const typeDirectives = this.getDirectivesForRules(rules, includeDefault);
            if (typeDirectives.length > 0) {
                this.extendTypeWithDirectives(ctx, parent.name.value, typeDirectives);
            }
            const isOpRule = (op) => (rule) => {
                if (rule.operations) {
                    const matchesOp = rule.operations.find(o => o === op);
                    return Boolean(matchesOp);
                }
                else if (rule.operations === null) {
                    return false;
                }
                return true;
            };
            const isReadRule = isOpRule('read');
            const isCreateRule = isOpRule('create');
            const isUpdateRule = isOpRule('update');
            const isDeleteRule = isOpRule('delete');
            // The field handler adds the read rule on the object
            const readRules = rules.filter((rule) => isReadRule(rule));
            this.protectReadForField(ctx, parent, definition, readRules, modelConfiguration);
            // Protect mutations when objects including this field are trying to be created.
            const createRules = rules.filter((rule) => isCreateRule(rule));
            this.protectCreateForField(ctx, parent, definition, createRules, modelConfiguration);
            // Protect update mutations when objects inluding this field are trying to be updated.
            const updateRules = rules.filter((rule) => isUpdateRule(rule));
            this.protectUpdateForField(ctx, parent, definition, updateRules, modelConfiguration);
            // Delete operations are only protected by @auth directives on objects.
            const deleteRules = rules.filter((rule) => isDeleteRule(rule));
            this.protectDeleteForField(ctx, parent, definition, deleteRules, modelConfiguration);
            // Check if subscriptions is enabled
            if (modelConfiguration.getName('level') !== "off") {
                this.protectOnCreateSubscription(ctx, createRules, parent, modelConfiguration);
                this.protectOnUpdateSubscription(ctx, updateRules, parent, modelConfiguration);
                this.protectOnDeleteSubscription(ctx, deleteRules, parent, modelConfiguration);
            }
        };
        if (config && config.authConfig) {
            this.config = config;
            if (!this.config.authConfig.additionalAuthenticationProviders) {
                this.config.authConfig.additionalAuthenticationProviders = [];
            }
        }
        else {
            this.config = { authConfig: { defaultAuthentication: { authenticationType: 'API_KEY' }, additionalAuthenticationProviders: [] } };
        }
        validateAuthModes(this.config.authConfig);
        this.resources = new resources_1.ResourceFactory();
        this.configuredAuthProviders = this.getConfiguredAuthProviders();
        this.generateIAMPolicyforUnauthRole = false;
        this.generateIAMPolicyforAuthRole = false;
        this.authPolicyResources = new Set();
        this.unauthPolicyResources = new Set();
    }
    getApiKeyConfig() {
        const authProviders = [];
        if (this.config.authConfig.additionalAuthenticationProviders) {
            authProviders.concat(this.config.authConfig.additionalAuthenticationProviders.filter(p => !!p.authenticationType));
        }
        authProviders.push(this.config.authConfig.defaultAuthentication);
        const apiKeyAuthProvider = authProviders.find(p => p.authenticationType === 'API_KEY');
        // Return the found instance or a default instance with 180 days of API key expiration
        return apiKeyAuthProvider ? apiKeyAuthProvider.apiKeyConfig : { apiKeyExpirationDays: 180 };
    }
    protectReadForField(ctx, parent, field, rules, modelConfiguration) {
        if (rules && rules.length) {
            // Get the directives we need to add to the GraphQL nodes
            const directives = this.getDirectivesForRules(rules, false);
            if (directives.length > 0) {
                this.addDirectivesToField(ctx, parent.name.value, field.name.value, directives);
                const addDirectivesForOperation = (operationType) => {
                    if (modelConfiguration.shouldHave(operationType)) {
                        const operationName = modelConfiguration.getName(operationType);
                        // If the parent type has any rules for this operation AND
                        // the default provider we've to get directives including the default
                        // as well.
                        const includeDefault = this.isTypeHasRulesForOperation(parent, operationType);
                        const operationDirectives = this.getDirectivesForRules(rules, includeDefault);
                        this.addDirectivesToOperation(ctx, ctx.getQueryTypeName(), operationName, operationDirectives);
                    }
                };
                addDirectivesForOperation('get');
                addDirectivesForOperation('list');
            }
            const addResourceReference = (operationType) => {
                if (modelConfiguration.shouldHave(operationType)) {
                    const operationName = modelConfiguration.getName(operationType);
                    this.addFieldToResourceReferences(ctx.getQueryTypeName(), operationName, rules);
                }
            };
            addResourceReference('get');
            addResourceReference('list');
            const resolverResourceId = graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID(parent.name.value, field.name.value);
            // If the resolver exists (e.g. @connection use it else make a blank one against None)
            let resolver = ctx.getResource(resolverResourceId);
            if (!resolver) {
                // If we need a none data source for the blank resolver, add it.
                const noneDS = ctx.getResource(graphql_transformer_common_1.ResourceConstants.RESOURCES.NoneDataSource);
                if (!noneDS) {
                    ctx.setResource(graphql_transformer_common_1.ResourceConstants.RESOURCES.NoneDataSource, this.resources.noneDataSource());
                }
                // We also need to add a stack mapping so that this resolver is added to the model stack.
                ctx.mapResourceToStack(parent.name.value, resolverResourceId);
                resolver = this.resources.blankResolver(parent.name.value, field.name.value);
            }
            const authExpression = this.authorizationExpressionOnSingleObject(rules, 'ctx.source');
            if (modelConfiguration.getName('level') === 'on') {
                if (field.type.kind === graphql_1.Kind.NON_NULL_TYPE) {
                    throw new graphql_transformer_core_1.InvalidDirectiveError(`\nPer-field auth on the required field ${field.name.value} is not supported with subscriptions.
Either make the field optional, set auth on the object and not the field, or disable subscriptions for the object (setting level to off or public)\n`);
                }
                // operation check in the protected field
                resolver.Properties.ResponseMappingTemplate = graphql_mapping_template_1.print(this.resources.operationCheckExpression(ctx.getMutationTypeName(), field.name.value));
            }
            // If a resolver exists, a @connection for example. Prepend it to the req.
            const templateParts = [
                graphql_mapping_template_1.print(authExpression),
                resolver.Properties.RequestMappingTemplate
            ];
            resolver.Properties.RequestMappingTemplate = templateParts.join('\n\n');
            ctx.setResource(resolverResourceId, resolver);
        }
    }
    protectUpdateForField(ctx, parent, field, rules, modelConfiguration) {
        const resolverResourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBUpdateResolverResourceID(parent.name.value);
        const subscriptionOperation = "onUpdate";
        this.protectUpdateMutation(ctx, resolverResourceId, rules, parent, modelConfiguration, field, subscriptionOperation);
    }
    protectDeleteForField(ctx, parent, field, rules, modelConfiguration) {
        const resolverResourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBUpdateResolverResourceID(parent.name.value);
        const subscriptionOperation = "onDelete";
        this.protectDeleteMutation(ctx, resolverResourceId, rules, parent, modelConfiguration, field, subscriptionOperation);
    }
    /**
     * Protects a create mutation based on an @auth rule specified on a @model field.
     * @param ctx The context.
     * @param typeName The parent type name.
     * @param fieldName The name of the field with the @auth directive.
     * @param rules The set of rules that should be applied to create operations.
     */
    protectCreateForField(ctx, parent, field, rules, modelConfiguration) {
        const typeName = parent.name.value;
        const resolverResourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBCreateResolverResourceID(typeName);
        const createResolverResource = ctx.getResource(resolverResourceId);
        const mutationTypeName = ctx.getMutationTypeName();
        if (rules && rules.length && createResolverResource) {
            // Get the directives we need to add to the GraphQL nodes
            const directives = this.getDirectivesForRules(rules, false);
            let operationName = undefined;
            if (directives.length > 0) {
                this.addDirectivesToField(ctx, typeName, field.name.value, directives);
                if (modelConfiguration.shouldHave('create')) {
                    // If the parent type has any rules for this operation AND
                    // the default provider we've to get directives including the default
                    // as well.
                    const includeDefault = this.isTypeHasRulesForOperation(parent, 'create');
                    const operationDirectives = this.getDirectivesForRules(rules, includeDefault);
                    operationName = modelConfiguration.getName('create');
                    this.addDirectivesToOperation(ctx, mutationTypeName, operationName, operationDirectives);
                }
            }
            if (operationName) {
                this.addFieldToResourceReferences(mutationTypeName, operationName, rules);
            }
            // Break the rules out by strategy.
            const staticGroupAuthorizationRules = this.getStaticGroupRules(rules);
            const dynamicGroupAuthorizationRules = this.getDynamicGroupRules(rules);
            const ownerAuthorizationRules = this.getOwnerRules(rules);
            if (staticGroupAuthorizationRules.length > 0 ||
                dynamicGroupAuthorizationRules.length > 0 ||
                ownerAuthorizationRules.length > 0) {
                // Generate the expressions to validate each strategy.
                const staticGroupAuthorizationExpression = this.resources.staticGroupAuthorizationExpression(staticGroupAuthorizationRules, field);
                // In create mutations, the dynamic group and ownership authorization checks
                // are done before calling PutItem.
                const dynamicGroupAuthorizationExpression = this.resources.dynamicGroupAuthorizationExpressionForCreateOperationsByField(dynamicGroupAuthorizationRules, field.name.value);
                const fieldIsList = (fieldName) => {
                    const field = parent.fields.find(field => field.name.value === fieldName);
                    if (field) {
                        return graphql_transformer_common_1.isListType(field.type);
                    }
                    return false;
                };
                const ownerAuthorizationExpression = this.resources.ownerAuthorizationExpressionForCreateOperationsByField(ownerAuthorizationRules, field.name.value, fieldIsList);
                const throwIfUnauthorizedExpression = this.resources.throwIfUnauthorized(rules, field);
                // Populate a list of configured authentication providers based on the rules
                const authModesToCheck = new Set();
                const expressions = new Array();
                if (ownerAuthorizationRules.find((r) => r.provider === 'userPools') ||
                    staticGroupAuthorizationRules.length > 0 ||
                    dynamicGroupAuthorizationRules.length > 0) {
                    authModesToCheck.add('userPools');
                }
                if (ownerAuthorizationRules.find((r) => r.provider === 'oidc')) {
                    authModesToCheck.add('oidc');
                }
                // If we've any modes to check, then add the authMode check code block
                // to the start of the resolver.
                if (authModesToCheck.size > 0) {
                    expressions.push(this.resources.getAuthModeDeterminationExpression(authModesToCheck));
                }
                // These statements will be wrapped into an authMode check if statement
                const authCheckExpressions = [
                    staticGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    dynamicGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    ownerAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    throwIfUnauthorizedExpression
                ];
                // Create the authMode if block and add it to the resolver
                expressions.push(this.resources.getAuthModeCheckWrappedExpression(authModesToCheck, graphql_mapping_template_1.compoundExpression(authCheckExpressions)));
                const templateParts = [
                    graphql_mapping_template_1.print(graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`$ctx.args.input.containsKey("${field.name.value}")`), graphql_mapping_template_1.compoundExpression(expressions))),
                    createResolverResource.Properties.RequestMappingTemplate
                ];
                createResolverResource.Properties.RequestMappingTemplate = templateParts.join('\n\n');
                ctx.setResource(resolverResourceId, createResolverResource);
            }
            if (modelConfiguration.shouldHave('onCreate') &&
                modelConfiguration.getName('level') === 'on') {
                const getTemplateParts = [
                    createResolverResource.Properties.ResponseMappingTemplate,
                ];
                if (!this.isOperationExpressionSet(mutationTypeName, createResolverResource.Properties.ResponseMappingTemplate)) {
                    getTemplateParts.unshift(this.resources.setOperationExpression(mutationTypeName));
                }
                createResolverResource.Properties.ResponseMappingTemplate = getTemplateParts.join('\n\n');
                ctx.setResource(resolverResourceId, createResolverResource);
            }
        }
    }
    /**
     * Takes a flat list of rules, each containing their own list of operations (or queries/mutations if an old API).
     * This method splits those rules into buckets keyed by operation and implements some logic for backwards compatibility.
     * @param rules The list of auth rules
     */
    splitRules(rules) {
        // Create a reverse index on rules from operation -> rules list.
        const queryRules = {
            get: [],
            list: [],
        };
        const operationRules = {
            create: [],
            update: [],
            delete: [],
            read: []
        };
        const matchQuery = (op) => (rule) => {
            if (rule.queries) {
                const matchesOp = rule.queries.find(o => o === op);
                return Boolean(matchesOp);
            }
            else if (rule.queries === null) {
                return false;
            }
            return true;
        };
        const matchMutation = (op) => (rule) => {
            if (rule.mutations) {
                const matchesOp = rule.mutations.find(o => o === op);
                return Boolean(matchesOp);
            }
            else if (rule.mutations === null) {
                return false;
            }
            return true;
        };
        const matchOperation = (op) => (rule) => {
            if (rule.operations) {
                const matchesOp = rule.operations.find(o => o === op);
                return Boolean(matchesOp);
            }
            else if (rule.operations === null) {
                return false;
            }
            return true;
        };
        for (const rule of rules) {
            // If operations is provided, then it takes precendence.
            if (isTruthyOrNull(rule.operations)) {
                // If operations is given use it.
                if (matchOperation('read')(rule)) {
                    queryRules.get.push(rule);
                    queryRules.list.push(rule);
                    operationRules.read.push(rule);
                }
                if (matchOperation('create')(rule)) {
                    operationRules.create.push(rule);
                }
                if (matchOperation('update')(rule)) {
                    operationRules.update.push(rule);
                }
                if (matchOperation('delete')(rule)) {
                    operationRules.delete.push(rule);
                }
            }
            else {
                // If operations is not provided, either use the default behavior or deprecated
                // behavior from the queries/mutations arguments for backwards compatibility.
                // Handle default or deprecated query use case
                if (isUndefined(rule.queries)) {
                    // If both operations and queries are undefined, default to read operation protection.
                    // This is the default behavior. E.G. @auth(rules: [{ allow: owner }])
                    queryRules.get.push(rule);
                    queryRules.list.push(rule);
                    operationRules.read.push(rule);
                }
                else {
                    // If operations is undefined & queries is defined, use queries.
                    // This is the old behavior for backwards compatibility.
                    if (matchQuery('get')(rule)) {
                        queryRules.get.push(rule);
                    }
                    if (matchQuery('list')(rule)) {
                        queryRules.list.push(rule);
                    }
                }
                // Handle default or deprecated mutation use case
                if (isUndefined(rule.mutations)) {
                    // If both operations and mutations are undefined, default to create, update, delete
                    // operation protection. This is the default behavior. E.G. @auth(rules: [{ allow: owner }])
                    operationRules.create.push(rule);
                    operationRules.update.push(rule);
                    operationRules.delete.push(rule);
                }
                else {
                    // If operations is undefined & mutations is defined, use mutations.
                    // This is the old behavior for backwards compatibility.
                    if (matchMutation('create')(rule)) {
                        operationRules.create.push(rule);
                    }
                    if (matchMutation('update')(rule)) {
                        operationRules.update.push(rule);
                    }
                    if (matchMutation('delete')(rule)) {
                        operationRules.delete.push(rule);
                    }
                }
            }
        }
        return {
            operationRules,
            queryRules
        };
    }
    validateRules(rules) {
        for (const rule of rules) {
            this.validateRuleAuthStrategy(rule);
            const { queries, mutations, operations } = rule;
            if (mutations && operations) {
                console.warn(`It is not recommended to use 'mutations' and 'operations'. The 'operations' argument will be used.`);
            }
            if (queries && operations) {
                console.warn(`It is not recommended to use 'queries' and 'operations'. The 'operations' argument will be used.`);
            }
            this.commonRuleValidation(rule);
        }
    }
    validateFieldRules(rules) {
        for (const rule of rules) {
            this.validateRuleAuthStrategy(rule);
            const { queries, mutations } = rule;
            if (queries || mutations) {
                throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directives used on field definitions may not specify the 'queries' or 'mutations' arguments. \
All @auth directives used on field definitions are performed when the field is resolved and can be thought of as 'read' operations.`);
            }
            this.commonRuleValidation(rule);
        }
    }
    // commmon rule validation between obj and field
    commonRuleValidation(rule) {
        const { identityField, identityClaim, allow, groups, groupsField, groupClaim } = rule;
        if (allow === 'groups' && (identityClaim || identityField)) {
            throw new graphql_transformer_core_1.InvalidDirectiveError(`
            @auth identityField/Claim can only be used for 'allow: owner'`);
        }
        if (allow === 'owner' && groupClaim) {
            throw new graphql_transformer_core_1.InvalidDirectiveError(`
            @auth groupClaim can only be used 'allow: groups'`);
        }
        if (groupsField && groups) {
            throw new graphql_transformer_core_1.InvalidDirectiveError("This rule has groupsField and groups, please use one or the other");
        }
        if (identityField && identityClaim) {
            throw new graphql_transformer_core_1.InvalidDirectiveError("Please use consider IdentifyClaim over IdentityField as it is deprecated.");
        }
    }
    /**
     * Protect get queries.
     * If static group:
     *  If statically authorized then allow the operation. Stop.
     * If owner and/or dynamic group:
     *  If the result item satisfies the owner/group authorization condition
     *  then allow it.
     * @param ctx The transformer context.
     * @param resolverResourceId The logical id of the get resolver.
     * @param rules The auth rules to apply.
     */
    protectGetQuery(ctx, resolverResourceId, rules, parent, modelConfiguration) {
        const resolver = ctx.getResource(resolverResourceId);
        if (!rules || rules.length === 0 || !resolver) {
            return;
        }
        else {
            let operationName = undefined;
            if (modelConfiguration.shouldHave('get')) {
                operationName = modelConfiguration.getName('get');
                // If the parent type has any rules for this operation AND
                // the default provider we've to get directives including the default
                // as well.
                const includeDefault = parent !== null ? this.isTypeHasRulesForOperation(parent, 'get') : false;
                const operationDirectives = this.getDirectivesForRules(rules, includeDefault);
                if (operationDirectives.length > 0) {
                    this.addDirectivesToOperation(ctx, ctx.getQueryTypeName(), operationName, operationDirectives);
                }
            }
            if (operationName) {
                this.addFieldToResourceReferences(ctx.getQueryTypeName(), operationName, rules);
            }
            const authExpression = this.authorizationExpressionOnSingleObject(rules);
            if (authExpression) {
                const templateParts = [
                    graphql_mapping_template_1.print(authExpression),
                    resolver.Properties.ResponseMappingTemplate
                ];
                resolver.Properties.ResponseMappingTemplate = templateParts.join('\n\n');
                ctx.setResource(resolverResourceId, resolver);
            }
        }
    }
    authorizationExpressionOnSingleObject(rules, objectPath = 'ctx.result') {
        // Break the rules out by strategy.
        const staticGroupAuthorizationRules = this.getStaticGroupRules(rules);
        const dynamicGroupAuthorizationRules = this.getDynamicGroupRules(rules);
        const ownerAuthorizationRules = this.getOwnerRules(rules);
        if (staticGroupAuthorizationRules.length > 0 ||
            dynamicGroupAuthorizationRules.length > 0 ||
            ownerAuthorizationRules.length > 0) {
            // Generate the expressions to validate each strategy.
            const staticGroupAuthorizationExpression = this.resources.staticGroupAuthorizationExpression(staticGroupAuthorizationRules);
            const dynamicGroupAuthorizationExpression = this.resources.dynamicGroupAuthorizationExpressionForReadOperations(dynamicGroupAuthorizationRules, objectPath);
            const ownerAuthorizationExpression = this.resources.ownerAuthorizationExpressionForReadOperations(ownerAuthorizationRules, objectPath);
            const throwIfUnauthorizedExpression = this.resources.throwIfUnauthorized(rules);
            // If we've any modes to check, then add the authMode check code block
            // to the start of the resolver.
            const authModesToCheck = new Set();
            const expressions = new Array();
            if (ownerAuthorizationRules.find((r) => r.provider === 'userPools') ||
                staticGroupAuthorizationRules.length > 0 ||
                dynamicGroupAuthorizationRules.length > 0) {
                authModesToCheck.add('userPools');
            }
            if (ownerAuthorizationRules.find((r) => r.provider === 'oidc')) {
                authModesToCheck.add('oidc');
            }
            if (authModesToCheck.size > 0) {
                expressions.push(this.resources.getAuthModeDeterminationExpression(authModesToCheck));
            }
            // Update the existing resolver with the authorization checks.
            // These statements will be wrapped into an authMode check if statement
            const templateExpressions = [
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.CompoundAuthRuleCounts), graphql_mapping_template_1.obj({})),
                staticGroupAuthorizationExpression,
                graphql_mapping_template_1.newline(),
                dynamicGroupAuthorizationExpression,
                graphql_mapping_template_1.newline(),
                ownerAuthorizationExpression,
                graphql_mapping_template_1.newline(),
                throwIfUnauthorizedExpression
            ];
            // These statements will be wrapped into an authMode check if statement
            expressions.push(this.resources.getAuthModeCheckWrappedExpression(authModesToCheck, graphql_mapping_template_1.compoundExpression(templateExpressions)));
            return graphql_mapping_template_1.compoundExpression(expressions);
        }
    }
    /**
     * Protect list queries.
     * If static group:
     *  If the user is statically authorized then return items and stop.
     * If dynamic group and/or owner:
     *  Loop through all items and find items that satisfy any of the group or
     *  owner conditions.
     * @param ctx The transformer context.
     * @param resolverResourceId The logical id of the resolver to be updated in the CF template.
     * @param rules The set of rules that apply to the operation.
     */
    protectListQuery(ctx, resolverResourceId, rules, parent, modelConfiguration, explicitOperationName = undefined) {
        const resolver = ctx.getResource(resolverResourceId);
        if (!rules || rules.length === 0 || !resolver) {
            return;
        }
        else {
            if (modelConfiguration.shouldHave('list')) {
                const operationName = explicitOperationName ? explicitOperationName : modelConfiguration.getName('list');
                // If the parent type has any rules for this operation AND
                // the default provider we've to get directives including the default
                // as well.
                const includeDefault = parent !== null ? this.isTypeHasRulesForOperation(parent, 'list') : false;
                const operationDirectives = this.getDirectivesForRules(rules, includeDefault);
                if (operationDirectives.length > 0) {
                    this.addDirectivesToOperation(ctx, ctx.getQueryTypeName(), operationName, operationDirectives);
                }
                this.addFieldToResourceReferences(ctx.getQueryTypeName(), operationName, rules);
            }
            const authExpression = this.authorizationExpressionForListResult(rules);
            if (authExpression) {
                const templateParts = [
                    graphql_mapping_template_1.print(authExpression),
                    resolver.Properties.ResponseMappingTemplate
                ];
                resolver.Properties.ResponseMappingTemplate = templateParts.join('\n\n');
                ctx.setResource(resolverResourceId, resolver);
            }
        }
    }
    /**
     * Returns a VTL expression that will authorize a list of results based on a set of auth rules.
     * @param rules The auth rules.
     */
    authorizationExpressionForListResult(rules) {
        // Break the rules out by strategy.
        const staticGroupAuthorizationRules = this.getStaticGroupRules(rules);
        const dynamicGroupAuthorizationRules = this.getDynamicGroupRules(rules);
        const ownerAuthorizationRules = this.getOwnerRules(rules);
        if (staticGroupAuthorizationRules.length > 0 ||
            dynamicGroupAuthorizationRules.length > 0 ||
            ownerAuthorizationRules.length > 0) {
            // Generate the expressions to validate each strategy.
            const staticGroupAuthorizationExpression = this.resources.staticGroupAuthorizationExpression(staticGroupAuthorizationRules);
            // In list queries, the dynamic group and ownership authorization checks
            // occur on a per item basis. The helpers take the variable names
            // as parameters to allow for this use case.
            const dynamicGroupAuthorizationExpression = this.resources.dynamicGroupAuthorizationExpressionForReadOperations(dynamicGroupAuthorizationRules, 'item', graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsLocalDynamicGroupAuthorizedVariable, graphql_mapping_template_1.raw(`false`));
            const ownerAuthorizationExpression = this.resources.ownerAuthorizationExpressionForReadOperations(ownerAuthorizationRules, 'item', graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsLocalOwnerAuthorizedVariable, graphql_mapping_template_1.raw(`false`));
            const appendIfLocallyAuthorized = this.resources.appendItemIfLocallyAuthorized(rules);
            const ifNotStaticallyAuthedFilterObjects = graphql_mapping_template_1.iff(rules.some(r => r.and)
                ? graphql_mapping_template_1.raw('true')
                : graphql_mapping_template_1.raw(`! $${graphql_transformer_common_1.ResourceConstants.SNIPPETS.IsStaticGroupAuthorizedVariable}`), graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('items'), graphql_mapping_template_1.list([])),
                graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('item'), graphql_mapping_template_1.ref('ctx.result.items'), [
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.StaticCompoundAuthRuleCounts), graphql_mapping_template_1.raw(`$util.parseJson($util.toJson($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.CompoundAuthRuleCounts}))`)),
                    dynamicGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    ownerAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    appendIfLocallyAuthorized
                ]),
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('ctx.result.items'), graphql_mapping_template_1.ref('items'))
            ]));
            // If we've any modes to check, then add the authMode check code block
            // to the start of the resolver.
            const authModesToCheck = new Set();
            const expressions = new Array();
            if (ownerAuthorizationRules.find((r) => r.provider === 'userPools') ||
                staticGroupAuthorizationRules.length > 0 ||
                dynamicGroupAuthorizationRules.length > 0) {
                authModesToCheck.add('userPools');
            }
            if (ownerAuthorizationRules.find((r) => r.provider === 'oidc')) {
                authModesToCheck.add('oidc');
            }
            if (authModesToCheck.size > 0) {
                expressions.push(this.resources.getAuthModeDeterminationExpression(authModesToCheck));
            }
            // These statements will be wrapped into an authMode check if statement
            const templateExpressions = [
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.CompoundAuthRuleCounts), graphql_mapping_template_1.obj({})),
                staticGroupAuthorizationExpression,
                graphql_mapping_template_1.newline(),
                graphql_mapping_template_1.comment('[Start] If not static group authorized, filter items'),
                ifNotStaticallyAuthedFilterObjects,
                graphql_mapping_template_1.comment('[End] If not static group authorized, filter items')
            ];
            // Create the authMode if block and add it to the resolver
            expressions.push(this.resources.getAuthModeCheckWrappedExpression(authModesToCheck, graphql_mapping_template_1.compoundExpression(templateExpressions)));
            return graphql_mapping_template_1.compoundExpression(expressions);
        }
    }
    /**
     * Inject auth rules for create mutations.
     * If owner auth:
     *  If the owner field exists in the input, validate that it against the identity.
     *  If the owner field dne in the input, insert the identity.
     * If group:
     *  If the user is static group authorized allow operation no matter what.
     *  If dynamic group and the input defines a group(s) validate it against the identity.
     * @param ctx
     * @param resolverResourceId
     * @param rules
     */
    protectCreateMutation(ctx, resolverResourceId, rules, parent, modelConfiguration) {
        const resolver = ctx.getResource(resolverResourceId);
        if (!rules || rules.length === 0 || !resolver) {
            return;
        }
        else {
            const mutationTypeName = ctx.getMutationTypeName();
            if (modelConfiguration.shouldHave('create')) {
                const operationName = modelConfiguration.getName('create');
                // If the parent type has any rules for this operation AND
                // the default provider we've to get directives including the default
                // as well.
                const includeDefault = this.isTypeHasRulesForOperation(parent, 'create');
                const operationDirectives = this.getDirectivesForRules(rules, includeDefault);
                if (operationDirectives.length > 0) {
                    this.addDirectivesToOperation(ctx, mutationTypeName, operationName, operationDirectives);
                }
                this.addFieldToResourceReferences(mutationTypeName, operationName, rules);
            }
            // Break the rules out by strategy.
            const staticGroupAuthorizationRules = this.getStaticGroupRules(rules);
            const dynamicGroupAuthorizationRules = this.getDynamicGroupRules(rules);
            const ownerAuthorizationRules = this.getOwnerRules(rules);
            if (staticGroupAuthorizationRules.length > 0 ||
                dynamicGroupAuthorizationRules.length > 0 ||
                ownerAuthorizationRules.length > 0) {
                // Generate the expressions to validate each strategy.
                const staticGroupAuthorizationExpression = this.resources.staticGroupAuthorizationExpression(staticGroupAuthorizationRules);
                // In create mutations, the dynamic group and ownership authorization checks
                // are done before calling PutItem.
                const dynamicGroupAuthorizationExpression = this.resources.dynamicGroupAuthorizationExpressionForCreateOperations(dynamicGroupAuthorizationRules);
                const fieldIsList = (fieldName) => {
                    const field = parent.fields.find(field => field.name.value === fieldName);
                    if (field) {
                        return graphql_transformer_common_1.isListType(field.type);
                    }
                    return false;
                };
                const ownerAuthorizationExpression = this.resources.ownerAuthorizationExpressionForCreateOperations(ownerAuthorizationRules, fieldIsList);
                const throwIfUnauthorizedExpression = this.resources.throwIfUnauthorized(rules);
                // If we've any modes to check, then add the authMode check code block
                // to the start of the resolver.
                const authModesToCheck = new Set();
                const expressions = new Array();
                if (ownerAuthorizationRules.find((r) => r.provider === 'userPools') ||
                    staticGroupAuthorizationRules.length > 0 ||
                    dynamicGroupAuthorizationRules.length > 0) {
                    authModesToCheck.add('userPools');
                }
                if (ownerAuthorizationRules.find((r) => r.provider === 'oidc')) {
                    authModesToCheck.add('oidc');
                }
                if (authModesToCheck.size > 0) {
                    expressions.push(this.resources.getAuthModeDeterminationExpression(authModesToCheck));
                }
                // These statements will be wrapped into an authMode check if statement
                const authCheckExpressions = [
                    this.resources.auditExpression(rules, this.config.authConfig.defaultAuthentication.authenticationType),
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.CompoundAuthRuleCounts), graphql_mapping_template_1.obj({})),
                    staticGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    dynamicGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    ownerAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    throwIfUnauthorizedExpression
                ];
                // Create the authMode if block and add it to the resolver
                expressions.push(this.resources.getAuthModeCheckWrappedExpression(authModesToCheck, graphql_mapping_template_1.compoundExpression(authCheckExpressions)));
                const templateParts = [
                    graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(expressions)),
                    resolver.Properties.RequestMappingTemplate
                ];
                resolver.Properties.RequestMappingTemplate = templateParts.join('\n\n');
                ctx.setResource(resolverResourceId, resolver);
            }
        }
    }
    /**
     * Protect update and delete mutations.
     * If Owner:
     *  Update the conditional expression such that the update only works if
     *  the user is the owner.
     * If dynamic group:
     *  Update the conditional expression such that it succeeds if the user is
     *  dynamic group authorized. If the operation is also owner authorized this
     *  should be joined with an OR expression.
     * If static group:
     *  If the user is statically authorized then allow no matter what. This can
     *  be done by removing the conditional expression as long as static group
     *  auth is always checked last.
     * @param ctx The transformer context.
     * @param resolverResourceId The logical id of the resolver in the template.
     * @param rules The list of rules to apply.
     */
    protectUpdateOrDeleteMutation(ctx, resolverResourceId, rules, parent, modelConfiguration, isUpdate, field, ifCondition, subscriptionOperation) {
        const resolver = ctx.getResource(resolverResourceId);
        if (!rules || rules.length === 0 || !resolver) {
            return;
        }
        else {
            const mutationTypeName = ctx.getMutationTypeName();
            if (modelConfiguration.shouldHave(isUpdate ? 'update' : 'delete')) {
                const operationName = modelConfiguration.getName(isUpdate ? 'update' : 'delete');
                // If the parent type has any rules for this operation AND
                // the default provider we've to get directives including the default
                // as well.
                const includeDefault = Boolean(!field && this.isTypeHasRulesForOperation(parent, isUpdate ? 'update' : 'delete'));
                const operationDirectives = this.getDirectivesForRules(rules, includeDefault);
                if (operationDirectives.length > 0) {
                    this.addDirectivesToOperation(ctx, mutationTypeName, operationName, operationDirectives);
                }
                this.addFieldToResourceReferences(mutationTypeName, operationName, rules);
            }
            // Break the rules out by strategy.
            const staticGroupAuthorizationRules = this.getStaticGroupRules(rules);
            const dynamicGroupAuthorizationRules = this.getDynamicGroupRules(rules);
            const ownerAuthorizationRules = this.getOwnerRules(rules);
            if (staticGroupAuthorizationRules.length > 0 ||
                dynamicGroupAuthorizationRules.length > 0 ||
                ownerAuthorizationRules.length > 0) {
                // Generate the expressions to validate each strategy.
                const staticGroupAuthorizationExpression = this.resources.staticGroupAuthorizationExpression(staticGroupAuthorizationRules, field);
                // In create mutations, the dynamic group and ownership authorization checks
                // are done before calling PutItem.
                const dynamicGroupAuthorizationExpression = this.resources.dynamicGroupAuthorizationExpressionForUpdateOrDeleteOperations(dynamicGroupAuthorizationRules, staticGroupAuthorizationRules, field ? field.name.value : undefined);
                const fieldIsList = (fieldName) => {
                    const field = parent.fields.find(field => field.name.value === fieldName);
                    if (field) {
                        return graphql_transformer_common_1.isListType(field.type);
                    }
                    return false;
                };
                const ownerAuthorizationExpression = this.resources.ownerAuthorizationExpressionForUpdateOrDeleteOperations(ownerAuthorizationRules, staticGroupAuthorizationRules, fieldIsList, field ? field.name.value : undefined);
                const collectAuthCondition = this.resources.collectAuthCondition();
                const staticGroupAuthorizedVariable = this.resources.getStaticAuthorizationVariable(field);
                const ifNotStaticallyAuthedCreateAuthCondition = graphql_mapping_template_1.iff(graphql_mapping_template_1.raw(`! $${staticGroupAuthorizedVariable}`), graphql_mapping_template_1.compoundExpression([
                    dynamicGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    ownerAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    collectAuthCondition
                ]));
                const throwIfNotStaticGroupAuthorizedOrAuthConditionIsEmpty = this.resources.throwIfNotStaticGroupAuthorizedOrAuthConditionIsEmpty(field);
                // If we've any modes to check, then add the authMode check code block
                // to the start of the resolver.
                const authModesToCheck = new Set();
                const expressions = new Array();
                if (ownerAuthorizationRules.find((r) => r.provider === 'userPools') ||
                    staticGroupAuthorizationRules.length > 0 ||
                    dynamicGroupAuthorizationRules.length > 0) {
                    authModesToCheck.add('userPools');
                }
                if (ownerAuthorizationRules.find((r) => r.provider === 'oidc')) {
                    authModesToCheck.add('oidc');
                }
                if (authModesToCheck.size > 0) {
                    expressions.push(this.resources.getAuthModeDeterminationExpression(authModesToCheck));
                }
                // These statements will be wrapped into an authMode check if statement
                const authorizationLogic = graphql_mapping_template_1.compoundExpression([
                    graphql_mapping_template_1.set(graphql_mapping_template_1.ref(graphql_transformer_common_1.ResourceConstants.SNIPPETS.CompoundAuthRuleCounts), graphql_mapping_template_1.raw(`$util.defaultIfNull($${graphql_transformer_common_1.ResourceConstants.SNIPPETS.CompoundAuthRuleCounts}, {})`)),
                    staticGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    ifNotStaticallyAuthedCreateAuthCondition,
                    graphql_mapping_template_1.newline(),
                    throwIfNotStaticGroupAuthorizedOrAuthConditionIsEmpty
                ]);
                // Create the authMode if block and add it to the resolver
                expressions.push(this.resources.getAuthModeCheckWrappedExpression(authModesToCheck, authorizationLogic));
                const templateParts = [
                    graphql_mapping_template_1.print(field && ifCondition ?
                        graphql_mapping_template_1.iff(ifCondition, graphql_mapping_template_1.compoundExpression(expressions)) :
                        graphql_mapping_template_1.compoundExpression(expressions)),
                    resolver.Properties.RequestMappingTemplate
                ];
                if (!field) {
                    templateParts.unshift(graphql_mapping_template_1.print(this.resources.auditExpression(rules, this.config.authConfig.defaultAuthentication.authenticationType)));
                }
                resolver.Properties.RequestMappingTemplate = templateParts.join('\n\n');
                ctx.setResource(resolverResourceId, resolver);
            }
            // if protect is for field and there is a subscription for update / delete then protect the field in that operation
            if (field && subscriptionOperation &&
                modelConfiguration.shouldHave(subscriptionOperation) &&
                modelConfiguration.getName('level') === 'on') {
                let mutationResolver = resolver;
                let mutationResolverResourceID = resolverResourceId;
                // if we are protecting delete then we need to get the delete resolver
                if (subscriptionOperation === 'onDelete') {
                    mutationResolverResourceID = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBDeleteResolverResourceID(parent.name.value);
                    mutationResolver = ctx.getResource(mutationResolverResourceID);
                }
                const deleteResolver = ctx.getResource(resolverResourceId);
                const getTemplateParts = [
                    mutationResolver.Properties.ResponseMappingTemplate,
                ];
                if (!this.isOperationExpressionSet(mutationTypeName, mutationResolver.Properties.ResponseMappingTemplate)) {
                    getTemplateParts.unshift(this.resources.setOperationExpression(mutationTypeName));
                }
                mutationResolver.Properties.ResponseMappingTemplate = getTemplateParts.join('\n\n');
                ctx.setResource(mutationResolverResourceID, mutationResolver);
            }
        }
    }
    /**
     * If we are protecting the mutation for a field level @auth directive, include
     * the necessary if condition.
     * @param ctx The transformer context
     * @param resolverResourceId The resolver resource id
     * @param rules The delete rules
     * @param parent The parent object
     * @param field The optional field
     */
    protectUpdateMutation(ctx, resolverResourceId, rules, parent, modelConfiguration, field, subscriptionOperation) {
        return this.protectUpdateOrDeleteMutation(ctx, resolverResourceId, rules, parent, modelConfiguration, true, field, field ? graphql_mapping_template_1.raw(`$ctx.args.input.containsKey("${field.name.value}")`) : undefined, subscriptionOperation);
    }
    /**
     * If we are protecting the mutation for a field level @auth directive, include
     * the necessary if condition.
     * @param ctx The transformer context
     * @param resolverResourceId The resolver resource id
     * @param rules The delete rules
     * @param parent The parent object
     * @param field The optional field
     */
    protectDeleteMutation(ctx, resolverResourceId, rules, parent, modelConfiguration, field, subscriptionOperation) {
        return this.protectUpdateOrDeleteMutation(ctx, resolverResourceId, rules, parent, modelConfiguration, false, field, field ? graphql_mapping_template_1.raw(`$ctx.args.input.containsKey("${field.name.value}") && $util.isNull($ctx.args.input.get("${field.name.value}"))`) : undefined, subscriptionOperation);
    }
    /**
     * When read operations are protected via @auth, all @connection resolvers will be protected.
     * Find the directives & update their resolvers with auth logic
     */
    protectConnections(ctx, def, rules, modelConfiguration) {
        const thisModelName = def.name.value;
        for (const inputDef of ctx.inputDocument.definitions) {
            if (inputDef.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION) {
                for (const field of inputDef.fields) {
                    const returnTypeName = graphql_transformer_common_1.getBaseType(field.type);
                    if (fieldHasDirective(field, 'connection') && returnTypeName === thisModelName) {
                        const resolverResourceId = graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID(inputDef.name.value, field.name.value);
                        // Add the auth directives to the connection to make sure the
                        // member is accessible.
                        const directives = this.getDirectivesForRules(rules, false);
                        if (directives.length > 0) {
                            this.addDirectivesToField(ctx, inputDef.name.value, field.name.value, directives);
                        }
                        if (graphql_transformer_common_1.isListType(field.type)) {
                            this.protectListQuery(ctx, resolverResourceId, rules, null, modelConfiguration);
                        }
                        else {
                            this.protectGetQuery(ctx, resolverResourceId, rules, null, modelConfiguration);
                        }
                    }
                }
            }
        }
    }
    /**
     * When read operations are protected via @auth, all secondary @key query resolvers will be protected.
     * Find the directives & update their resolvers with auth logic
     */
    protectQueries(ctx, def, rules, modelConfiguration) {
        const secondaryKeyDirectivesWithQueries = (def.directives || []).filter(d => {
            const isKey = d.name.value === 'key';
            const args = graphql_transformer_core_1.getDirectiveArguments(d);
            // @key with a name is a secondary key.
            const isSecondaryKey = Boolean(args.name);
            const hasQueryField = Boolean(args.queryField);
            return isKey && isSecondaryKey && hasQueryField;
        });
        for (const keyWithQuery of secondaryKeyDirectivesWithQueries) {
            const args = graphql_transformer_core_1.getDirectiveArguments(keyWithQuery);
            const resolverResourceId = graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID(ctx.getQueryTypeName(), args.queryField);
            this.protectListQuery(ctx, resolverResourceId, rules, null, modelConfiguration, args.queryField);
        }
    }
    // OnCreate Subscription
    protectOnCreateSubscription(ctx, rules, parent, modelConfiguration) {
        const names = modelConfiguration.getNames('onCreate');
        const level = modelConfiguration.getName('level');
        if (names) {
            names.forEach((name) => {
                this.addSubscriptionResolvers(ctx, rules, parent, level, name, 'create');
            });
        }
    }
    // OnUpdate Subscription
    protectOnUpdateSubscription(ctx, rules, parent, modelConfiguration) {
        const names = modelConfiguration.getNames('onUpdate');
        const level = modelConfiguration.getName('level');
        if (names) {
            names.forEach((name) => {
                this.addSubscriptionResolvers(ctx, rules, parent, level, name, 'update');
            });
        }
    }
    // OnDelete Subscription
    protectOnDeleteSubscription(ctx, rules, parent, modelConfiguration) {
        const names = modelConfiguration.getNames('onDelete');
        const level = modelConfiguration.getName('level');
        if (names) {
            names.forEach((name) => {
                this.addSubscriptionResolvers(ctx, rules, parent, level, name, 'delete');
            });
        }
    }
    // adds subscription resolvers (request / response) based on the operation provided
    addSubscriptionResolvers(ctx, rules, parent, level, fieldName, mutationOperation) {
        const resolverResourceId = graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Subscription", fieldName);
        const resolver = this.resources.generateSubscriptionResolver(fieldName);
        // If the data source does not exist it is created and added as a resource for public && on levels
        const noneDS = ctx.getResource(graphql_transformer_common_1.ResourceConstants.RESOURCES.NoneDataSource);
        // add the rules in the subscription resolver
        if (!rules || rules.length === 0) {
            return;
        }
        else if (level === 'public') {
            // set the resource with no auth logic
            ctx.setResource(resolverResourceId, resolver);
        }
        else {
            // Get the directives we need to add to the GraphQL nodes
            const includeDefault = parent !== null ? this.isTypeHasRulesForOperation(parent, mutationOperation) : false;
            const directives = this.getDirectivesForRules(rules, includeDefault);
            if (directives.length > 0) {
                this.addDirectivesToField(ctx, ctx.getSubscriptionTypeName(), fieldName, directives);
            }
            this.addFieldToResourceReferences(ctx.getSubscriptionTypeName(), fieldName, rules);
            // Break the rules out by strategy.
            const staticGroupAuthorizationRules = this.getStaticGroupRules(rules);
            const ownerAuthorizationRules = this.getOwnerRules(rules);
            if (staticGroupAuthorizationRules.length > 0 ||
                ownerAuthorizationRules.length > 0) {
                const staticGroupAuthorizationExpression = this.resources.staticGroupAuthorizationExpression(staticGroupAuthorizationRules);
                const ownerAuthorizationExpression = this.resources.ownerAuthorizationExpressionForSubscriptions(ownerAuthorizationRules);
                const throwIfUnauthorizedExpression = this.resources.throwIfSubscriptionUnauthorized(rules);
                // Populate a list of configured authentication providers based on the rules
                const authModesToCheck = new Set();
                const expressions = new Array();
                if (ownerAuthorizationRules.find((r) => r.provider === 'userPools') ||
                    staticGroupAuthorizationRules.length > 0) {
                    authModesToCheck.add('userPools');
                }
                if (ownerAuthorizationRules.find((r) => r.provider === 'oidc')) {
                    authModesToCheck.add('oidc');
                }
                // If we've any modes to check, then add the authMode check code block
                // to the start of the resolver.
                if (authModesToCheck.size > 0) {
                    expressions.push(this.resources.getAuthModeDeterminationExpression(authModesToCheck));
                }
                const authCheckExpressions = [
                    staticGroupAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    ownerAuthorizationExpression,
                    graphql_mapping_template_1.newline(),
                    throwIfUnauthorizedExpression
                ];
                // Create the authMode if block and add it to the resolver
                expressions.push(this.resources.getAuthModeCheckWrappedExpression(authModesToCheck, graphql_mapping_template_1.compoundExpression(authCheckExpressions)));
                const templateParts = [
                    graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression(expressions)),
                    resolver.Properties.ResponseMappingTemplate
                ];
                resolver.Properties.ResponseMappingTemplate = templateParts.join('\n\n');
                ctx.setResource(resolverResourceId, resolver);
                // check if owner is enabled in auth
                const hasOwner = rules.find(rule => rule.allow === constants_1.OWNER_AUTH_STRATEGY && !rule.ownerField);
                const hasStaticGroupAuth = rules.find(rule => rule.allow === constants_1.GROUPS_AUTH_STRATEGY && !rule.groupsField);
                if (hasOwner) {
                    this.addOwner(ctx, parent.name.value);
                    // If static group is specified in any of the rules then it would specify the owner arg as optional
                    if (hasStaticGroupAuth) {
                        this.addSubscriptionOwnerArgument(ctx, resolver, false);
                    }
                    else {
                        this.addSubscriptionOwnerArgument(ctx, resolver, true);
                    }
                }
            }
        }
        // If the subscription level is set to public it adds the subscription resolver with no auth logic
        if (!noneDS) {
            ctx.setResource(graphql_transformer_common_1.ResourceConstants.RESOURCES.NoneDataSource, this.resources.noneDataSource());
        }
        // finally map the resource to the stack
        ctx.mapResourceToStack(parent.name.value, resolverResourceId);
    }
    addSubscriptionOwnerArgument(ctx, resolver, makeNonNull = false) {
        let subscription = ctx.getSubscription();
        let createField = subscription.fields.find(field => field.name.value === resolver.Properties.FieldName);
        const nameNode = makeNonNull ? graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType('String')) : graphql_transformer_common_1.makeNamedType('String');
        const createArguments = [graphql_transformer_common_1.makeInputValueDefinition(constants_1.DEFAULT_OWNER_FIELD, nameNode)];
        createField = Object.assign(Object.assign({}, createField), { arguments: createArguments });
        subscription = Object.assign(Object.assign({}, subscription), { fields: subscription.fields.map(field => field.name.value === resolver.Properties.FieldName ? createField : field) });
        ctx.putType(subscription);
    }
    addOwner(ctx, parent) {
        const modelType = ctx.getType(parent);
        const fields = graphql_transformer_core_1.getFieldArguments(modelType);
        if (!("owner" in fields)) {
            modelType.fields.push(graphql_transformer_common_1.makeField(constants_1.DEFAULT_OWNER_FIELD, [], graphql_transformer_common_1.makeNamedType('String')));
        }
        ctx.putType(modelType);
    }
    getOwnerRules(rules) {
        return rules.filter(rule => rule.allow === 'owner');
    }
    getStaticGroupRules(rules) {
        return rules.filter(rule => rule.allow === 'groups' && Boolean(rule.groups));
    }
    getDynamicGroupRules(rules) {
        return rules.filter(rule => rule.allow === 'groups' && !Boolean(rule.groups));
    }
    extendTypeWithDirectives(ctx, typeName, directives) {
        let objectTypeExtension = graphql_transformer_common_1.blankObjectExtension(typeName);
        objectTypeExtension = graphql_transformer_common_1.extensionWithDirectives(objectTypeExtension, directives);
        ctx.addObjectExtension(objectTypeExtension);
    }
    addDirectivesToOperation(ctx, typeName, operationName, directives) {
        // Add the directives to the given operation
        this.addDirectivesToField(ctx, typeName, operationName, directives);
        // Add the directives to the result type of the operation;
        const type = ctx.getType(typeName);
        if (type) {
            const field = type.fields.find((f) => f.name.value === operationName);
            if (field) {
                const returnFieldType = field.type;
                if (returnFieldType.name) {
                    const returnTypeName = returnFieldType.name.value;
                    this.extendTypeWithDirectives(ctx, returnTypeName, directives);
                }
            }
        }
    }
    addDirectivesToField(ctx, typeName, fieldName, directives) {
        const type = ctx.getType(typeName);
        if (type) {
            const field = type.fields.find((f) => f.name.value === fieldName);
            if (field) {
                const newFields = [
                    ...type.fields.filter((f) => f.name.value !== field.name.value),
                    graphql_transformer_common_1.extendFieldWithDirectives(field, directives)
                ];
                const newMutation = Object.assign(Object.assign({}, type), { fields: newFields });
                ctx.putType(newMutation);
            }
        }
    }
    getDirectivesForRules(rules, addDefaultIfNeeded = true) {
        if (!rules || rules.length === 0) {
            return [];
        }
        const directives = new Array();
        //
        // We only add a directive if it is not the default auth or
        // if it is the default one, but there are other rules for a
        // different provider.
        // For fields we don't add the default, since it would open up
        // the access rights.
        //
        const addDirectiveIfNeeded = (provider, directiveName) => {
            if ((this.configuredAuthProviders.default !== provider &&
                Boolean(rules.find((r) => r.provider === provider))) ||
                (this.configuredAuthProviders.default === provider &&
                    Boolean(rules.find((r) => r.provider !== provider &&
                        addDefaultIfNeeded === true)))) {
                directives.push(graphql_transformer_common_1.makeDirective(directiveName, []));
            }
        };
        const authProviderDirectiveMap = new Map([
            ['apiKey', 'aws_api_key'],
            ['iam', 'aws_iam'],
            ['oidc', 'aws_oidc'],
            ['userPools', 'aws_cognito_user_pools'],
        ]);
        for (const entry of authProviderDirectiveMap.entries()) {
            addDirectiveIfNeeded(entry[0], entry[1]);
        }
        //
        // If we've any rules for other than the default provider AND
        // we've rules for the default provider as well add the default provider's
        // directive, regardless of the addDefaultIfNeeded flag.
        //
        // For example if we've this rule and the default is API_KEY:
        //
        // @auth(rules: [{allow: owner},{allow: public, operations: [read]}])
        //
        // Then we need to add @aws_api_key on the create mutation together with the
        // @aws_cognito_useR_pools, but we cannot add @was_api_key to other operations
        // since that is not allowed by the rule.
        //
        if (Boolean(rules.find((r) => r.provider === this.configuredAuthProviders.default)) &&
            Boolean(rules.find((r) => r.provider !== this.configuredAuthProviders.default) &&
                !Boolean(directives.find((d) => d.name.value ===
                    authProviderDirectiveMap.get(this.configuredAuthProviders.default))))) {
            directives.push(graphql_transformer_common_1.makeDirective(authProviderDirectiveMap.get(this.configuredAuthProviders.default), []));
        }
        return directives;
    }
    ensureDefaultAuthProviderAssigned(rules) {
        // We assign the default provider if an override is not present make further handling easier.
        for (const rule of rules) {
            if (!rule.provider) {
                switch (rule.allow) {
                    case 'owner':
                    case 'groups':
                        rule.provider = 'userPools';
                        break;
                    case 'private':
                        rule.provider = 'userPools';
                        break;
                    case 'public':
                        rule.provider = 'apiKey';
                        break;
                    default:
                        rule.provider = null;
                        break;
                }
            }
        }
    }
    validateRuleAuthStrategy(rule) {
        //
        // Groups
        //
        if (rule.allow === 'groups' && rule.provider !== 'userPools') {
            throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'groups' strategy only supports 'userPools' provider, but found '${rule.provider}' assigned.`);
        }
        //
        // Owner
        //
        if (rule.allow === 'owner') {
            if (rule.provider !== null && rule.provider !== 'userPools' && rule.provider !== 'oidc') {
                throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'owner' strategy only supports 'userPools' (default) and 'oidc' providers, but \
found '${rule.provider}' assigned.`);
            }
        }
        //
        // Public
        //
        if (rule.allow === 'public') {
            if (rule.provider !== null && rule.provider !== 'apiKey' && rule.provider !== 'iam') {
                throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'public' strategy only supports 'apiKey' (default) and 'iam' providers, but \
found '${rule.provider}' assigned.`);
            }
        }
        //
        // Private
        //
        if (rule.allow === 'private') {
            if (rule.provider !== null && rule.provider !== 'userPools' && rule.provider !== 'iam') {
                throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'private' strategy only supports 'userPools' (default) and 'iam' providers, but \
found '${rule.provider}' assigned.`);
            }
        }
        //
        // Validate provider values against project configuration.
        //
        if (rule.provider === 'apiKey' && this.configuredAuthProviders.hasApiKey === false) {
            throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'apiKey' provider found, but the project has no API Key authentication provider configured.`);
        }
        else if (rule.provider === 'oidc' && this.configuredAuthProviders.hasOIDC === false) {
            throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'oidc' provider found, but the project has no OPENID_CONNECT authentication provider configured.`);
        }
        else if (rule.provider === 'userPools' && this.configuredAuthProviders.hasUserPools === false) {
            throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'userPools' provider found, but the project has no Cognito User Pools authentication provider configured.`);
        }
        else if (rule.provider === 'iam' && this.configuredAuthProviders.hasIAM === false) {
            throw new graphql_transformer_core_1.InvalidDirectiveError(`@auth directive with 'iam' provider found, but the project has no IAM authentication provider configured.`);
        }
    }
    getConfiguredAuthProviders() {
        const providers = [
            this.config.authConfig.defaultAuthentication.authenticationType,
            ...this.config.authConfig.additionalAuthenticationProviders.map((p) => p.authenticationType)
        ];
        const getAuthProvider = (authType) => {
            switch (authType) {
                case "AMAZON_COGNITO_USER_POOLS":
                    return "userPools";
                case "API_KEY":
                    return "apiKey";
                case "AWS_IAM":
                    return "iam";
                case "OPENID_CONNECT":
                    return "oidc";
            }
        };
        return {
            default: getAuthProvider(this.config.authConfig.defaultAuthentication.authenticationType),
            onlyDefaultAuthProviderConfigured: this.config.authConfig.additionalAuthenticationProviders.length === 0,
            hasApiKey: providers.find((p) => p === 'API_KEY') ? true : false,
            hasUserPools: providers.find((p) => p === 'AMAZON_COGNITO_USER_POOLS') ? true : false,
            hasOIDC: providers.find((p) => p === 'OPENID_CONNECT') ? true : false,
            hasIAM: providers.find((p) => p === "AWS_IAM") ? true : false
        };
    }
    setAuthPolicyFlag(rules) {
        if (!rules || rules.length === 0 || this.generateIAMPolicyforAuthRole === true) {
            return;
        }
        for (const rule of rules) {
            if ((rule.allow === 'private' || rule.allow === 'public') && rule.provider === 'iam') {
                this.generateIAMPolicyforAuthRole = true;
                return;
            }
        }
    }
    setUnauthPolicyFlag(rules) {
        if (!rules || rules.length === 0 || this.generateIAMPolicyforUnauthRole === true) {
            return;
        }
        for (const rule of rules) {
            if (rule.allow === 'public' && rule.provider === 'iam') {
                this.generateIAMPolicyforUnauthRole = true;
                return;
            }
        }
    }
    getAuthRulesFromDirective(directive) {
        const get = (s) => (arg) => arg.name.value === s;
        const getArg = (arg, dflt) => {
            const argument = directive.arguments.find(get(arg));
            return argument ? graphql_1.valueFromASTUntyped(argument.value) : dflt;
        };
        // Get and validate the auth rules.
        return getArg('rules', []);
    }
    isTypeNeedsDefaultProviderAccess(def) {
        const authDirective = def.directives.find((dir) => dir.name.value === 'auth');
        if (!authDirective) {
            return true;
        }
        // Get and validate the auth rules.
        const rules = this.getAuthRulesFromDirective(authDirective);
        // Assign default providers to rules where no provider was explicitly defined
        this.ensureDefaultAuthProviderAssigned(rules);
        return Boolean(rules.find((r) => r.provider === this.configuredAuthProviders.default));
    }
    isTypeHasRulesForOperation(def, operation) {
        const authDirective = def.directives.find((dir) => dir.name.value === 'auth');
        if (!authDirective) {
            return false;
        }
        // Get and validate the auth rules.
        const rules = this.getAuthRulesFromDirective(authDirective);
        // Assign default providers to rules where no provider was explicitly defined
        this.ensureDefaultAuthProviderAssigned(rules);
        const { operationRules, queryRules } = this.splitRules(rules);
        const hasRulesForDefaultProvider = (operationRules) => {
            return Boolean(operationRules.find((r) => r.provider === this.configuredAuthProviders.default));
        };
        switch (operation) {
            case 'create':
                return hasRulesForDefaultProvider(operationRules.create);
            case 'update':
                return hasRulesForDefaultProvider(operationRules.update);
            case 'delete':
                return hasRulesForDefaultProvider(operationRules.delete);
            case 'get':
                return hasRulesForDefaultProvider(operationRules.read) ||
                    hasRulesForDefaultProvider(queryRules.get);
            case 'list':
                return hasRulesForDefaultProvider(operationRules.read) ||
                    hasRulesForDefaultProvider(queryRules.list);
        }
        return false;
    }
    addTypeToResourceReferences(typeName, rules) {
        const iamPublicRules = rules.filter(r => r.allow === 'public' && r.provider === 'iam');
        const iamPrivateRules = rules.filter(r => r.allow === 'private' && r.provider === 'iam');
        if (iamPublicRules.length > 0) {
            this.unauthPolicyResources.add(`${typeName}/null`);
            this.authPolicyResources.add(`${typeName}/null`);
        }
        if (iamPrivateRules.length > 0) {
            this.authPolicyResources.add(`${typeName}/null`);
        }
    }
    addFieldToResourceReferences(typeName, fieldName, rules) {
        const iamPublicRules = rules.filter(r => r.allow === 'public' && r.provider === 'iam');
        const iamPrivateRules = rules.filter(r => r.allow === 'private' && r.provider === 'iam');
        if (iamPublicRules.length > 0) {
            this.unauthPolicyResources.add(`${typeName}/${fieldName}`);
            this.authPolicyResources.add(`${typeName}/${fieldName}`);
        }
        if (iamPrivateRules.length > 0) {
            this.authPolicyResources.add(`${typeName}/${fieldName}`);
        }
    }
    isOperationExpressionSet(operationTypeName, template) {
        return template.includes(`$context.result.operation = "${operationTypeName}"`);
    }
}
exports.ModelAuthTransformer = ModelAuthTransformer;
function fieldHasDirective(field, directiveName) {
    return field.directives && field.directives.length && Boolean(field.directives.find((d) => d.name.value === directiveName));
}
function isTruthyOrNull(obj) {
    return obj || obj === null;
}
function isUndefined(obj) {
    return obj === undefined;
}
//# sourceMappingURL=ModelAuthTransformer.js.map