/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

interface IStateFactory {

}

interface IStateClass {
    self: ui.routing.IState;
    fullname: string;
    //reloadOnOptional: bool;

    //parent?: IStateWrapper;
    //route?: any;

    lookup: (names: string[]) => IStateClass;

    add: (name: string, child: IStateClass) => IStateClass;

}

interface IStateMap {
    [name: string]: IStateClass;
}

module ui.routing {
    export class StateFactory implements IStateFactory {
        public static CreateState(name: string, state: IState) {
            //return function registerState(name, at: IStateWrapper, state: ui.routing.IState) {
            //    var fullname = at.fullname + '.' + name,
            //        parent = at;

            //    if (!isDefined(at.children)) {
            //        at.children = {};
            //    }

            //    if (!(name in at.children)) {
            //        at.children[name] = {};
            //    }
            //    at = at.children[name];
            //    at.self = extend({}, state, { $fullname: fullname });
            //    at.fullname = fullname;
            //    at.parent = parent;
            //    at.reloadOnOptional = !isDefined(state.reloadOnSearch) || state.reloadOnSearch;

            //    if (isDefined(state.route)) {
            //        at.route = createRoute(state.route, lookupRoute(parent), fullname, at.reloadOnOptional).$route;
            //    }

            //    if (isDefined(state.onEnter)) {
            //        $transitionProvider.onEnter(fullname, state.onEnter);
            //    }

            //    if (isDefined(state.onExit)) {
            //        $transitionProvider.onExit(fullname, state.onExit);
            //    }

            //    if (state.children === null) {
            //        at.children = {};
            //    } else {
            //        forEach(state.children, (childState, childName) => {
            //            registerState(childName, at, childState);
            //        });
            //    }
            //}
        }
    }

    export class StateWrapper implements IStateClass {
        private children: IStateMap = {};

        get fullname(): string {
            return this._fullname;
        }

        get self(): IState {
            return copy(this._self);
        }

        //set timeInterval(value: number) {
        //    if (value === undefined) throw 'Please supply time interval';
        //    this._timeInterval = value;
        //}

        constructor(private _fullname: string, private _self: IState) {

        }

        public add(name: string, child: IStateClass):IStateClass {
            this.children[name] = child;
            return this;
        }

        public lookup(names: string[]): IStateClass {
            var next = names.shift();

            if (!(next in this.children))
                throw new Error("Could not locate '" + next + "' under '" + this.fullname + "'.");

            return this.children[next].lookup(names);
        }
    }
}