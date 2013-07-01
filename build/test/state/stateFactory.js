var ui;
(function (ui) {
    /// <reference path="../../lib/angular/angular-1.0.d.ts" />
    /// <reference path="../common.ts" />
    /// <reference path="../interfaces.d.ts" />
    /// <reference path="stateRules.ts" />
    /// <reference path="state.ts" />
    (function (routing) {
        //TODO: Implement as Angular Provider.
        var StateFactory = (function () {
            function StateFactory(routes, transitions) {
                this.routes = routes;
                this.transitions = transitions;
            }
            StateFactory.prototype.createRoute = function (stateRoute, parentRoute, stateName, reloadOnSearch) {
                var route = parentRoute || '';
                if(route !== '' && route[route.length - 1] === '/') {
                    route = route.substr(0, route.length - 1);
                }
                if(stateRoute[0] !== '/' && stateRoute !== '') {
                    route += '/';
                }
                route += stateRoute;
                return this.routes.when(route, {
                    state: stateName,
                    reloadOnSearch: reloadOnSearch
                });
            };
            StateFactory.prototype.createState = function (fullname, state, parent) {
                var _this = this;
                var name = fullname.split('.').pop();
                if(isDefined(parent)) {
                    fullname = parent.fullname + "." + name;
                }
                var stateObj = new routing.State(name, fullname, state, parent);
                stateObj.reloadOnOptional = !isDefined(state.reloadOnSearch) || state.reloadOnSearch;
                if(isDefined(state.route)) {
                    stateObj.route = this.createRoute(state.route, parent.resolveRoute(), stateObj.fullname, stateObj.reloadOnOptional).$route;
                }
                if(isDefined(state.onEnter)) {
                    this.transitions.onEnter(stateObj.fullname, state.onEnter);
                }
                if(isDefined(state.onExit)) {
                    this.transitions.onExit(stateObj.fullname, state.onExit);
                }
                if(isDefined(state.children)) {
                    forEach(state.children, function (childState, childName) {
                        stateObj.add(_this.createState(stateObj.fullname + '.' + childName, childState, stateObj));
                    });
                }
                return stateObj;
            };
            return StateFactory;
        })();
        routing.StateFactory = StateFactory;        
    })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
