/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />

/// <reference path="stateRules.ts" />
/// <reference path="stateFactory.ts" />

class State {
    private _children: { [name: string]: State; } = {};
    private _self: dotjem.routing.IRegisteredState;
    private _reloadOnOptional: bool;
    private _route: any;
    private _scrollTo: any;

    get children(): any { return this._children; }
    get fullname(): string { return this._fullname; }
    get name(): string { return this._name; }
    get reloadOnOptional(): bool { return this._reloadOnOptional; }
    get self(): dotjem.routing.IRegisteredState { return copy(this._self); }
    get parent(): State { return this._parent; }
    get route(): any { return this._route; }
    get root(): State {
        if (this.parent === null)
            return this;
        return this._parent.root;
    }

    set route(value: any) {
        if (isUndefined(value))
            throw Error(errors.routeCannotBeUndefined);
        this._route = value;
    }

    set reloadOnOptional(value: any) {
        this._reloadOnOptional = value;
    }

    get scrollTo() {
        return this._scrollTo;
    }

    get views() {
        return this.self.views;
    }

    get resolve() {
        return this.self.resolve;
    }

    constructor(private _name: string, private _fullname: string, _self: dotjem.routing.IState, private _parent?: State) {
        this._self = <dotjem.routing.IRegisteredState>_self;
        this._self.$fullname = _fullname;
        this._reloadOnOptional = !isDefined(_self.reloadOnSearch) || _self.reloadOnSearch;
        this._scrollTo = this._self.scrollTo || _parent && _parent.scrollTo || 'top';
    }

    public add(child: State): State {
        this._children[child.name] = child;
        return this;
    }

    public resolveRoute(): string {
        return isDefined(this.route) ? this.route.route
             : isDefined(this.parent) ? this.parent.resolveRoute()
             : '';
    }

    public is(state: string) {
        return this.fullname === state || this.fullname === 'root.' + state;
    }

    public isParent(state: string) {
        //TODO: Bad implementation, this will fail
        if (this.fullname.indexOf(state) != -1)
            return true;
        return false;
        //if (state.substr(0, 5) !== 'root.')
        //    state = 'root.' + state;

        //var regex = new RegExp('^' + state.replace('.', '\\.') + '(\\.\\w+)*$;');
        //return regex.test(this.fullname);
    }
}