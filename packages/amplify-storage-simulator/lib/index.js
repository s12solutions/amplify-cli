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
const S3server_1 = require("./server/S3server");
class AmplifyStorageSimulator {
    constructor(serverConfig) {
        this._serverConfig = serverConfig;
        try {
            this._server = new S3server_1.StorageServer(serverConfig);
        }
        catch (e) {
            console.log('Mock storage sever failed to start');
            console.log(e);
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._server.start();
        });
    }
    stop() {
        this._server.stop();
    }
    get url() {
        return this._server.url;
    }
    get getServer() {
        return this._server;
    }
}
exports.AmplifyStorageSimulator = AmplifyStorageSimulator;
//# sourceMappingURL=index.js.map