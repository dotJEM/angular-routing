/// <reference path="../../refs.d.ts" />

class Context {
    private previous: any = {};
    private properties: any = {};
    private _$state: dotjem.routing.IStateService;

    public aborted: bool = false;
    public completed: bool = false;

    get $state(): dotjem.routing.IStateService { return this._$state; }

    get to() { return this.properties.to; }
    set to(value) { this.properties.to = value; }

    get from() { return this.properties.from; }
    set from(value) { this.properties.from = value; }

    get params() { return this.properties.params; }
    set params(value) { this.properties.params = value; }

    get emit() { return this.properties.emit; }
    set emit(value) { this.properties.emit = value; }

    get changed() { return this.properties.changed; }
    set changed(value) { this.properties.changed = value; }

    get toState() { return this.properties.toState; }
    set toState(value) { this.properties.toState = value; }

    get transition() { return this.properties.transition; }
    set transition(value) { this.properties.transition = value; }

    get transaction(): dotjem.routing.IViewTransaction { return this.properties.transaction; }
    set transaction(value: dotjem.routing.IViewTransaction) { this.properties.transaction = value; }

    constructor(_$state, current?) {
        this.properties = {};
        this._$state = _$state;
        this.to = current;
    }

    public next() {
        if (!this.ended)
            this.abort();

        var next = new Context(this.$state);
        next.previous = this;
        next.from = this.to;

        //Note: to allow garbage collection.
        this.previous = null;

        return next;
    }

    public execute(visitor: ICommand) {
        if (this.ended)
            return this;

        visitor(this);

        if (this.aborted) {
            return this.previous;
        }
        return this;
    }

    public get ended() {
        return this.aborted || this.completed;
    }


    public complete() {
        this.completed = true;
        return this;
    }

    public abort() {
        this.aborted = true;

        if (this.transaction && !this.transaction.completed)
            this.transaction.cancel();

        return this;
    }

    private _prep: any = {};

    // change.state.fullname, name, view.template, view.controller, sticky, 'setOrUpdate'
    public prepUpdate(state: string, name, template, controller, sticky) {
        var prep = (this._prep[state] = this._prep[state] || {});
        prep[name] = this.transaction.prepUpdate(name, template, controller, sticky);
    }

    public prepCreate(state: string, name, template, controller) {
        var prep = (this._prep[state] = this._prep[state] || {});
        prep[name] = this.transaction.prepCreate(name, template, controller);
    }

    public completePrep(state: string, locals?: any) {
        forEach(this._prep[state], function (value, key) {
            value(locals);
        });
    }
}