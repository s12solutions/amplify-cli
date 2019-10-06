"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ast_1 = require("./ast");
var DynamoDBMappingTemplate = /** @class */ (function () {
    function DynamoDBMappingTemplate() {
    }
    /**
     * Create a put item resolver template.
     * @param keys A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.putItem = function (_a) {
        var key = _a.key, attributeValues = _a.attributeValues, condition = _a.condition;
        return ast_1.obj({
            version: ast_1.str('2017-02-28'),
            operation: ast_1.str('PutItem'),
            key: key,
            attributeValues: attributeValues,
            condition: condition
        });
    };
    /**
     * Create a get item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.getItem = function (_a) {
        var key = _a.key;
        return ast_1.obj({
            version: ast_1.str('2017-02-28'),
            operation: ast_1.str('GetItem'),
            key: key
        });
    };
    /**
     * Create a query resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.query = function (args) {
        return ast_1.obj(__assign({ version: ast_1.str('2017-02-28'), operation: ast_1.str('Query') }, args));
    };
    /**
     * Create a list item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.listItem = function (_a) {
        var filter = _a.filter, limit = _a.limit, nextToken = _a.nextToken, scanIndexForward = _a.scanIndexForward, query = _a.query, index = _a.index;
        return ast_1.obj({
            version: ast_1.str('2017-02-28'),
            operation: ast_1.str('Scan'),
            filter: filter,
            limit: limit,
            nextToken: nextToken,
            query: query,
            index: index,
            scanIndexForward: scanIndexForward,
        });
    };
    /**
     * Create a delete item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.deleteItem = function (_a) {
        var key = _a.key, condition = _a.condition;
        return ast_1.obj({
            version: ast_1.str('2017-02-28'),
            operation: ast_1.str('DeleteItem'),
            key: key,
            condition: condition,
        });
    };
    /**
     * Create an update item resolver template.
     * @param key
     */
    DynamoDBMappingTemplate.updateItem = function (_a) {
        var key = _a.key, condition = _a.condition, objectKeyVariable = _a.objectKeyVariable, nameOverrideMap = _a.nameOverrideMap;
        // const keyFields = key.attributes.map((attr: [string, Expression]) => attr[0])
        // Auto timestamp
        // qref('$input.put("updatedAt", "$util.time.nowISO8601()")'),
        var entryKeyAttributeNameVar = 'entryKeyAttributeName';
        var handleRename = function (keyVar) { return ast_1.ifElse(ast_1.raw("!$util.isNull($" + nameOverrideMap + ") && $" + nameOverrideMap + ".containsKey(\"" + keyVar + "\")"), ast_1.set(ast_1.ref(entryKeyAttributeNameVar), ast_1.raw("$" + nameOverrideMap + ".get(\"" + keyVar + "\")")), ast_1.set(ast_1.ref(entryKeyAttributeNameVar), ast_1.raw(keyVar))); };
        return ast_1.compoundExpression([
            ast_1.set(ast_1.ref('expNames'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expValues'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expSet'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expAdd'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expRemove'), ast_1.list([])),
            ast_1.ifElse(ast_1.ref(objectKeyVariable), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('keyFields'), ast_1.list([])),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref(objectKeyVariable + ".entrySet()"), [
                    ast_1.qref('$keyFields.add("$entry.key")')
                ]),
            ]), ast_1.set(ast_1.ref('keyFields'), ast_1.list([ast_1.str('id')]))),
            ast_1.forEach(ast_1.ref('entry'), ast_1.ref("util.map.copyAndRemoveAllKeys($context.args.input, $keyFields).entrySet()"), [
                handleRename('$entry.key'),
                ast_1.ifElse(ast_1.ref('util.isNull($entry.value)'), ast_1.compoundExpression([
                    ast_1.set(ast_1.ref('discard'), ast_1.ref("expRemove.add(\"#$" + entryKeyAttributeNameVar + "\")")),
                    ast_1.qref("$expNames.put(\"#$" + entryKeyAttributeNameVar + "\", \"$entry.key\")")
                ]), ast_1.compoundExpression([
                    ast_1.qref("$expSet.put(\"#$" + entryKeyAttributeNameVar + "\", \":$" + entryKeyAttributeNameVar + "\")"),
                    ast_1.qref("$expNames.put(\"#$" + entryKeyAttributeNameVar + "\", \"$entry.key\")"),
                    ast_1.qref("$expValues.put(\":$" + entryKeyAttributeNameVar + "\", $util.dynamodb.toDynamoDB($entry.value))")
                ]))
            ]),
            ast_1.set(ast_1.ref('expression'), ast_1.str('')),
            ast_1.iff(ast_1.raw('!$expSet.isEmpty()'), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('expression'), ast_1.str('SET')),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref('expSet.entrySet()'), [
                    ast_1.set(ast_1.ref('expression'), ast_1.str('$expression $entry.key = $entry.value')),
                    ast_1.iff(ast_1.ref('foreach.hasNext()'), ast_1.set(ast_1.ref('expression'), ast_1.str('$expression,')))
                ])
            ])),
            ast_1.iff(ast_1.raw('!$expAdd.isEmpty()'), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('expression'), ast_1.str('$expression ADD')),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref('expAdd.entrySet()'), [
                    ast_1.set(ast_1.ref('expression'), ast_1.str('$expression $entry.key $entry.value')),
                    ast_1.iff(ast_1.ref('foreach.hasNext()'), ast_1.set(ast_1.ref('expression'), ast_1.str('$expression,')))
                ])
            ])),
            ast_1.iff(ast_1.raw('!$expRemove.isEmpty()'), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('expression'), ast_1.str('$expression REMOVE')),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref('expRemove'), [
                    ast_1.set(ast_1.ref('expression'), ast_1.str('$expression $entry')),
                    ast_1.iff(ast_1.ref('foreach.hasNext()'), ast_1.set(ast_1.ref('expression'), ast_1.str('$expression,')))
                ])
            ])),
            ast_1.set(ast_1.ref('update'), ast_1.obj({})),
            ast_1.qref('$update.put("expression", "$expression")'),
            ast_1.iff(ast_1.raw('!$expNames.isEmpty()'), ast_1.qref('$update.put("expressionNames", $expNames)')),
            ast_1.iff(ast_1.raw('!$expValues.isEmpty()'), ast_1.qref('$update.put("expressionValues", $expValues)')),
            ast_1.obj({
                version: ast_1.str('2017-02-28'),
                operation: ast_1.str('UpdateItem'),
                key: key,
                update: ast_1.ref('util.toJson($update)'),
                condition: condition
            })
        ]);
    };
    DynamoDBMappingTemplate.stringAttributeValue = function (value) {
        return {
            kind: 'Object', attributes: [
                ['S', { kind: 'Quotes', expr: value }]
            ]
        };
    };
    DynamoDBMappingTemplate.numericAttributeValue = function (value) {
        return {
            kind: 'Object', attributes: [
                ['N', { kind: 'Quotes', expr: value }]
            ]
        };
    };
    DynamoDBMappingTemplate.binaryAttributeValue = function (value) {
        return {
            kind: 'Object', attributes: [
                ['B', { kind: 'Quotes', expr: value }]
            ]
        };
    };
    DynamoDBMappingTemplate.paginatedResponse = function () {
        return ast_1.obj({
            items: ast_1.ref('util.toJson($ctx.result.items)'),
            nextToken: ast_1.ref('util.toJson($util.defaultIfNullOrBlank($context.result.nextToken, null))')
        });
    };
    return DynamoDBMappingTemplate;
}());
exports.DynamoDBMappingTemplate = DynamoDBMappingTemplate;
//# sourceMappingURL=dynamodb.js.map