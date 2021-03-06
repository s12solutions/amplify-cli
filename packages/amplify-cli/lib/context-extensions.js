"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const safe_1 = __importDefault(require("colors/safe"));
const cli_table3_1 = __importDefault(require("cli-table3"));
safe_1.default.setTheme({
    highlight: 'cyan',
    info: 'reset',
    warning: 'yellow',
    success: 'green',
    error: 'red',
    line: 'grey',
    muted: 'grey',
    green: 'green',
    yellow: 'yellow',
    red: 'red',
    blue: 'blue',
});
const colors = safe_1.default;
function attachExtentions(context) {
    attachFilesystem(context);
    attachPrint(context);
    attachParameters(context);
    attachPatching(context);
    attachRuntime(context);
    attachPrompt(context);
    attachTemplate(context);
}
exports.attachExtentions = attachExtentions;
function attachPrompt(context) {
    const inquirer = require('inquirer');
    context.prompt = {
        confirm: (message, defaultValue = false) => __awaiter(this, void 0, void 0, function* () {
            const { yesno } = yield inquirer.prompt({
                name: 'yesno',
                type: 'confirm',
                message,
                default: defaultValue,
            });
            return yesno;
        }),
        ask: (questions) => __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(questions)) {
                questions = questions.map(q => {
                    if (q.type === 'rawlist' || q.type === 'list') {
                        q.type = 'select';
                    }
                    if (q.type === 'expand') {
                        q.type = 'autocomplete';
                    }
                    if (q.type === 'checkbox') {
                        q.type = 'multiselect';
                    }
                    if (q.type === 'radio') {
                        q.type = 'select';
                    }
                    if (q.type === 'question') {
                        q.type = 'input';
                    }
                    return q;
                });
            }
            return inquirer.prompt(questions);
        }),
    };
}
function attachParameters(context) {
    const { argv, plugin, command, subCommands, options } = context.input;
    context.parameters = {
        argv,
        plugin,
        command,
        options,
    };
    context.parameters.options = context.parameters.options || {};
    context.parameters.raw = argv;
    context.parameters.array = subCommands;
    /* tslint:disable */
    if (subCommands && subCommands.length > 0) {
        if (subCommands.length > 0) {
            context.parameters.first = subCommands[0];
        }
        if (subCommands.length > 1) {
            context.parameters.second = subCommands[1];
        }
        if (subCommands.length > 2) {
            context.parameters.third = subCommands[2];
        }
    }
    /* tslint:enable */
}
function attachRuntime(context) {
    context.runtime = {
        plugins: [],
    };
    Object.keys(context.pluginPlatform.plugins).forEach(pluginShortName => {
        const pluginInfos = context.pluginPlatform.plugins[pluginShortName];
        pluginInfos.forEach(pluginInfo => {
            const name = path_1.default.basename(pluginInfo.packageLocation);
            const directory = pluginInfo.packageLocation;
            const pluginName = pluginInfo.manifest.name;
            const pluginType = pluginInfo.manifest.type;
            const commands = pluginInfo.manifest.commands;
            context.runtime.plugins.push({
                name,
                directory,
                pluginName,
                pluginType,
                commands,
            });
        });
    });
}
function attachFilesystem(context) {
    context.filesystem = contextFileSystem;
}
const contextFileSystem = {
    remove: (targetPath) => {
        fs_extra_1.default.removeSync(targetPath);
    },
    read: (targetPath, encoding = 'utf8') => {
        const result = fs_extra_1.default.readFileSync(targetPath, encoding);
        return result;
    },
    write: (targetPath, data) => {
        fs_extra_1.default.ensureFileSync(targetPath);
        fs_extra_1.default.writeFileSync(targetPath, data, 'utf-8');
    },
    exists: (targetPath) => {
        const result = fs_extra_1.default.existsSync(targetPath);
        return result;
    },
    isFile: (targetPath) => {
        const result = fs_extra_1.default.statSync(targetPath).isFile();
        return result;
    },
    path: (...pathParts) => {
        const result = path_1.default.normalize(path_1.default.join(...pathParts));
        return result;
    },
};
function attachPatching(context) {
    context.patching = {
        replace: (filePath, oldContent, newContent) => __awaiter(this, void 0, void 0, function* () {
            const fileContent = fs_extra_1.default.readFileSync(filePath, 'utf-8');
            const updatedFileContent = fileContent.replace(oldContent, newContent);
            fs_extra_1.default.writeFileSync(filePath, updatedFileContent, 'utf-8');
            return Promise.resolve(updatedFileContent);
        }),
    };
}
function attachPrint(context) {
    context.print = print;
}
const print = {
    info,
    fancy,
    warning,
    error,
    success,
    table,
    debug,
    green,
    yellow,
    red,
    blue,
};
exports.print = print;
function info(message) {
    console.log(colors.info(message));
}
function warning(message) {
    console.log(colors.warning(message));
}
function error(message) {
    console.log(colors.error(message));
}
function success(message) {
    console.log(colors.success(message));
}
function green(message) {
    console.log(colors.green(message));
}
function yellow(message) {
    console.log(colors.yellow(message));
}
function red(message) {
    console.log(colors.red(message));
}
function blue(message) {
    console.log(colors.blue(message));
}
function fancy(message) {
    console.log(message);
}
function debug(message, title = 'DEBUG') {
    const topLine = `vvv -----[ ${title} ]----- vvv`;
    const botLine = `^^^ -----[ ${title} ]----- ^^^`;
    console.log(colors.rainbow(topLine));
    console.log(message);
    console.log(colors.rainbow(botLine));
}
function table(data, options = {}) {
    let t;
    switch (options.format) {
        case 'markdown':
            const header = data.shift();
            t = new cli_table3_1.default({
                head: header,
                chars: CLI_TABLE_MARKDOWN,
            });
            t.push(...data);
            t.unshift(columnHeaderDivider(t));
            break;
        case 'lean':
            t = new cli_table3_1.default();
            t.push(...data);
            break;
        default:
            t = new cli_table3_1.default({
                chars: CLI_TABLE_COMPACT,
            });
            t.push(...data);
    }
    console.log(t.toString());
}
function columnHeaderDivider(cliTable) {
    return findWidths(cliTable).map(w => Array(w).join('-'));
}
function findWidths(cliTable) {
    return [cliTable.options.head]
        .concat(getRows(cliTable))
        .reduce((colWidths, row) => row.map((str, i) => Math.max(`${str}`.length + 1, colWidths[i] || 1)), []);
}
function getRows(cliTable) {
    const list = new Array(cliTable.length);
    for (let i = 0; i < cliTable.length; i++) {
        list[i] = cliTable[i];
    }
    return list;
}
const CLI_TABLE_COMPACT = {
    top: '',
    'top-mid': '',
    'top-left': '',
    'top-right': '',
    bottom: '',
    'bottom-mid': '',
    'bottom-left': '',
    'bottom-right': '',
    left: ' ',
    'left-mid': '',
    mid: '',
    'mid-mid': '',
    right: '',
    'right-mid': '',
    middle: ' ',
};
const CLI_TABLE_MARKDOWN = Object.assign(Object.assign({}, CLI_TABLE_COMPACT), { left: '|', right: '|', middle: '|' });
function attachTemplate(context) {
    context.template = {
        generate(opts) {
            return __awaiter(this, void 0, void 0, function* () {
                const ejs = require('ejs');
                const template = opts.template;
                const target = opts.target;
                const props = opts.props || {};
                const data = {
                    props,
                };
                const directory = opts.directory;
                const pathToTemplate = `${directory}/${template}`;
                if (!contextFileSystem.isFile(pathToTemplate)) {
                    throw new Error(`template not found ${pathToTemplate}`);
                }
                const templateContent = contextFileSystem.read(pathToTemplate);
                const content = ejs.render(templateContent, data);
                if (target.length > 0) {
                    const dir = target.replace(/$(\/)*/g, '');
                    const dest = contextFileSystem.path(dir);
                    contextFileSystem.write(dest, content);
                }
                return content;
            });
        },
    };
}
//# sourceMappingURL=../src/lib/context-extensions.js.map