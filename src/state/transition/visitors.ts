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

    get transaction() { return this.properties.transaction; }
    set transaction(value) { this.properties.transaction = value; }

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
}

interface ICommand {
    (context: Context): void;
}

var cmd = {
    initializeContext: function (next, params): ICommand {
        return function (context: Context) {
            context.to = next;
            context.params = params;
            context.toState = extend({}, next.self, { $params: params });
        }
    },

    createEmitter: function ($transition): ICommand {
        return function (context: Context) {
            context.emit = $transition.find(context.$state.current, context.toState)
        }
    },

    buildChanges: function (force): ICommand {
        return function (context: Context) {
            context.changed = new StateComparer()
               .compare(
                    context.from,
                    context.to,
                    context.$state.params,
                    context.params,
                    force);
        }
    },

    createTransition: function (gotofn): ICommand {
        return function (context: Context) {
            var trx = {
                canceled: false,
                cancel: function () {
                    trx.canceled = true;
                },
                goto: function (state, params?) {
                    trx.canceled = true;
                    gotofn({ state: state, params: { all: params }, updateroute: true });
                }
            }
            context.transition = trx;
        }
    },

    raiseUpdate: function ($rootScope): ICommand {
        return function (context: Context) {
            var changed = context.changed;
            var $state = context.$state;
            
            if (!changed.stateChanges) {
                if (changed.paramChanges) {
                    $state.params = context.params;
                    $state.current.$params = context.params;
                    $rootScope.$broadcast('$stateUpdate', $state.current);
                }
                context.abort();
            }
        }
    },

    updateRoute: function ($route, update): ICommand {
        return function (context: Context) {
            var route = context.to.route;

            if (update && route) {
                //TODO: This is very similar to what we do in buildStateArray -> extractParams,
                //      maybe we can refactor those together
                var paramsObj = {},
                    allFrom = context.$state.params.$all;

                forEach(route.params, function (param, name) {
                    if (name in allFrom)
                        paramsObj[name] = allFrom[name];
                });

                var mergedParams = extend(paramsObj, context.params.$all)
                //TODO: One problem here is that if you passed in "optional" parameters to goto, and the to-state has
                //      a route, we actually end up loosing those
                $route.change(extend({}, route, { params: mergedParams }));

                context.abort();
            }
        }
    },

    before: function (): ICommand {
        return function (context: Context) {
            context.emit.before(context.transition);
            if (context.transition.canceled) {
                //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                //      That is if this was even triggered by an URL change in the first place.
                //$rootScope.$broadcast('$stateChangeAborted', toState, fromState);
                context.abort();
            }
        }
    },

    between: function ($rootScope): ICommand {
        return function (context: Context) {
            context.emit.between(context.transition);
            if (context.transition.canceled) {
                //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                //      That is if this was even triggered by an URL change in the first place.
                $rootScope.$broadcast('$stateChangeAborted', context.toState, context.$state.current);
                context.abort();
            }
        }
    },

    after: function ($scroll, scrollTo): ICommand {
        return function (context: Context) {
            if (!context.transition.canceled) {
                context.transition.cancel = function () {
                    throw Error("Can't cancel transition in after handler");
                };
                context.emit.after(context.transition);

                $scroll(scrollTo);
            }
        }
    },

    beginTransaction: function ($view): ICommand {
        return function (context: Context) {
            context.transaction = $view.beginUpdate();
            context.transaction.clear();
        }
    }
};