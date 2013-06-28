/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />

/// <reference path="stateRules.ts" />
/// <reference path="state.ts" />

module ui.routing {
    //TODO: Implement as Angular Provider.
    export class StateFactory {

        constructor(private routes: IRouteProvider, private transitions: ITransitionProvider) {
        }

        public createRoute(stateRoute: string, parentRoute: any, stateName: string, reloadOnSearch: bool) {
            var route = parentRoute || '';

            if (route !== '' && route[route.length - 1] === '/') {
                route = route.substr(0, route.length - 1);
            }

            if (stateRoute[0] !== '/' && stateRoute !== '')
                route += '/';
            route += stateRoute;

            return this.routes.when(route, { state: stateName, reloadOnSearch: reloadOnSearch });
        }

        public createState(fullname: string, state: IState, parent?: State): State {
            var name = fullname.split('.').pop()
            if (isDefined(parent))
                fullname = parent.fullname + "." + name;
            
            var stateObj = new State(name, fullname, state, parent);

            stateObj.reloadOnOptional = !isDefined(state.reloadOnSearch) || state.reloadOnSearch;
            if (isDefined(state.route)) {
                stateObj.route = this.createRoute(state.route, parent.resolveRoute(), stateObj.fullname, stateObj.reloadOnOptional).$route;
            }

            if (isDefined(state.onEnter)) {
                this.transitions.onEnter(stateObj.fullname, state.onEnter);
            }

            if (isDefined(state.onExit)) {
                this.transitions.onExit(stateObj.fullname, state.onExit);
            }

            if (isDefined(state.children)) {
                forEach(state.children, (childState, childName) => {
                    stateObj.add(this.createState(stateObj.fullname + '.' + childName, childState, stateObj));
                });
            }
            return stateObj;
        }
    }
}