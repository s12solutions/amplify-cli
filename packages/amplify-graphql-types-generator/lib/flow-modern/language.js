"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const t = require("@babel/types");
class FlowGenerator {
    constructor(compilerOptions) {
        this.options = compilerOptions;
        this.typeAnnotationFromGraphQLType = helpers_1.createTypeAnnotationFromGraphQLTypeFunction(compilerOptions);
    }
    enumerationDeclaration(type) {
        const { name, description } = type;
        const unionValues = type.getValues().map(({ value }) => {
            const type = t.stringLiteralTypeAnnotation();
            type.value = value;
            return type;
        });
        const typeAlias = t.exportNamedDeclaration(t.typeAlias(t.identifier(name), undefined, t.unionTypeAnnotation(unionValues)), []);
        typeAlias.leadingComments = [
            {
                type: 'CommentLine',
                value: ` ${description}`,
            },
        ];
        return typeAlias;
    }
    inputObjectDeclaration(inputObjectType) {
        const { name, description } = inputObjectType;
        const fieldMap = inputObjectType.getFields();
        const fields = Object.keys(inputObjectType.getFields()).map((fieldName) => {
            const field = fieldMap[fieldName];
            return {
                name: fieldName,
                annotation: this.typeAnnotationFromGraphQLType(field.type),
            };
        });
        const typeAlias = this.typeAliasObject(name, fields);
        typeAlias.leadingComments = [
            {
                type: 'CommentLine',
                value: ` ${description}`,
            },
        ];
        return typeAlias;
    }
    objectTypeAnnotation(fields, isInputObject = false) {
        const objectTypeAnnotation = t.objectTypeAnnotation(fields.map(({ name, description, annotation }) => {
            if (annotation.type === 'NullableTypeAnnotation') {
                t.identifier(name + '?');
            }
            const objectTypeProperty = t.objectTypeProperty(t.identifier(isInputObject && annotation.type === 'NullableTypeAnnotation' ? name + '?' : name), annotation);
            if (description) {
                objectTypeProperty.trailingComments = [
                    {
                        type: 'CommentLine',
                        value: ` ${description}`,
                    },
                ];
            }
            return objectTypeProperty;
        }));
        if (this.options.useFlowExactObjects) {
            objectTypeAnnotation.exact = true;
        }
        return objectTypeAnnotation;
    }
    typeAliasObject(name, fields) {
        return t.typeAlias(t.identifier(name), undefined, this.objectTypeAnnotation(fields));
    }
    typeAliasObjectUnion(name, members) {
        return t.typeAlias(t.identifier(name), undefined, t.unionTypeAnnotation(members.map(member => {
            return this.objectTypeAnnotation(member);
        })));
    }
    typeAliasGenericUnion(name, members) {
        return t.typeAlias(t.identifier(name), undefined, t.unionTypeAnnotation(members));
    }
    exportDeclaration(declaration) {
        return t.exportNamedDeclaration(declaration, []);
    }
    annotationFromScopeStack(scope) {
        return t.genericTypeAnnotation(t.identifier(scope.join('_')));
    }
}
exports.FlowGenerator = FlowGenerator;
//# sourceMappingURL=language.js.map