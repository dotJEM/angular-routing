/// <reference path="refs.d.ts" />

function $PipelineProvider() {
    var stages = [],
        stagesMap = {},
        self = this;

    function indexOf(name) {
        for (var i = 0, l = stages.length; i < l; i++) {
            if (stages[i].name === name) {
                return i;
            }
        }
        return -1;
    }

    function sort() {
        stages.sort((left, right) => { return left.rank - right.rank; });
        return self;
    }

    function renumber() {
        forEach(stages, (stage, index) => { stage.rank = index; });
        return self;
    }

    function map(name, stage) {
        var exists = stagesMap.hasOwnProperty(name);
        stagesMap[name] = stage;
        return exists;
    }

    function remove(name) {
        stages.splice(indexOf(name), 1);
    }

    function wrap(name, stage) {
        return { name: name, stage: stage };
    }

    this.append = function (name, stage) {
        stage = wrap(name, stage);
        if (map(name, stage)) {
            remove(name);
        }
        stages.push(stage);
        return renumber();
    };

    this.prepend = function (name, stage) {
        stage = wrap(name, stage);
        if (map(name, stage)) {
            remove(name);
        }
        stages.unshift(stage);
        return renumber();
    };

    this.insert = function (name, stage) {
        stage = wrap(name, stage);
        return {
            after: function (other) {
                if (map(name, stage)) {
                    remove(name);
                }
                stages.splice(indexOf(other) + 1, 0, stage);
                return renumber();
            },
            before: function (other) {
                if (map(name, stage)) {
                    remove(name);
                }
                stages.splice(indexOf(other), 0, stage);
                return renumber();
            }
        };
    };

    this.$get = [<any>'$q', '$inject',
        function ($q: ng.IQService, $inject: dotjem.routing.IInjectService) {
            var sv: any = {};

            sv.all = function () {
                return stages.map(stg => $inject.create(stg.stage));
            };

            return sv;
        }];
}
//TODO: Rename to transitionPipelineProvider?
angular.module('dotjem.routing').provider('$pipeline', $PipelineProvider)
//TODO: Configurations should be moved to separate files?
    .config(['$pipelineProvider', function (pipeline) {

        pipeline.append('step0', ['$changes', '$context', '$args', function ($changes, $context, $args) {
            $context.toState = extend({}, $changes.to.self, { $params: $args.params });
        }]);

        pipeline.append('step1', ['$changes', '$context', '$stateTransition', '$state', function ($changes, $context, $transition, $state) {

            $context.emit = $transition.find($state.current, $context.toState);
        }]);

        pipeline.append('step2', ['$changes', '$context', function ($changes, $context) {
            var trx: any = {};
            $context.transition = trx;

            trx.canceled = false;
            trx.cancel = function () {
                trx.canceled = true;
            };

            trx.goto = function (state, params) {
                trx.cancel();
                $context.gotofn({ state: state, params: { $all: params }, updateroute: true });
            };

        }]);

        pipeline.append('step3', ['$changes', '$context', '$args', '$route', '$state', '$q', function ($changes, $context, $args, $route, $state, $q) {
            var route = $changes.to.route;

            if ($args.updateroute && route) {
                //TODO: This is very similar to what we do in buildStateArray -> extractParams,
                //      maybe we can refactor those together
                var paramsObj = {},
                    from = $state.params;

                forEach(route.params, function (param, name) {
                    if (name in from) {
                        paramsObj[name] = from[name];
                    }
                });

                var mergedParams = extend(paramsObj, $args.params.$all);
                //TODO: One problem here is that if you passed in "optional" parameters to goto, and the to-state has
                //      a route, we actually end up loosing those
                $route.change(extend({}, route, { params: mergedParams }));
                return $q.reject('Rejected state transition and changed route.');
            }
        }]);

        pipeline.append('step4', ['$changes', '$context', '$state', '$q', '$rootScope', function ($changes, $context, $state, $q, $rootScope) {
            if ($changes.changed.length < 1) {
                if ($changes.paramChanges) {
                    $state.params = $context.params;
                    $state.current.$params = $context.params;
                    $rootScope.$broadcast(EVENTS.STATE_UPDATE, $state.current);
                }
                return $q.reject('Rejected state transition and raised ' + EVENTS.STATE_UPDATE+'.');
            }
        }]);

        pipeline.append('step5', ['$changes', '$context', '$view', '$inject', '$state', function ($changes, $context, $view, $inject, $state) {
            $context.prep = {};

            var trx = $context.transaction = $view.beginUpdate();
            trx.clear();

            var all = $changes.unchanged.concat($changes.activated);
            forEach(all, function (act) {
                $context.prep[act.name] = {};
                forEach(act.state.views, function (view, name) {
                    var ifn: dotjem.routing.IInvoker;
                    if (isDefined(view.sticky)) {
                        if (ifn = $inject.create(view.sticky)) {
                            view.sticky = ifn({ $to: $context.toState, $from: $state.current });
                        } else if (!isString(view.sticky)) {
                            view.sticky = act.name;
                        }
                    }

                    if (act.changed || view.force || isDefined(view.sticky) || ($changes.reloadLeaf && act.isLeaf)) {
                        $context.prep[act.name][name] = trx.prepUpdate(name, view);
                    } else {
                        $context.prep[act.name][name] = trx.prepCreate(name, view);
                    }
                });
            });
        }]);

        pipeline.append('step6', ['$context', '$q', function ($context, $q) {
            return $context.emit.before($context.transition, $context.transaction)
                .then(function () {
                    if ($context.transition.canceled) {
                        //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                        //      That is if this was even triggered by an URL change in the first place.
                        //$rootScope.$broadcast('$stateChangeAborted', toState, fromState);
                        return $q.reject('Rejected state transition as canceled by user in before handler.');
                    }
                });
        }]);

        pipeline.append('step7', ['$changes', '$context', '$rootScope', '$state', '$q', function ($changes, $context, $rootScope, $state, $q) {
            if ($rootScope.$broadcast(EVENTS.STATE_CHANGE_START, $context.toState, $state.current).defaultPrevented) {
                return $q.reject('Rejected state transition as canceled by user in ' + EVENTS.STATE_CHANGE_START+'.');
            }
        }]);

        pipeline.append('step8', ['$changes', '$context', '$view', '$inject', '$state', '$q', '$resolve', function ($changes, $context, $view, $inject, $state, $q, $resolve) {
            var all = $changes.unchanged.concat($changes.activated),
                promise = $q.when(all),
                useUpdate,
                allLocals = {};
            forEach(all, function (change) {
                promise = promise.then(function () {
                    if (useUpdate = useUpdate || change.changed) {
                        $resolve.clear(change.state.resolve);
                    }
                    return $resolve.all(change.state.resolve, allLocals, { $to: $context.toState, $from: $state.current });
                }).then(function (locals) {
                    forEach($context.prep[change.state.fullname], function (value, key) {
                        value(allLocals = extend({}, allLocals, locals));
                    });
                    $context.scrollTo = change.state.scrollTo;
                });
            });
            return promise;
        }]);

        pipeline.append('step9', ['$context', '$rootScope', '$q', '$state', function ($context, $rootScope, $q, $state) {
            return $context.emit.between($context.transition, $context.transaction)
                .then(function () {
                    if ($context.transition.canceled) {
                        //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                        //      That is if this was even triggered by an URL change in the first place.
                        $rootScope.$broadcast('$stateChangeAborted', $context.toState, $state.current);
                        return $q.reject('Rejected state transition as canceled by user in between handler.');
                    }
                });
        }]);

        pipeline.append('step10', ['$changes', '$context', '$state', '$rootScope', '$args', function ($changes, $context, $state, $rootScope, $args) {
            var fromState = $state.current;
            $state.params = $args.params;
            $state.current = $context.toState;

            $context.transaction.commit();
            $rootScope.$broadcast(EVENTS.STATE_CHANGE_SUCCESS, $context.toState, fromState);
        }]);

        pipeline.append('step11', ['$changes', '$context', '$scroll', function ($changes, $context, $scroll) {
            if (!$context.transition.canceled) {
                $context.transition.cancel = function () {
                    throw Error("Can't cancel transition in after handler");
                };
                return $context.emit.after($context.transition, $context.transaction)
                    .then(function () {
                        $scroll($context.scrollTo);
                    });
            }
        }]);

    }]);