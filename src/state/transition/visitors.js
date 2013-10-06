var Context = (function () {
    function Context(_$state, current) {
        this.previous = {
        };
        this.properties = {
        };
        this.aborted = false;
        this.completed = false;
        this.properties = {
        };
        this._$state = _$state;
        this.to = current;
    }
    Object.defineProperty(Context.prototype, "$state", {
        get: function () {
            return this._$state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "to", {
        get: function () {
            return this.properties.to;
        },
        set: function (value) {
            this.properties.to = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "from", {
        get: function () {
            return this.properties.from;
        },
        set: function (value) {
            this.properties.from = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "params", {
        get: function () {
            return this.properties.params;
        },
        set: function (value) {
            this.properties.params = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "emit", {
        get: function () {
            return this.properties.emit;
        },
        set: function (value) {
            this.properties.emit = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "changed", {
        get: function () {
            return this.properties.changed;
        },
        set: function (value) {
            this.properties.changed = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "toState", {
        get: function () {
            return this.properties.toState;
        },
        set: function (value) {
            this.properties.toState = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "transition", {
        get: function () {
            return this.properties.transition;
        },
        set: function (value) {
            this.properties.transition = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "transaction", {
        get: function () {
            return this.properties.transaction;
        },
        set: function (value) {
            this.properties.transaction = value;
        },
        enumerable: true,
        configurable: true
    });
    Context.prototype.next = function () {
        if(!this.ended) {
            this.abort();
        }
        var next = new Context(this.$state);
        next.previous = this;
        next.from = this.to;
        this.previous = null;
        return next;
    };
    Context.prototype.execute = function (visitor) {
        if(this.ended) {
            return this;
        }
        visitor(this);
        if(this.aborted) {
            return this.previous;
        }
        return this;
    };
    Object.defineProperty(Context.prototype, "ended", {
        get: function () {
            return this.aborted || this.completed;
        },
        enumerable: true,
        configurable: true
    });
    Context.prototype.complete = function () {
        this.completed = true;
        return this;
    };
    Context.prototype.abort = function () {
        this.aborted = true;
        if(this.transaction && !this.transaction.completed) {
            this.transaction.cancel();
        }
        return this;
    };
    return Context;
})();
var cmd = {
    initializeContext: function (next, params) {
        return function (context) {
            context.to = next;
            context.params = params;
            context.toState = extend({
            }, next.self, {
                $params: params
            });
        };
    },
    createEmitter: function ($transition) {
        return function (context) {
            context.emit = $transition.find(context.$state.current, context.toState);
        };
    },
    buildChanges: function (force) {
        return function (context) {
            context.changed = new StateComparer().compare(context.from, context.to, context.$state.params, context.params, force);
        };
    },
    createTransition: function (gotofn) {
        return function (context) {
            var trx = {
                canceled: false,
                cancel: function () {
                    trx.canceled = true;
                },
                goto: function (state, params) {
                    trx.canceled = true;
                    gotofn({
                        state: state,
                        params: {
                            all: params
                        },
                        updateroute: true
                    });
                }
            };
            context.transition = trx;
        };
    },
    raiseUpdate: function ($rootScope) {
        return function (context) {
            var changed = context.changed;
            var $state = context.$state;
            if(!changed.stateChanges) {
                if(changed.paramChanges) {
                    $state.params = context.params;
                    $state.current.$params = context.params;
                    $rootScope.$broadcast('$stateUpdate', $state.current);
                }
                context.abort();
            }
        };
    },
    updateRoute: function ($route, update) {
        return function (context) {
            var route = context.to.route;
            if(update && route) {
                var paramsObj = {
                }, allFrom = context.$state.params.$all;
                forEach(route.params, function (param, name) {
                    if(name in allFrom) {
                        paramsObj[name] = allFrom[name];
                    }
                });
                var mergedParams = extend(paramsObj, context.params.$all);
                $route.change(extend({
                }, route, {
                    params: mergedParams
                }));
                context.abort();
            }
        };
    },
    before: function () {
        return function (context) {
            context.emit.before(context.transition);
            if(context.transition.canceled) {
                context.abort();
            }
        };
    },
    between: function ($rootScope) {
        return function (context) {
            context.emit.between(context.transition);
            if(context.transition.canceled) {
                $rootScope.$broadcast('$stateChangeAborted', context.toState, context.$state.current);
                context.abort();
            }
        };
    },
    after: function ($scroll, scrollTo) {
        return function (context) {
            if(!context.transition.canceled) {
                context.transition.cancel = function () {
                    throw Error("Can't cancel transition in after handler");
                };
                context.emit.after(context.transition);
                $scroll(scrollTo);
            }
        };
    },
    beginTransaction: function ($view) {
        return function (context) {
            context.transaction = $view.beginUpdate();
            context.transaction.clear();
        };
    }
};
