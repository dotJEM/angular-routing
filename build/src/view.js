/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
/**
* @ngdoc object
* @name dotjem.routing.$viewProvider
*
* @description
*
*/
function $ViewProvider() {
    'use strict';
    /**
    * @ngdoc object
    * @name dotjem.routing.$view
    *
    * @description
    *
    */
    this.$get = [
        '$rootScope', 
        '$q', 
        '$template', 
        function ($rootScope, $q, $template) {
            var views = {
            }, transaction = null;
            function ensureName(name) {
                if(name === 'undefined') {
                    throw new Error('Must define a view name.');
                }
            }
            ;
            function raiseUpdated(name) {
                $rootScope.$broadcast('$viewUpdate', name);
            }
            function raiseRefresh(name, data) {
                $rootScope.$broadcast('$viewRefresh', name, data);
            }
            function containsView(map, name) {
                return (name in map) && map[name] !== null;
            }
            /**
            * @ngdoc method
            * @name dotjem.$view#clear
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view to clear (optional)
            *
            * @description
            * Clears a view, or all views if no name is provided.
            */
            this.clear = function (name) {
                var _this = this;
                if(isUndefined(name)) {
                    forEach(views, function (val, key) {
                        _this.clear(key);
                    });
                } else {
                    if(transaction) {
                        transaction.records[name] = {
                            act: 'clear',
                            fn: function () {
                                _this.clear(name);
                            }
                        };
                        return;
                    }
                    delete views[name];
                    raiseUpdated(name);
                }
            };
            function isArgs(args) {
                return isObject(args) && (isDefined(args.template) || isDefined(args.controller) || isDefined(args.locals) || isDefined(args.sticky));
            }
            /**
            * @ngdoc method
            * @name dotjem.$view#setOrUpdate
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            * @param {object} args Arguments
            *
            * @description
            * Clears a view, or all views if no name is provided.
            */
            /**
            * @ngdoc method
            * @name dotjem.$view#setOrUpdate
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            * @param {object} template Template (optional)
            * @param {function=} controller Controller (optional)
            * @param {object=} locals Locals (optional)
            * @param {string=} sticky Sticky flag (optional)
            *
            * @description
            * Clears a view, or all views if no name is provided.
            */
            this.setOrUpdate = function (name, templateOrArgs, controller, locals, sticky) {
                var _this = this;
                var template = templateOrArgs;
                if(isArgs(templateOrArgs)) {
                    template = templateOrArgs.template;
                    controller = templateOrArgs.controller;
                    locals = templateOrArgs.locals;
                    sticky = templateOrArgs.sticky;
                }
                ensureName(name);
                if(transaction) {
                    transaction.records[name] = {
                        act: 'setOrUpdate',
                        fn: function () {
                            _this.setOrUpdate(name, template, controller, locals, sticky);
                        }
                    };
                    return;
                }
                if(!containsView(views, name)) {
                    views[name] = {
                        version: -1
                    };
                }
                //TODO: Should we make this latebound so only views actually used gets loaded and rendered?
                views[name].template = $template.get(template);
                views[name].controller = controller;
                views[name].locals = locals;
                if(isDefined(sticky) && isString(sticky) && views[name].sticky === sticky) {
                    raiseRefresh(name, {
                        sticky: true
                    });
                } else {
                    views[name].version++;
                    views[name].sticky = sticky;
                    raiseUpdated(name);
                }
            };
            //this.setIfAbsent = function (name: string, args: { template?: any; controller?: any; locals?: any; })
            this.setIfAbsent = function (name, templateOrArgs, controller, locals) {
                var _this = this;
                var template = templateOrArgs;
                if(isArgs(templateOrArgs)) {
                    template = templateOrArgs.template;
                    controller = templateOrArgs.controller;
                    locals = templateOrArgs.locals;
                }
                ensureName(name);
                if(transaction) {
                    if(!containsView(transaction.records, name) || transaction.records[name].act === 'clear') {
                        transaction.records[name] = {
                            act: 'setIfAbsent',
                            fn: function () {
                                _this.setIfAbsent(name, template, controller, locals);
                            }
                        };
                    }
                    return;
                }
                if(!containsView(views, name)) {
                    views[name] = {
                        template: //TODO: Should we make this latebound so only views actually used gets loaded and rendered?
                        $template.get(template),
                        controller: controller,
                        locals: locals,
                        version: 0
                    };
                    raiseUpdated(name);
                }
            };
            this.get = function (name) {
                //TODO: return copies instead of actuals...
                if(isUndefined(name)) {
                    return views;
                }
                // Ensure checks if the view was defined at any point, not if it is still defined.
                // if it was defined but cleared, then null is returned which can be used to clear the view if desired.
                return views[name];
            };
            this.refresh = function (name, data) {
                var _this = this;
                if(isUndefined(name)) {
                    forEach(views, function (val, key) {
                        _this.clear(key);
                    });
                } else if(transaction) {
                    transaction.records[name] = {
                        act: 'refresh',
                        fn: function () {
                            _this.refresh(name, data);
                        }
                    };
                    return;
                } else {
                    raiseRefresh(name, data);
                }
            };
            this.beginUpdate = function () {
                if(transaction) {
                    throw new Error("Can't start multiple transactions");
                }
                var trx = transaction = {
                    records: {
                    }
                };
                return {
                    commit: function () {
                        transaction = null;
                        forEach(trx.records, function (rec) {
                            rec.fn();
                        });
                    },
                    cancel: function () {
                        transaction = null;
                    }
                };
            };
            return this;
        }    ];
}
angular.module('dotjem.routing').provider('$view', $ViewProvider);
