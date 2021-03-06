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
const cliConstants = require('../extensions/amplify-helpers/constants');
const { showAllHelp } = require('../extensions/amplify-helpers/show-all-help');
module.exports = {
    name: cliConstants.CliName,
    alias: ['h', '-h'],
    run: (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield showAllHelp(context);
    }),
};
//# sourceMappingURL=../../src/lib/commands/help.js.map