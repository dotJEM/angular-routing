/// <reference path="state.ts" />
var StateRules = (function () {
    function StateRules() { }
    StateRules.nameValidation = /^\w+(\.\w+)*?$/;
    StateRules.validateName = function validateName(name) {
        if(StateRules.nameValidation.test(name)) {
            return;
        }
        throw new Error("Invalid name: '" + name + "'.");
    };
    return StateRules;
})();
