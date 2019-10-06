"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var HttpTransformer_1 = require("../HttpTransformer");
test('Test HttpTransformer with four basic requests', function () {
    var validSchema = "\n    type Comment {\n        id: ID!\n        content: String @http(method: POST, url: \"http://www.api.com/ping\")\n        content2: String @http(method: PUT, url: \"http://www.api.com/ping\")\n        more: String @http(url: \"http://api.com/ping/me/2\")\n        evenMore: String @http(method: DELETE, url: \"http://www.google.com/query/id\")\n        stillMore: String @http(method: PATCH, url: \"https://www.api.com/ping/id\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new HttpTransformer_1.HttpTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    // expect(out.Resources[ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy()
    var schemaDoc = graphql_1.parse(out.schema);
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'content')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'content2')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'more')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'evenMore')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'stillMore')]).toBeTruthy();
});
test('Test HttpTransformer with URL params happy case', function () {
    var validSchema = "\n    type Comment {\n        id: ID!\n        title: String\n        complex: CompObj @http(method: GET, url: \"https://jsonplaceholder.typicode.com/posts/1\")\n        complexAgain: CompObj @http(url: \"https://jsonplaceholder.typicode.com/posts/2\")\n        complexPost(\n            id: Int,\n            title: String,\n            body: String,\n            userId: Int\n        ): CompObj @http(method: POST, url: \"https://jsonplaceholder.typicode.com/posts\")\n        complexPut(\n            id: Int!,\n            title: String!,\n            body: String,\n            userId: Int!\n        ): CompObj @http(method: PUT, url: \"https://jsonplaceholder.typicode.com/posts/:title/:id\")\n        deleter: String @http(method: DELETE, url: \"https://jsonplaceholder.typicode.com/posts/3\")\n        complexGet(\n            id: Int!\n        ): CompObj @http(url: \"https://jsonplaceholder.typicode.com/posts/:id\")\n        complexGet2 (\n            id: Int!,\n            title: String!,\n            userId: Int!\n        ): CompObj @http(url: \"https://jsonplaceholder.typicode.com/posts/:title/:id\")\n    }\n    type CompObj {\n        userId: Int\n        id: Int\n        title: String\n        body: String\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new HttpTransformer_1.HttpTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    // expect(out.Resources[ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy()
    var schemaDoc = graphql_1.parse(out.schema);
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'complex')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'complexAgain')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'complexPost')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'complexPut')]).toBeTruthy();
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'deleter')]).toBeTruthy();
});
test('Test that HttpTransformer throws an error when missing protocol in URL argument', function () {
    var validSchema = "\n    type Comment {\n        id: ID!\n        content: String @http(method: POST, url: \"www.api.com/ping\")\n    }\n    ";
    try {
        var transformer = new graphql_transformer_core_1.default({
            transformers: [
                new HttpTransformer_1.HttpTransformer()
            ]
        });
        var out = transformer.transform(validSchema);
    }
    catch (e) {
        expect(e.name).toEqual('TransformerContractError');
    }
});
test('Test HttpTransformer with URL and headers params happy case', function () {
    var validSchema = "\n    type Comment {\n        id: ID!\n        content: String @http(url: \"https://www.api.com/ping\", headers: [{key: \"X-Header\", value: \"X-Header-Value\"}])\n        contentDelete: String @http(method: DELETE, url: \"https://www.api.com/ping\", headers: [{key: \"X-Header\", value: \"X-Header-ValueDelete\"}])\n        contentPatch: String @http(method: PATCH, url: \"https://www.api.com/ping\", headers: [{key: \"X-Header\", value: \"X-Header-ValuePatch\"}])\n        contentPost: String @http(method: POST, url: \"https://www.api.com/ping\", headers: [{key: \"X-Header\", value: \"X-Header-ValuePost\"}])\n        complexPut(\n            id: Int!,\n            title: String!,\n            body: String,\n            userId: Int!\n        ): String @http(method: PUT, url: \"https://jsonplaceholder.typicode.com/posts/:title/:id\", headers: [{key: \"X-Header\", value: \"X-Header-ValuePut\"}])\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new HttpTransformer_1.HttpTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    // expect(out.Resources[ResolverResourceIDs.ResolverResourceID('Post', 'comments')]).toBeTruthy()
    var schemaDoc = graphql_1.parse(out.schema);
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'content')]).toBeTruthy();
    expect(out.resolvers['Comment.content.req.vtl']).toContain('$util.qr($headers.put("X-Header", "X-Header-Value"))');
    expect(out.resolvers['Comment.contentDelete.req.vtl']).toContain('$util.qr($headers.put("X-Header", "X-Header-ValueDelete"))');
    expect(out.resolvers['Comment.contentPatch.req.vtl']).toContain('$util.qr($headers.put("X-Header", "X-Header-ValuePatch"))');
    expect(out.resolvers['Comment.contentPost.req.vtl']).toContain('$util.qr($headers.put("X-Header", "X-Header-ValuePost"))');
    expect(out.resolvers['Comment.complexPut.req.vtl']).toContain('$util.qr($headers.put("X-Header", "X-Header-ValuePut"))');
});
test('Test HttpTransformer with four basic requests with env on the URI', function () {
    var validSchema = "\n    type Comment {\n        id: ID!\n        content: String @http(method: POST, url: \"http://www.api.com/ping${env}\")\n        content2: String @http(method: PUT, url: \"http://www.api.com/ping${env}\")\n        more: String @http(url: \"http://api.com/ping/me/2${env}\")\n        evenMore: String @http(method: DELETE, url: \"http://www.google.com/query/id${env}\")\n        stillMore: String @http(method: PATCH, url: \"https://www.api.com/ping/id${env}\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new HttpTransformer_1.HttpTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var schemaDoc = graphql_1.parse(out.schema);
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "content")].Properties.RequestMappingTemplate['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "content")].Properties.RequestMappingTemplate['Fn::Sub'][1].env.Ref).toBe('env');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "content2")].Properties.RequestMappingTemplate['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "content2")].Properties.RequestMappingTemplate['Fn::Sub'][1].env.Ref).toBe('env');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "more")].Properties.RequestMappingTemplate['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "more")].Properties.RequestMappingTemplate['Fn::Sub'][1].env.Ref).toBe('env');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "evenMore")].Properties.RequestMappingTemplate['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "evenMore")].Properties.RequestMappingTemplate['Fn::Sub'][1].env.Ref).toBe('env');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "stillMore")].Properties.RequestMappingTemplate['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID("Comment", "stillMore")].Properties.RequestMappingTemplate['Fn::Sub'][1].env.Ref).toBe('env');
});
test('Test HttpTransformer with four basic requests with env on the hostname', function () {
    var validSchema = "\n    type Comment {\n        id: ID!\n        content: String @http(method: POST, url: \"http://${env}www.api.com/ping\")\n        content2: String @http(method: PUT, url: \"http://${env}www.api.com/ping\")\n        more: String @http(url: \"http://${env}api.com/ping/me/2\")\n        evenMore: String @http(method: DELETE, url: \"http://${env}www.google.com/query/id\")\n        stillMore: String @http(method: PATCH, url: \"https://${env}www.api.com/ping/id\")\n    }\n    ";
    var transformer = new graphql_transformer_core_1.default({
        transformers: [
            new HttpTransformer_1.HttpTransformer()
        ]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    var schemaDoc = graphql_1.parse(out.schema);
    var contentDatasource = out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'content')].Properties.DataSourceName['Fn::GetAtt'][0];
    expect(out.stacks.HttpStack.Resources[contentDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[contentDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][1].env.Ref).toBe('env');
    var content2Datasource = out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'content2')].Properties.DataSourceName['Fn::GetAtt'][0];
    expect(out.stacks.HttpStack.Resources[content2Datasource].Properties.HttpConfig.Endpoint['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[content2Datasource].Properties.HttpConfig.Endpoint['Fn::Sub'][1].env.Ref).toBe('env');
    var moreDatasource = out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'more')].Properties.DataSourceName['Fn::GetAtt'][0];
    expect(out.stacks.HttpStack.Resources[moreDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[moreDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][1].env.Ref).toBe('env');
    var evenMoreDatasource = out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'evenMore')].Properties.DataSourceName['Fn::GetAtt'][0];
    expect(out.stacks.HttpStack.Resources[evenMoreDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[evenMoreDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][1].env.Ref).toBe('env');
    var stillMoreDatasource = out.stacks.HttpStack.Resources[graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID('Comment', 'stillMore')].Properties.DataSourceName['Fn::GetAtt'][0];
    expect(out.stacks.HttpStack.Resources[stillMoreDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][0]).toContain('${env}');
    expect(out.stacks.HttpStack.Resources[stillMoreDatasource].Properties.HttpConfig.Endpoint['Fn::Sub'][1].env.Ref).toBe('env');
});
//# sourceMappingURL=HttpTransformer.test.js.map