var ui;
(function (ui) {
    (function (routing) {
        //TODO: Implement as Angular Provider.
        var StateFactory = (function () {
            function StateFactory(routes, transitions) {
                this.routes = routes;
                this.transitions = transitions;
            }
            Object.defineProperty(StateFactory, "instance", {
                get: function () {
                    return StateFactory._instance;
                },
                enumerable: true,
                configurable: true
            });
            StateFactory.Initialize = function Initialize(routes, transitions) {
                StateFactory._instance = new StateFactory(routes, transitions);
            };
            StateFactory.prototype.createRoute = function (stateRoute, parentRoute, stateName, reloadOnSearch) {
                var route;
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
                var stateObj = new routing.StateClass(fullname, state, parent);
                if(isDefined(state.route)) {
                    stateObj.route = this.createRoute(state.route, parent.resolveRoute(), fullname, state.reloadOnSearch);
                }
                if(isDefined(state.onEnter)) {
                    this.transitions.onEnter(fullname, state.onEnter);
                }
                if(isDefined(state.onExit)) {
                    this.transitions.onExit(fullname, state.onExit);
                }
                if(isDefined(state.children)) {
                    forEach(state.children, function (childState, childName) {
                        stateObj.add(stateObj.fullname + '.' + childName, childState);
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
