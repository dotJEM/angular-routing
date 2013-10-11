var cmd = {
    initializeContext: function (next, params, browser) {
        return function (context) {
            var to = browser.resolve(context.from, next, false);
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
    beginTransaction: function ($view, $injector) {
        return function (context) {
            context.transaction = $view.beginUpdate();
            context.transaction.clear();
            var updating = false;
            forEach(context.changed.array, function (change) {
                updating = updating || change.isChanged;
                forEach(change.state.views, function (view, name) {
                    var sticky, fn;
                    if(sticky = view.sticky) {
                        if(fn = injectFn(sticky)) {
                            sticky = fn($injector, {
                                $to: context.toState,
                                $from: context.$state.current
                            });
                        } else if(!isString(sticky)) {
                            sticky = change.state.fullname;
                        }
                    }
                    if(updating || view.force || isDefined(sticky)) {
                        context.prepUpdate(change.state.fullname, name, view.template, view.controller, sticky);
                    } else {
                        context.prepCreate(change.state.fullname, name, view.template, view.controller);
                    }
                });
            });
        };
    }
};
