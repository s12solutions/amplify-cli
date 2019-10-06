import { Expression, ReferenceNode, StringNode, ObjectNode, CompoundExpressionNode } from './ast';
export declare class DynamoDBMappingTemplate {
    /**
     * Create a put item resolver template.
     * @param keys A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static putItem({ key, attributeValues, condition }: {
        key: ObjectNode | Expression;
        attributeValues: Expression;
        condition?: ObjectNode;
    }): ObjectNode;
    /**
     * Create a get item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static getItem({ key }: {
        key: ObjectNode | Expression;
    }): ObjectNode;
    /**
     * Create a query resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static query(args: {
        query: ObjectNode | Expression;
        scanIndexForward: Expression;
        filter: ObjectNode | Expression;
        limit: Expression;
        nextToken?: Expression;
        index?: StringNode;
    }): ObjectNode;
    /**
     * Create a list item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static listItem({ filter, limit, nextToken, scanIndexForward, query, index }: {
        filter: ObjectNode | Expression;
        limit: Expression;
        nextToken?: Expression;
        scanIndexForward?: Expression;
        query?: ObjectNode | Expression;
        index?: StringNode;
    }): ObjectNode;
    /**
     * Create a delete item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    static deleteItem({ key, condition }: {
        key: ObjectNode | Expression;
        condition: ObjectNode | ReferenceNode;
    }): ObjectNode;
    /**
     * Create an update item resolver template.
     * @param key
     */
    static updateItem({ key, condition, objectKeyVariable, nameOverrideMap }: {
        key: ObjectNode | Expression;
        condition: ObjectNode | ReferenceNode;
        objectKeyVariable: string;
        nameOverrideMap?: string;
    }): CompoundExpressionNode;
    static stringAttributeValue(value: Expression): ObjectNode;
    static numericAttributeValue(value: Expression): ObjectNode;
    static binaryAttributeValue(value: Expression): ObjectNode;
    static paginatedResponse(): ObjectNode;
}
