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
Object.defineProperty(exports, "__esModule", { value: true });
const cleanUpQueue = [];
let CLEANUP_REGISTERED = false;
function addCleanupTask(context, task) {
    if (!CLEANUP_REGISTERED) {
        registerCleanup(context);
        CLEANUP_REGISTERED = true;
    }
    cleanUpQueue.push(task);
}
exports.addCleanupTask = addCleanupTask;
function registerCleanup(context) {
    // do all the cleanup
    process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
        const promises = cleanUpQueue.map(fn => fn(context));
        yield Promise.all(promises);
        process.exit(0);
    }));
}
//# sourceMappingURL=cleanup-task.js.map