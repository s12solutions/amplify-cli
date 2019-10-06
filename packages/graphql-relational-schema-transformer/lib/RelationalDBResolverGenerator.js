"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudform_1 = require("cloudform");
const appSync_1 = require("cloudform-types/types/appSync");
const graphql_mapping_template_1 = require("graphql-mapping-template");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const ResourceConstants_1 = require("./ResourceConstants");
const RelationalDBMappingTemplate_1 = require("./RelationalDBMappingTemplate");
const fs = require("fs-extra");
const s3BaseUrl = 's3://${S3DeploymentBucket}/${S3DeploymentRootKey}/resolvers/${ResolverFileName}';
const resolverFileName = 'ResolverFileName';
/**
 * This Class is responsible for Generating the RDS Resolvers based on the
 * GraphQL Schema + Metadata of the RDS Cluster (i.e. Primary Keys for Tables).
 *
 * It will generate the CRUDL+Q (Create, Retrieve, Update, Delete, List + Queries) Resolvers as
 * Cloudform Resources so that they may be added on to the base template that the
 * RelationDBTemplateGenerator creates.
 */
class RelationalDBResolverGenerator {
    constructor(context) {
        this.document = context.schemaDoc;
        this.typePrimaryKeyMap = context.typePrimaryKeyMap;
        this.stringFieldMap = context.stringFieldMap;
        this.intFieldMap = context.intFieldMap;
        this.typePrimaryKeyTypeMap = context.typePrimaryKeyTypeMap;
    }
    /**
     * Creates the CRUDL+Q Resolvers as a Map of Cloudform Resources. The output can then be
     * merged with an existing Template's map of Resources.
     */
    createRelationalResolvers(resolverFilePath) {
        let resources = {};
        this.resolverFilePath = resolverFilePath;
        this.typePrimaryKeyMap.forEach((value, key) => {
            const resourceName = key.replace(/[^A-Za-z0-9]/g, '');
            resources = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, resources), { [resourceName + 'CreateResolver']: this.makeCreateRelationalResolver(key) }), { [resourceName + 'GetResolver']: this.makeGetRelationalResolver(key) }), { [resourceName + 'UpdateResolver']: this.makeUpdateRelationalResolver(key) }), { [resourceName + 'DeleteResolver']: this.makeDeleteRelationalResolver(key) }), { [resourceName + 'ListResolver']: this.makeListRelationalResolver(key) });
            // TODO: Add Guesstimate Query Resolvers
        });
        return resources;
    }
    /**
     * Private Helpers to Generate the CFN Spec for the Resolver Resources
     */
    /**
     * Creates and returns the CFN Spec for the 'Create' Resolver Resource provided
     * a GraphQL Type as the input
     *
     * @param type - the graphql type for which the create resolver will be created
     * @param mutationTypeName - will be 'Mutation'
     */
    makeCreateRelationalResolver(type, mutationTypeName = 'Mutation') {
        const fieldName = graphql_transformer_common_1.graphqlName('create' + graphql_transformer_common_1.toUpper(type));
        let createSql = `INSERT INTO ${type} $colStr VALUES $valStr`;
        let selectSql;
        if (this.typePrimaryKeyTypeMap.get(type).includes("String")) {
            selectSql = `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=\'$ctx.args.create${graphql_transformer_common_1.toUpper(type)}Input.${this.typePrimaryKeyMap.get(type)}\'`;
        }
        else {
            selectSql = `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=$ctx.args.create${graphql_transformer_common_1.toUpper(type)}Input.${this.typePrimaryKeyMap.get(type)}`;
        }
        const reqFileName = `${mutationTypeName}.${fieldName}.req.vtl`;
        const resFileName = `${mutationTypeName}.${fieldName}.res.vtl`;
        const reqTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('cols'), graphql_mapping_template_1.list([])),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('vals'), graphql_mapping_template_1.list([])),
            graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('entry'), graphql_mapping_template_1.ref(`ctx.args.create${graphql_transformer_common_1.toUpper(type)}Input.keySet()`), [
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('discard'), graphql_mapping_template_1.ref(`cols.add($entry)`)),
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('discard'), graphql_mapping_template_1.ref(`vals.add("'$ctx.args.create${graphql_transformer_common_1.toUpper(type)}Input[$entry]'")`))
            ]),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('valStr'), graphql_mapping_template_1.ref('vals.toString().replace("[","(").replace("]",")")')),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('colStr'), graphql_mapping_template_1.ref('cols.toString().replace("[","(").replace("]",")")')),
            RelationalDBMappingTemplate_1.default.rdsQuery({
                statements: graphql_mapping_template_1.list([graphql_mapping_template_1.str(createSql), graphql_mapping_template_1.str(selectSql)])
            })
        ]));
        const resTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.ref('utils.toJson($utils.parseJson($utils.rds.toJsonString($ctx.result))[1][0])'));
        fs.writeFileSync(`${this.resolverFilePath}/${reqFileName}`, reqTemplate, 'utf8');
        fs.writeFileSync(`${this.resolverFilePath}/${resFileName}`, resTemplate, 'utf8');
        let resolver = new appSync_1.default.Resolver({
            ApiId: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.AppSyncApiId),
            DataSourceName: cloudform_1.Fn.GetAtt(ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource, 'Name'),
            TypeName: mutationTypeName,
            FieldName: fieldName,
            RequestMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: reqFileName
            }),
            ResponseMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: resFileName
            })
        }).dependsOn([ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource]);
        return resolver;
    }
    /**
     * Creates and Returns the CFN Spec for the 'Get' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the get resolver will be created
     * @param queryTypeName  - will be 'Query'
     */
    makeGetRelationalResolver(type, queryTypeName = 'Query') {
        const fieldName = graphql_transformer_common_1.graphqlName('get' + graphql_transformer_common_1.toUpper(type));
        let sql;
        if (this.typePrimaryKeyTypeMap.get(type).includes("String")) {
            sql = `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=\'$ctx.args.${this.typePrimaryKeyMap.get(type)}\'`;
        }
        else {
            sql = `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=$ctx.args.${this.typePrimaryKeyMap.get(type)}`;
        }
        const reqFileName = `${queryTypeName}.${fieldName}.req.vtl`;
        const resFileName = `${queryTypeName}.${fieldName}.res.vtl`;
        const reqTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
            RelationalDBMappingTemplate_1.default.rdsQuery({
                statements: graphql_mapping_template_1.list([graphql_mapping_template_1.str(sql)])
            })
        ]));
        const resTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.ref('utils.toJson($utils.rds.toJsonObject($ctx.result)[0][0])'));
        fs.writeFileSync(`${this.resolverFilePath}/${reqFileName}`, reqTemplate, 'utf8');
        fs.writeFileSync(`${this.resolverFilePath}/${resFileName}`, resTemplate, 'utf8');
        let resolver = new appSync_1.default.Resolver({
            ApiId: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.AppSyncApiId),
            DataSourceName: cloudform_1.Fn.GetAtt(ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource, 'Name'),
            FieldName: fieldName,
            TypeName: queryTypeName,
            RequestMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: reqFileName
            }),
            ResponseMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: resFileName
            })
        }).dependsOn([ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource]);
        return resolver;
    }
    /**
     * Creates and Returns the CFN Spec for the 'Update' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the update resolver will be created
     * @param mutationTypeName - will be 'Mutation'
     */
    makeUpdateRelationalResolver(type, mutationTypeName = 'Mutation') {
        const fieldName = graphql_transformer_common_1.graphqlName('update' + graphql_transformer_common_1.toUpper(type));
        const updateSql = `UPDATE ${type} SET $update WHERE ${this.typePrimaryKeyMap.get(type)}=$ctx.args.update${graphql_transformer_common_1.toUpper(type)}Input.${this.typePrimaryKeyMap.get(type)}`;
        let selectSql;
        if (this.typePrimaryKeyTypeMap.get(type).includes("String")) {
            selectSql =
                `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=\'$ctx.args.update${graphql_transformer_common_1.toUpper(type)}Input.${this.typePrimaryKeyMap.get(type)}\'`;
        }
        else {
            selectSql = `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=$ctx.args.update${graphql_transformer_common_1.toUpper(type)}Input.${this.typePrimaryKeyMap.get(type)}`;
        }
        const reqFileName = `${mutationTypeName}.${fieldName}.req.vtl`;
        const resFileName = `${mutationTypeName}.${fieldName}.res.vtl`;
        const reqTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('updateList'), graphql_mapping_template_1.obj({})),
            graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('entry'), graphql_mapping_template_1.ref(`ctx.args.update${graphql_transformer_common_1.toUpper(type)}Input.keySet()`), [
                graphql_mapping_template_1.set(graphql_mapping_template_1.ref('discard'), graphql_mapping_template_1.ref(`updateList.put($entry, "'$ctx.args.update${graphql_transformer_common_1.toUpper(type)}Input[$entry]'")`))
            ]),
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('update'), graphql_mapping_template_1.ref(`updateList.toString().replace("{","").replace("}","")`)),
            RelationalDBMappingTemplate_1.default.rdsQuery({
                statements: graphql_mapping_template_1.list([graphql_mapping_template_1.str(updateSql), graphql_mapping_template_1.str(selectSql)])
            })
        ]));
        const resTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.ref('utils.toJson($utils.parseJson($utils.rds.toJsonString($ctx.result))[1][0])'));
        fs.writeFileSync(`${this.resolverFilePath}/${reqFileName}`, reqTemplate, 'utf8');
        fs.writeFileSync(`${this.resolverFilePath}/${resFileName}`, resTemplate, 'utf8');
        let resolver = new appSync_1.default.Resolver({
            ApiId: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.AppSyncApiId),
            DataSourceName: cloudform_1.Fn.GetAtt(ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource, 'Name'),
            TypeName: mutationTypeName,
            FieldName: fieldName,
            RequestMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: reqFileName
            }),
            ResponseMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: resFileName
            })
        }).dependsOn([ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource]);
        return resolver;
    }
    /**
     * Creates and Returns the CFN Spec for the 'Delete' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the delete resolver will be created
     * @param mutationTypeName - will be 'Mutation'
     */
    makeDeleteRelationalResolver(type, mutationTypeName = 'Mutation') {
        const fieldName = graphql_transformer_common_1.graphqlName('delete' + graphql_transformer_common_1.toUpper(type));
        let selectSql;
        if (this.typePrimaryKeyTypeMap.get(type).includes("String")) {
            selectSql = `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=\'$ctx.args.${this.typePrimaryKeyMap.get(type)}\'`;
        }
        else {
            selectSql = `SELECT * FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=$ctx.args.${this.typePrimaryKeyMap.get(type)}`;
        }
        const deleteSql = `DELETE FROM ${type} WHERE ${this.typePrimaryKeyMap.get(type)}=$ctx.args.${this.typePrimaryKeyMap.get(type)}`;
        const reqFileName = `${mutationTypeName}.${fieldName}.req.vtl`;
        const resFileName = `${mutationTypeName}.${fieldName}.res.vtl`;
        const reqTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.compoundExpression([
            RelationalDBMappingTemplate_1.default.rdsQuery({
                statements: graphql_mapping_template_1.list([graphql_mapping_template_1.str(selectSql), graphql_mapping_template_1.str(deleteSql)])
            })
        ]));
        const resTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.ref('utils.toJson($utils.rds.toJsonObject($ctx.result)[0][0])'));
        fs.writeFileSync(`${this.resolverFilePath}/${reqFileName}`, reqTemplate, 'utf8');
        fs.writeFileSync(`${this.resolverFilePath}/${resFileName}`, resTemplate, 'utf8');
        let resolver = new appSync_1.default.Resolver({
            ApiId: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.AppSyncApiId),
            DataSourceName: cloudform_1.Fn.GetAtt(ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource, 'Name'),
            TypeName: mutationTypeName,
            FieldName: fieldName,
            RequestMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: reqFileName
            }),
            ResponseMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: resFileName
            })
        }).dependsOn([ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource]);
        return resolver;
    }
    /**
     * Creates and Returns the CFN Spec for the 'List' Resolver Resource provided
     * a GraphQL type
     *
     * @param type - the graphql type for which the list resolver will be created
     * @param queryTypeName - will be 'Query'
     */
    makeListRelationalResolver(type, queryTypeName = 'Query') {
        const fieldName = graphql_transformer_common_1.graphqlName('list' + graphql_transformer_common_1.plurality(graphql_transformer_common_1.toUpper(type)));
        const sql = `SELECT * FROM ${type}`;
        const reqFileName = `${queryTypeName}.${fieldName}.req.vtl`;
        const resFileName = `${queryTypeName}.${fieldName}.res.vtl`;
        const reqTemplate = graphql_mapping_template_1.print(RelationalDBMappingTemplate_1.default.rdsQuery({
            statements: graphql_mapping_template_1.list([graphql_mapping_template_1.str(sql)])
        }));
        const resTemplate = graphql_mapping_template_1.print(graphql_mapping_template_1.ref('utils.toJson($utils.rds.toJsonObject($ctx.result)[0])'));
        fs.writeFileSync(`${this.resolverFilePath}/${reqFileName}`, reqTemplate, 'utf8');
        fs.writeFileSync(`${this.resolverFilePath}/${resFileName}`, resTemplate, 'utf8');
        let resolver = new appSync_1.default.Resolver({
            ApiId: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.AppSyncApiId),
            DataSourceName: cloudform_1.Fn.GetAtt(ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource, 'Name'),
            TypeName: queryTypeName,
            FieldName: fieldName,
            RequestMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: reqFileName
            }),
            ResponseMappingTemplateS3Location: cloudform_1.Fn.Sub(s3BaseUrl, {
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                [ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey]: cloudform_1.Fn.Ref(ResourceConstants_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                [resolverFileName]: resFileName
            })
        }).dependsOn([ResourceConstants_1.ResourceConstants.RESOURCES.RelationalDatabaseDataSource]);
        return resolver;
    }
}
exports.default = RelationalDBResolverGenerator;
//# sourceMappingURL=RelationalDBResolverGenerator.js.map