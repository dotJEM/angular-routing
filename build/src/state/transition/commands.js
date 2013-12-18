//TODO: Refactor into:
//      so we can put into seperate files.
//module cmd {
//    export function initialize() { }
//}
var cmd = {
    initializeContext: function (next, params, browser) {
        return function (context) {
            //context.to = browser.resolve(context.from, next, false);
            var to = browser.resolve(context.from, next, false);
            //var to = browser.lookup(next);
            context.to = to;
            context.params = params;
            context.toState = extend({
            }, to.self, {
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
                locals: context.locals,
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
                //TODO: This is very similar to what we do in buildStateArray -> extractParams,
                //      maybe we can refactor those together
                                var paramsObj = {
                }, allFrom = context.$state.params.$all;
                forEach(route.params, function (param, name) {
                    if(name in allFrom) {
                        paramsObj[name] = allFrom[name];
                    }
                });
                var mergedParams = extend(paramsObj, context.params.$all);
                //TODO: One problem here is that if you passed in "optional" parameters to goto, and the to-state has
                //      a route, we actually end up loosing those
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
            context.emit.before(context.transition, context.transaction);
            if(context.transition.canceled) {
                //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                //      That is if this was even triggered by an URL change in the first place.
                //$rootScope.$broadcast('$stateChangeAborted', toState, fromState);
                context.abort();
            }
        };
    },
    between: function ($rootScope) {
        return function (context) {
            context.emit.between(context.transition, context.transaction);
            if(context.transition.canceled) {
                //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                //      That is if this was even triggered by an URL change in the first place.
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
                context.emit.after(context.transition, context.transaction);
                $scroll(scrollTo);
            }
        };
    },
    beginTransaction: function ($view, $injector) {
        return function (context) {
            context.transaction = $view.beginUpdate();
            context.transaction.clear();
            var updating = false;
            forEach(context.changed.array, function (change) {
                updating = updating || change.isChanged;
                forEach(change.state.views, function (view, name) {
                    var fn;
                    if(isDefined(view.sticky)) {
                        if(fn = injectFn(view.sticky)) {
                            view.sticky = fn($injector, {
                                $to: context.toState,
                                $from: context.$state.current
                            });
                        } else if(!isString(view.sticky)) {
                            view.sticky = change.state.fullname;
                        }
                    }
                    if(updating || view.force || isDefined(view.sticky)) {
                        context.prepUpdate(change.state.fullname, name, view);
                    } else {
                        context.prepCreate(change.state.fullname, name, view);
                    }
                });
            });
        };
    }
};
