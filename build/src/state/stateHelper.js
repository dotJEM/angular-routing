var ui;
(function (ui) {
    /// <reference path="stateWrapper.ts" />
    /// <reference path="stateFactory.ts" />
    (function (routing) {
        //TODO: Implement as Angular Provider.
        var StateHelper = (function () {
            function StateHelper() { }
            StateHelper.nameValidation = /^\w+(\.\w+)*?$/;
            StateHelper.validateName = function validateName(name) {
                if(StateHelper.nameValidation.test(name)) {
                    return;
                }
                throw new Error("Invalid name: '" + name + "'.");
            };
            return StateHelper;
        })();
        routing.StateHelper = StateHelper;        
    })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
