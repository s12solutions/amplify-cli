"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const t = require("babel-types");
const helpers_1 = require("../helpers");
const typeAnnotationFromGraphQLType = helpers_1.createTypeAnnotationFromGraphQLTypeFunction({
    passthroughCustomScalars: false
});
describe('Flow typeAnnotationFromGraphQLType', () => {
    test('String', () => {
        expect(typeAnnotationFromGraphQLType(graphql_1.GraphQLString))
            .toMatchObject(t.nullableTypeAnnotation(t.stringTypeAnnotation()));
    });
    test('Int', () => {
        expect(typeAnnotationFromGraphQLType(graphql_1.GraphQLInt))
            .toMatchObject(t.nullableTypeAnnotation(t.numberTypeAnnotation()));
    });
    test('Float', () => {
        expect(typeAnnotationFromGraphQLType(graphql_1.GraphQLFloat))
            .toMatchObject(t.nullableTypeAnnotation(t.numberTypeAnnotation()));
    });
    test('Boolean', () => {
        expect(typeAnnotationFromGraphQLType(graphql_1.GraphQLBoolean))
            .toMatchObject(t.nullableTypeAnnotation(t.booleanTypeAnnotation()));
    });
    test('ID', () => {
        expect(typeAnnotationFromGraphQLType(graphql_1.GraphQLID))
            .toMatchObject(t.nullableTypeAnnotation(t.stringTypeAnnotation()));
    });
    test('String!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(graphql_1.GraphQLString))).toMatchObject(t.stringTypeAnnotation());
    });
    test('Int!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt))).toMatchObject(t.numberTypeAnnotation());
    });
    test('Float!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(graphql_1.GraphQLFloat))).toMatchObject(t.numberTypeAnnotation());
    });
    test('Boolean!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean))).toMatchObject(t.booleanTypeAnnotation());
    });
    test('ID!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(graphql_1.GraphQLID))).toMatchObject(t.stringTypeAnnotation());
    });
    test('[String]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(graphql_1.GraphQLString))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.stringTypeAnnotation()))));
    });
    test('[Int]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(graphql_1.GraphQLInt))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.numberTypeAnnotation()))));
    });
    test('[Float]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(graphql_1.GraphQLFloat))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.numberTypeAnnotation()))));
    });
    test('[Boolean]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(graphql_1.GraphQLBoolean))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.booleanTypeAnnotation()))));
    });
    test('[ID]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(graphql_1.GraphQLID))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.stringTypeAnnotation()))));
    });
    test('[String]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLString)))).toMatchObject(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.stringTypeAnnotation())));
    });
    test('[Int]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLInt)))).toMatchObject(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.numberTypeAnnotation())));
    });
    test('[Float]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLFloat)))).toMatchObject(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.numberTypeAnnotation())));
    });
    test('[Boolean]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLBoolean)))).toMatchObject(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.booleanTypeAnnotation())));
    });
    test('[ID]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(graphql_1.GraphQLID)))).toMatchObject(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.stringTypeAnnotation())));
    });
    test('[String!]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLString)))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.stringTypeAnnotation())));
    });
    test('[Int!]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull((graphql_1.GraphQLInt))))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.numberTypeAnnotation())));
    });
    test('[Float!]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLFloat)))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.numberTypeAnnotation())));
    });
    test('[Boolean!]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean)))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.booleanTypeAnnotation())));
    });
    test('[ID!]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLID)))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.stringTypeAnnotation())));
    });
    test('[String!]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLString))))).toMatchObject(t.arrayTypeAnnotation(t.stringTypeAnnotation()));
    });
    test('[Int!]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt))))).toMatchObject(t.arrayTypeAnnotation(t.numberTypeAnnotation()));
    });
    test('[Float!]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLFloat))))).toMatchObject(t.arrayTypeAnnotation(t.numberTypeAnnotation()));
    });
    test('[Boolean!]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean))))).toMatchObject(t.arrayTypeAnnotation(t.booleanTypeAnnotation()));
    });
    test('[ID!]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(graphql_1.GraphQLID))))).toMatchObject(t.arrayTypeAnnotation(t.stringTypeAnnotation()));
    });
    test('[[String]]', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLList(new graphql_1.GraphQLList(graphql_1.GraphQLString)))).toMatchObject(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.stringTypeAnnotation()))))));
    });
    test('[[String]]!', () => {
        expect(typeAnnotationFromGraphQLType(new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLList(graphql_1.GraphQLString))))).toMatchObject(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.arrayTypeAnnotation(t.nullableTypeAnnotation(t.stringTypeAnnotation())))));
    });
    test('Custom Scalar', () => {
        const OddType = new graphql_1.GraphQLScalarType({
            name: 'Odd',
            serialize(value) {
                return value % 2 === 1 ? value : null;
            }
        });
        expect(typeAnnotationFromGraphQLType(OddType)).toMatchObject(t.nullableTypeAnnotation(t.genericTypeAnnotation(t.identifier('Odd'))));
    });
});
describe('passthrough custom scalars', () => {
    let getTypeAnnotation;
    beforeAll(() => {
        getTypeAnnotation = helpers_1.createTypeAnnotationFromGraphQLTypeFunction({
            passthroughCustomScalars: true
        });
    });
    test('Custom Scalar', () => {
        const OddType = new graphql_1.GraphQLScalarType({
            name: 'Odd',
            serialize(value) {
                return value % 2 === 1 ? value : null;
            }
        });
        expect(getTypeAnnotation(OddType)).toMatchObject(t.nullableTypeAnnotation(t.anyTypeAnnotation()));
    });
});
//# sourceMappingURL=helpers.js.map