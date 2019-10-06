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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var safe_1 = __importDefault(require("colors/safe"));
var cli_table3_1 = __importDefault(require("cli-table3"));
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
var colors = safe_1.default;
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
    var _this = this;
    var inquirer = require('inquirer');
    context.prompt = {
        confirm: function (message) { return __awaiter(_this, void 0, void 0, function () {
            var yesno;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer.prompt({
                            name: 'yesno',
                            type: 'confirm',
                            message: message,
                        })];
                    case 1:
                        yesno = (_a.sent()).yesno;
                        return [2 /*return*/, yesno];
                }
            });
        }); },
        ask: function (questions) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (Array.isArray(questions)) {
                    questions = questions.map(function (q) {
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
                return [2 /*return*/, inquirer.prompt(questions)];
            });
        }); },
    };
}
function attachParameters(context) {
    var _a = context.input, argv = _a.argv, plugin = _a.plugin, command = _a.command, subCommands = _a.subCommands, options = _a.options;
    context.parameters = {
        argv: argv,
        plugin: plugin,
        command: command,
        options: options,
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
    Object.keys(context.pluginPlatform.plugins).forEach(function (pluginShortName) {
        var pluginInfos = context.pluginPlatform.plugins[pluginShortName];
        pluginInfos.forEach(function (pluginInfo) {
            var name = path_1.default.basename(pluginInfo.packageLocation);
            var directory = pluginInfo.packageLocation;
            var pluginName = pluginInfo.manifest.name;
            var pluginType = pluginInfo.manifest.type;
            var commands = pluginInfo.manifest.commands;
            context.runtime.plugins.push({
                name: name,
                directory: directory,
                pluginName: pluginName,
                pluginType: pluginType,
                commands: commands,
            });
        });
    });
}
function attachFilesystem(context) {
    context.filesystem = contextFileSystem;
}
var contextFileSystem = {
    remove: function (targetPath) {
        fs_extra_1.default.removeSync(targetPath);
    },
    read: function (targetPath, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var result = fs_extra_1.default.readFileSync(targetPath, encoding);
        return result;
    },
    write: function (targetPath, data) {
        fs_extra_1.default.ensureFileSync(targetPath);
        fs_extra_1.default.writeFileSync(targetPath, data, 'utf-8');
    },
    exists: function (targetPath) {
        var result = fs_extra_1.default.existsSync(targetPath);
        return result;
    },
    isFile: function (targetPath) {
        var result = fs_extra_1.default.statSync(targetPath).isFile();
        return result;
    },
    path: function () {
        var pathParts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pathParts[_i] = arguments[_i];
        }
        var result = path_1.default.normalize(path_1.default.join.apply(path_1.default, pathParts));
        return result;
    },
};
function attachPatching(context) {
    var _this = this;
    context.patching = {
        replace: function (filePath, oldContent, newContent) { return __awaiter(_this, void 0, void 0, function () {
            var fileContent, updatedFileContent;
            return __generator(this, function (_a) {
                fileContent = fs_extra_1.default.readFileSync(filePath, 'utf-8');
                updatedFileContent = fileContent.replace(oldContent, newContent);
                fs_extra_1.default.writeFileSync(filePath, updatedFileContent, 'utf-8');
                return [2 /*return*/, Promise.resolve(updatedFileContent)];
            });
        }); },
    };
}
function attachPrint(context) {
    context.print = print;
}
var print = {
    info: info,
    fancy: fancy,
    warning: warning,
    error: error,
    success: success,
    table: table,
    debug: debug,
    green: green,
    yellow: yellow,
    red: red,
    blue: blue,
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
function debug(message, title) {
    if (title === void 0) { title = 'DEBUG'; }
    var topLine = "vvv -----[ " + title + " ]----- vvv";
    var botLine = "^^^ -----[ " + title + " ]----- ^^^";
    console.log(colors.rainbow(topLine));
    console.log(message);
    console.log(colors.rainbow(botLine));
}
function table(data, options) {
    if (options === void 0) { options = {}; }
    var t;
    switch (options.format) {
        case 'markdown':
            var header = data.shift();
            t = new cli_table3_1.default({
                head: header,
                chars: CLI_TABLE_MARKDOWN,
            });
            t.push.apply(t, data);
            t.unshift(columnHeaderDivider(t));
            break;
        case 'lean':
            t = new cli_table3_1.default();
            t.push.apply(t, data);
            break;
        default:
            t = new cli_table3_1.default({
                chars: CLI_TABLE_COMPACT,
            });
            t.push.apply(t, data);
    }
    console.log(t.toString());
}
function columnHeaderDivider(cliTable) {
    return findWidths(cliTable).map(function (w) { return Array(w).join('-'); });
}
function findWidths(cliTable) {
    return [cliTable.options.head]
        .concat(getRows(cliTable))
        .reduce(function (colWidths, row) { return row.map(function (str, i) { return Math.max(("" + str).length + 1, colWidths[i] || 1); }); }, []);
}
function getRows(cliTable) {
    var list = new Array(cliTable.length);
    for (var i = 0; i < cliTable.length; i++) {
        list[i] = cliTable[i];
    }
    return list;
}
var CLI_TABLE_COMPACT = {
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
var CLI_TABLE_MARKDOWN = __assign(__assign({}, CLI_TABLE_COMPACT), { left: '|', right: '|', middle: '|' });
function attachTemplate(context) {
    context.template = {
        generate: function (opts) {
            return __awaiter(this, void 0, void 0, function () {
                var ejs, template, target, props, data, directory, pathToTemplate, templateContent, content, dir, dest;
                return __generator(this, function (_a) {
                    ejs = require('ejs');
                    template = opts.template;
                    target = opts.target;
                    props = opts.props || {};
                    data = {
                        props: props,
                    };
                    directory = opts.directory;
                    pathToTemplate = directory + "/" + template;
                    if (!contextFileSystem.isFile(pathToTemplate)) {
                        throw new Error("template not found " + pathToTemplate);
                    }
                    templateContent = contextFileSystem.read(pathToTemplate);
                    content = ejs.render(templateContent, data);
                    if (target.length > 0) {
                        dir = target.replace(/$(\/)*/g, '');
                        dest = contextFileSystem.path(dir);
                        contextFileSystem.write(dest, content);
                    }
                    return [2 /*return*/, content];
                });
            });
        },
    };
}
//# sourceMappingURL=../src/lib/context-extensions.js.map