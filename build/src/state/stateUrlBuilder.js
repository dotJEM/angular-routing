var ui;
(function (ui) {
    /// <reference path="../../lib/angular/angular-1.0.d.ts" />
    /// <reference path="../common.ts" />
    /// <reference path="../interfaces.d.ts" />
    /// <reference path="stateRules.ts" />
    /// <reference path="stateBrowser.ts" />
    /// <reference path="state.ts" />
    (function (routing) {
        //TODO: Implement as Angular Provider.
        var StateUrlBuilder = (function () {
            function StateUrlBuilder(route) {
                this.route = route;
            }
            StateUrlBuilder.prototype.buildUrl = function (current, target, params) {
                var c = current;
                if(!target.route) {
                    throw new Error("Can't build url for a state that doesn't have a url defined.");
                }
                //TODO: Find parent with route and return?
                //TODO: This is very similar to what we do in buildStateArray -> extractParams,
                //      maybe we can refactor those together
                                var paramsObj = {
                }, allFrom = (c && c.$params && c.$params.all) || {
                };
                forEach(target.route.params, function (param, name) {
                    if(name in allFrom) {
                        paramsObj[name] = allFrom[name];
                    }
                });
                return this.route.format(target.route.route, extend(paramsObj, params || {
                }));
            };
            return StateUrlBuilder;
        })();
        routing.StateUrlBuilder = StateUrlBuilder;        
    })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
