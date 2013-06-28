var ui;
(function (ui) {
    /// <reference path="state.ts" />
    (function (routing) {
        //TODO: Implement as Angular Provider.
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
        routing.StateRules = StateRules;        
    })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
