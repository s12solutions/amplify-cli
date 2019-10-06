"use strict";
function inputValidation(question) {
    var validator = function (input) {
        if (!question.validation) {
            if (question.required) {
                return input ? true : 'A response is required for this field';
            }
            return true;
        }
        if (question.validation.operator === 'includes') {
            return input.includes(question.validation.value) ? true : question.validation.onErrorMsg;
        }
        if (question.validation.operator === 'regex') {
            var regex = new RegExp(question.validation.value);
            return regex.test(input) ? true : question.validation.onErrorMsg;
        }
        if (question.validation.operator === 'range') {
            var isGood = input >= question.validation.value.min && input <= question.validation.value.max;
            return isGood ? true : question.validation.onErrorMsg;
        }
        if (question.validation.operator === 'noEmptyArray') {
            return Array.isArray(input) && input.length > 0 ? true : question.validation.onErrorMsg;
        }
        if (question.required) {
            return input ? true : 'A response is required for this field';
        }
    };
    // RETURN THE FUNCTION SO IT CAN BE SET AS THE QUESTION'S "VALIDATE" VALUE
    return validator;
}
module.exports = { inputValidation: inputValidation };
//# sourceMappingURL=../../../src/lib/extensions/amplify-helpers/input-validation.js.map