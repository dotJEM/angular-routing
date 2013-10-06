/// <reference path="state.ts" />
var StateRules = (function () {
    function StateRules() { }
    StateRules.nameValidation = /^\w+(\.\w+)*?$/;
    StateRules.validateName = function validateName(name) {
        if(!StateRules.nameValidation.test(name) || name === rootName) {
            throw new Error("Invalid name: '" + name + "'.");
        }
    };
    return StateRules;
})();
