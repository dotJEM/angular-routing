/// <reference path="../refs.d.ts" />
var StateRules = (function () {
    function StateRules() {
    }
    StateRules.validateName = function (name) {
        if (!StateRules.nameValidation.test(name) || name === rootName) {
            throw new Error("Invalid name: '" + name + "'.");
        }
    };

    StateRules.validateTarget = function (target) {
        if (target === '*' || StateRules.targetValidation.test(target)) {
            return true;
        }
        return false;
    };
    StateRules.nameValidation = /^\w+(\.\w+)*?$/;
    StateRules.targetValidation = /^\$?\w+(\.\w+)*(\.[*])?$/;
    return StateRules;
})();
