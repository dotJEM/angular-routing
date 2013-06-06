/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

interface IStateFactory {
    createRoute: (stateRoute: string, parentRoute: any, stateName: string, reloadOnSearch: bool) => any;
    createState: (fullname: string, state: ui.routing.IState, parent?: IStateClass) => IStateClass;
}

interface IStateClass {
    self: ui.routing.IState;
    parent: IStateClass;
    name: string;
    fullname: string;
    reloadOnOptional: bool;

    route?: any;

    lookup: (names: string[], stop?: number) => IStateClass;
    add: (fullname: string, child: IStateClass) => IStateClass;
    resolveRoute: () => string;
}



module ui.routing {
    //TODO: Implement as Angular Provider.
    export class StateFactory implements IStateFactory {
        private static _instance;

        public static get instance(): IStateFactory{
            return StateFactory._instance;
        }

        public static Initialize(routes: IRouteProvider, transitions: ITransitionProvider) {
            _instance = new StateFactory(routes, transitions);
        }

        constructor(private routes: IRouteProvider, private transitions: ITransitionProvider) {

        }
        public createRoute(stateRoute: string, parentRoute: any, stateName: string, reloadOnSearch: bool) {
            var route;

            if (route !== '' && route[route.length - 1] === '/') {
                route = route.substr(0, route.length - 1);
            }

            if (stateRoute[0] !== '/' && stateRoute !== '')
                route += '/';
            route += stateRoute;

            return this.routes.when(route, { state: stateName, reloadOnSearch: reloadOnSearch });
        }

        public createState(fullname: string, state: IState, parent?: IStateClass): IStateClass {
            var stateObj = new StateClass(fullname, state, parent);

            if (isDefined(state.route)) {
                stateObj.route = this.createRoute(state.route, parent.resolveRoute(), fullname, state.reloadOnSearch);
            }

            if (isDefined(state.onEnter)) {
                this.transitions.onEnter(fullname, state.onEnter);
            }

            if (isDefined(state.onExit)) {
                this.transitions.onExit(fullname, state.onExit);
            }

            if (isDefined(state.children)) {
                forEach(state.children, (childState, childName) => {
                    stateObj.add(stateObj.fullname + '.' + childName, childState);
                });
            }
            return stateObj;
        }
    }

    export class StateClass implements IStateClass {
        private _children: { [name: string]: StateClass; } = {};
        private _self: IRegisteredState;
        private _name: string;
        private _reloadOnOptional: bool;
        private _route: any;

        get fullname(): string {
            return this._fullname;
        }

        get name(): string {
            return this._name;
        }

        get reloadOnOptional(): bool {
            return this._reloadOnOptional;
        }

        get self(): IRegisteredState {
            return copy(this._self);
        }

        get parent(): IStateClass {
            return this._parent;
        }

        get route(): any {
            return this._route;
        }

        set route(value: any) {
            if (isUndefined(value))
                throw 'Please supply time interval';
            this._route = value;
        }

        constructor(private _fullname: string, _self: IState, private _parent?: IStateClass) {
            //Note: we don't gard for names with no '.' (root) as the code below will actually give
            //      the correct result (the whole string) as lastIndexOf returns -1 resulting in starting
            //      at 0.
            this._self = <IRegisteredState>_self;
            this._name = _fullname.split('.').pop();
            this._self.$fullname = _fullname;
            this._reloadOnOptional = !isDefined(_self.reloadOnSearch) || _self.reloadOnSearch;
        }

        public add(fullname: string, child: IStateClass): IStateClass {
            this._children[child.name] = <StateClass>child;
            return this;
        }

        public resolveRoute(): string {
            return isDefined(this.route) ? this.route
                 : isDefined(this.parent) ? this.parent.resolveRoute()
                 : '';
        }

        private internalLookup(names: string[], stop?: number): StateClass {
            var next = names.shift(),
            state = this._children[next],
            stop = isDefined(stop) ? stop : 0;

            if (isUndefined(state))
                throw "Could not locate '" + next + "' under '" + this.fullname + "'.";

            return names.length == stop ? state : state.internalLookup(names);
        }

        public lookup(names: string[], stop?: number): IStateClass {
            if (names[0] === 'root')
                names.shift();
            return this.internalLookup(names, stop);
        }

        //function lookup(names: string[]) {
        //    var current = root,
        //        //If name contains root explicitly, skip that one
        //        i = names[0] === 'root' ? 1 : 0;

        //    for (; i < names.length; i++) {
        //        if (!(names[i] in current.children))
        //            throw new Error("Could not locate '" + names[i] + "' under '" + current.fullname + "'.");

        //        current = current.children[names[i]];
        //    }
        //    return current;
        //}
    }
}