"use strict";
var sharedQuestions = {
    accessLevel: function (entity) { return ({
        name: 'accessLevel',
        type: 'list',
        message: "Choose the level of access required to access this " + entity + ":",
        required: true,
        choices: [
            'Public',
            'Private',
            'Protected',
            'None',
        ],
    }); },
};
module.exports = {
    sharedQuestions: sharedQuestions,
};
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/shared-questions.js.map