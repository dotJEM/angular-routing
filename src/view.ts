/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

function $ViewProvider() {
    'use strict';

    /**
     * @ngdoc object
     * @name dotjem.routing.$view
     *
     * @description
     * 
     */
    this.$get = [<any>'$rootScope', '$q', '$template',
    function ($rootScope: ng.IRootScopeService, $q: ng.IQService, $template: dotjem.routing.ITemplateService) {

        var views = {},
            transaction = null;

        function ensureName(name: string) {
            if (name === 'undefined') {
                throw new Error('Must define a view name.');
            }
        };

        function raiseUpdated(name: string) {
            $rootScope.$broadcast('$viewUpdate', name);
        }

        function raiseRefresh(name: string, data?: any) {
            $rootScope.$broadcast('$viewRefresh', name, data);
        }

        function containsView(map: any, name: string) {
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
        this.clear = function (name?: string) {
            if (isUndefined(name)) {
                forEach(views, (val, key) => {
                    this.clear(key);
                });
            } else {
                if (transaction) {
                    transaction.records[name] = {
                        act: 'clear',
                        fn: () => {
                            this.clear(name);
                        }
                    };
                    return;
                }
                delete views[name];

                raiseUpdated(name);
            }
        };
        function isArgs(args) {
            return isObject(args)
                && (isDefined(args.template)
                    || isDefined(args.controller)
                    || isDefined(args.locals)
                    || isDefined(args.sticky));
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
         * 
         */

        /**
         * @ngdoc method
         * @name dotjem.$view#setOrUpdate
         * @methodOf dotjem.routing.$view
         *
         * @param {string} name Name
         * @param {object} template Template
         * @param {function=} controller Controller
         * @param {object=} locals Locals
         * @param {string=} sticky Sticky flag
         *
         * @description
         * 
         */
        this.setOrUpdate = function (name: string, templateOrArgs?: any, controller?: any, locals?: any, sticky?: string) {
            var template = templateOrArgs;
            if (isArgs(templateOrArgs)) {
                template = templateOrArgs.template;
                controller = templateOrArgs.controller;
                locals = templateOrArgs.locals;
                sticky = templateOrArgs.sticky;
            }

            ensureName(name);

            if (transaction) {
                transaction.records[name] = {
                    act: 'setOrUpdate',
                    fn: () => {
                        this.setOrUpdate(name, template, controller, locals, sticky);
                    }
                };
                return;
            }

            if (!containsView(views, name)) {
                views[name] = { version: -1 };
            }
            
            //TODO: Should we make this latebound so only views actually used gets loaded and rendered? 
            views[name].template = $template.get(template);
            views[name].controller = controller;
            views[name].locals = locals;

            
            if (isDefined(sticky) && isString(sticky) && views[name].sticky === sticky) {
                raiseRefresh(name, { sticky: true });
            } else {
                views[name].version++;
                views[name].sticky = sticky;

                raiseUpdated(name);
            }
        };


        /**
         * @ngdoc method
         * @name dotjem.$view#setIfAbsent
         * @methodOf dotjem.routing.$view
         *
         * @param {string} name Name
         * @param {object} args Arguments
         *
         * @description
         * 
         */

        /**
         * @ngdoc method
         * @name dotjem.$view#setIfAbsent
         * @methodOf dotjem.routing.$view
         *
         * @param {string} name Name
         * @param {object} template Template
         * @param {function=} controller Controller
         * @param {object=} locals Locals
         *
         * @description
         * 
         */
        this.setIfAbsent = function (name: string, templateOrArgs?: any, controller?: any, locals?: any) {
            var template = templateOrArgs;
            if (isArgs(templateOrArgs)) {
                template = templateOrArgs.template;
                controller = templateOrArgs.controller;
                locals = templateOrArgs.locals;
            }

            ensureName(name);

            if (transaction) {
                if (!containsView(transaction.records, name) || transaction.records[name].act === 'clear') {
                    transaction.records[name] = {
                        act: 'setIfAbsent',
                        fn: () => {
                            this.setIfAbsent(name, template, controller, locals);
                        }
                    };
                }
                return;
            }

            if (!containsView(views, name)) {
                views[name] = {
                    //TODO: Should we make this latebound so only views actually used gets loaded and rendered? 
                    template: $template.get(template),
                    controller: controller,
                    locals: locals,
                    version: 0
                };
                raiseUpdated(name);
            }
        }

        /**
         * @ngdoc method
         * @name dotjem.$view#get
         * @methodOf dotjem.routing.$view
         *
         * @param {string} name Name
         *
         * @description
         * 
         */
        this.get = function (name: string) {
            //TODO: return copies instead of actuals...
            if (isUndefined(name))
                return views;

            // Ensure checks if the view was defined at any point, not if it is still defined.
            // if it was defined but cleared, then null is returned which can be used to clear the view if desired.
            return views[name];
        };

        /**
         * @ngdoc method
         * @name dotjem.$view#refresh
         * @methodOf dotjem.routing.$view
         *
         * @param {string=} name Name
         * @param {object=} data Data
         *
         * @description
         * 
         */
        this.refresh = function (name?: string, data?: any) {
            if (isUndefined(name)) {
                forEach(views, (val, key) => {
                    this.clear(key);
                });
            } else if (transaction) {
                transaction.records[name] = {
                    act: 'refresh',
                    fn: () => {
                        this.refresh(name, data);
                    }
                };
                return;
            } else {
                raiseRefresh(name, data);
            }
        }

        /**
         * @ngdoc method
         * @name dotjem.$view#beginUpdate
         * @methodOf dotjem.routing.$view
         *
         * @param {string} name Name
         *
         * @description
         * 
         */
        this.beginUpdate = function () {
            if (transaction)
                throw new Error("Can't start multiple transactions");

            var trx = transaction = {
                records: {}
            };
            return {
                commit: function () {
                    transaction = null;
                    forEach(trx.records, (rec) => { rec.fn(); })

                },
                cancel: function () {
                    transaction = null;
                }
            };
        }

        return this;
    }];
}
angular.module('dotjem.routing').provider('$view', $ViewProvider);

