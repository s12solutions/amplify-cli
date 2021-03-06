"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const S3_FIELD_NAMES = ['bucket', 'key', 'region'];
function hasS3Fields(input) {
    if (graphql_1.isObjectType(input) || graphql_1.isInputObjectType(input)) {
        if (isS3Field(input)) {
            return true;
        }
        const fields = input.getFields();
        return Object.keys(fields).some(f => hasS3Fields(fields[f]));
    }
    return false;
}
exports.hasS3Fields = hasS3Fields;
function isS3Field(field) {
    if (graphql_1.isObjectType(field) || graphql_1.isInputObjectType(field)) {
        const fields = field.getFields();
        const stringFields = Object.keys(fields).filter(f => {
            const typeName = graphql_1.getNamedType(fields[f].type);
            return typeName.name === 'String';
        });
        const isS3FileField = S3_FIELD_NAMES.every(fieldName => stringFields.includes(fieldName));
        if (isS3FileField) {
            return true;
        }
    }
    return false;
}
exports.isS3Field = isS3Field;
//# sourceMappingURL=complextypes.js.map