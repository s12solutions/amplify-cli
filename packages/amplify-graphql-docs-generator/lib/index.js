"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const prettier = require("prettier");
const camelCase = require('camel-case');
const DEFAULT_MAX_DEPTH = 3;
const generator_1 = require("./generator");
const loading_1 = require("./generator/utils/loading");
const TEMPLATE_DIR = path.resolve(path.join(__dirname, '../templates'));
const FILE_EXTENSION_MAP = {
    javascript: 'js',
    graphql: 'graphql',
    flow: 'js',
    typescript: 'ts',
    angular: 'graphql',
};
function generate(schemaPath, outputPath, options) {
    const language = options.language || 'graphql';
    const schemaData = loading_1.loadSchema(schemaPath);
    if (!Object.keys(FILE_EXTENSION_MAP).includes(language)) {
        throw new Error(`Language ${language} not supported`);
    }
    const maxDepth = options.maxDepth || DEFAULT_MAX_DEPTH;
    const useExternalFragmentForS3Object = options.language === 'graphql';
    const gqlOperations = generator_1.default(schemaData, maxDepth, {
        useExternalFragmentForS3Object,
    });
    registerPartials();
    registerHelpers();
    const fileExtension = FILE_EXTENSION_MAP[language];
    if (options.separateFiles) {
        ['queries', 'mutations', 'subscriptions'].forEach(op => {
            const ops = gqlOperations[op];
            if (ops.length) {
                const gql = render({ operations: gqlOperations[op], fragments: [] }, language);
                fs.writeFileSync(path.resolve(path.join(outputPath, `${op}.${fileExtension}`)), gql);
            }
        });
        if (gqlOperations.fragments.length) {
            const gql = render({ operations: [], fragments: gqlOperations.fragments }, language);
            fs.writeFileSync(path.resolve(path.join(outputPath, `fragments.${fileExtension}`)), gql);
        }
    }
    else {
        const ops = [...gqlOperations.queries, ...gqlOperations.mutations, ...gqlOperations.subscriptions];
        if (ops.length) {
            const gql = render({ operations: ops, fragments: gqlOperations.fragments }, language);
            fs.writeFileSync(path.resolve(outputPath), gql);
        }
    }
}
exports.generate = generate;
function render(doc, language = 'graphql') {
    const templateFiles = {
        javascript: 'javascript.hbs',
        graphql: 'graphql.hbs',
        typescript: 'typescript.hbs',
        flow: 'flow.hbs',
        angular: 'graphql.hbs',
    };
    const templatePath = path.join(TEMPLATE_DIR, templateFiles[language]);
    const templateStr = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateStr, {
        noEscape: true,
        preventIndent: true,
    });
    const gql = template(doc);
    return format(gql, language);
}
function registerPartials() {
    const partials = fs.readdirSync(TEMPLATE_DIR);
    partials.forEach(partial => {
        if (!partial.startsWith('_') || !partial.endsWith('.hbs')) {
            return;
        }
        const partialPath = path.join(TEMPLATE_DIR, partial);
        const partialName = path.basename(partial).split('.')[0];
        const partialContent = fs.readFileSync(partialPath, 'utf8');
        handlebars.registerPartial(partialName.substring(1), partialContent);
    });
}
function registerHelpers() {
    handlebars.registerHelper('format', function (options) {
        const result = options.fn(this);
        return format(result);
    });
    handlebars.registerHelper('camelCase', camelCase);
}
function format(str, language = 'graphql') {
    const parserMap = {
        javascript: 'babel',
        graphql: 'graphql',
        typescript: 'typescript',
        flow: 'flow',
        angular: 'graphql',
    };
    return prettier.format(str, { parser: parserMap[language] });
}
//# sourceMappingURL=index.js.map