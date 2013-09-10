/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="stateRules.ts" />
/// <reference path="stateFactory.ts" />
var Transition = (function () {
    function Transition(gotofn) {
        this.gotofn = gotofn;
        this.canceled = false;
    }
    Transition.prototype.cancel = function () {
        this.canceled = true;
    };
    Transition.prototype.goto = function (state, params) {
        this.cancel();
        this.gotofn({
            state: state,
            params: {
                all: params
            },
            updateroute: true
        });
    };
    return Transition;
})();
