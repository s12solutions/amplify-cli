"use strict";
function makeId(n) {
    if (!n) {
        n = 5;
    }
    var text = '';
    var possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (var i = 0; i < n; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
module.exports = {
    makeId: makeId,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/make-id.js.map