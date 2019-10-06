"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestStorage {
    constructor() {
        this.data = {};
    }
    // set item with the key
    setItem(key, value) {
        this.data[key] = value;
        return value;
    }
    // get item with the key
    getItem(key) {
        return this.data[key];
    }
    // remove item with the key
    removeItem(key) {
        this.data[key] = undefined;
    }
    // clear out the storage
    clear() {
        this.data = {};
    }
    // If the storage operations are async(i.e AsyncStorage)
    // Then you need to sync those items into the memory in this method
    sync() {
        return Promise.resolve(this.data);
    }
}
exports.default = TestStorage;
//# sourceMappingURL=test-storage.js.map