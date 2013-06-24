/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />

/// <reference path="stateHelper.ts" />
/// <reference path="stateFactory.ts" />

interface IStateClass {
    children: any;

    self: ui.routing.IState;
    parent: IStateClass;
    root: IStateClass;
    name: string;
    fullname: string;
    reloadOnOptional: bool;

    route?: any;

    lookup: (fullname: string, stop?: number) => IStateClass;
    add: (child: IStateClass) => IStateClass;
    resolveRoute: () => string;
}

module ui.routing {
    //TODO: Ones completely implementing to replace the object created by the state provider
    //      rename to "State". and "IState"...
    export class StateClass implements IStateClass {
        private _children: { [name: string]: StateClass; } = {};
        private _self: IRegisteredState;
        private _reloadOnOptional: bool;
        private _route: any;

        get children(): any { return this._children; }
        get fullname(): string { return this._fullname; }
        get name(): string { return this._name; }
        get reloadOnOptional(): bool { return this._reloadOnOptional; }
        get self(): IRegisteredState { return copy(this._self); }
        get parent(): IStateClass { return this._parent; }
        get route(): any { return this._route; }
        get root(): IStateClass {
            if (this.parent === null)
                return this;
            return this._parent.root;
        }

        set route(value: any) {
            if (isUndefined(value))
                throw 'Please supply time interval';
            this._route = value;
        }

        set reloadOnOptional(value: any) {
            this._reloadOnOptional = value;
        }

        constructor(private _name: string, private _fullname: string, _self: IState, private _parent?: IStateClass) {
            //Note: we don't gard for names with no '.' (root) as the code below will actually give
            //      the correct result (the whole string) as lastIndexOf returns -1 resulting in starting
            //      at 0.

            //TODO: This should be performed by the factory instead.
            //this._name = _fullname.split('.').pop();
            this._self = <IRegisteredState>_self;

            //TODO: This should be performed by the factory instead.
            //if (isDefined(_parent))
            //    this._self.$fullname = _parent.fullname + "." + this.name;
            //else
            this._self.$fullname = _fullname;

            this._reloadOnOptional = !isDefined(_self.reloadOnSearch) || _self.reloadOnSearch;
        }

        public add(child: IStateClass): IStateClass {
            this._children[child.name] = <StateClass>child;
            return this;
        }

        public resolveRoute(): string {
            return isDefined(this.route) ? this.route.route
                 : isDefined(this.parent) ? this.parent.resolveRoute()
                 : '';
        }

        private internalLookup(names: string[], stop?: number): StateClass {
            var next,
                state,
                stop = isDefined(stop) ? stop : 0;

            if (names.length == stop)
                return this;

            next = names.shift();
            state = this._children[next];

            if (isUndefined(state))
                throw "Could not locate '" + next + "' under '" + this.fullname + "'.";

            return state.internalLookup(names, stop);
        }

        public lookup(fullname: string, stop?: number): IStateClass {
            var names = fullname.split('.');
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