/// <reference path="state.ts" />
var StateRules = (function () {
    function StateRules() { }
    StateRules.nameValidation = /^\w+(\.\w+)*?$/;
    StateRules.targetValidation = /^\$?\w+(\.\w+)*(\.[*])?$/;
    StateRules.validateName = function validateName(name) {
        if(!StateRules.nameValidation.test(name) || name === rootName) {
            throw new Error("Invalid name: '" + name + "'.");
        }
    };
    StateRules.validateTarget = function validateTarget(target) {
        if(target === '*' || StateRules.targetValidation.test(target)) {
            return true;
        }
        return false;
    };
    return StateRules;
})();
