/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';

function $ViewProvider() {

    this.$get = [<any>'$rootScope', '$q', '$template',
    function ($rootScope: ng.IRootScopeService, $q: ng.IQService, $template: ui.routing.ITemplateService) {

        var views = {},
            transaction = null;

        function ensureName(name: string) {
            if (name === 'undefined') {
                throw new Error('Must define a view name.');
            }
        };

        function ensureExists(name: string) {
            if (!(name in views)) {
                throw new Error('View with name "' + name + '" was not present.');
            }
        };

        function raiseUpdated(name: string) {
            $rootScope.$broadcast('$viewUpdate', name);
        }

        function containsView(map: any, name: string) {
            return (name in map) && map[name] !== null;
        }

        this.clear = function (name?: string) {
            if (angular.isUndefined(name)) {
                angular.forEach(views, (val, key) => {
                    this.clear(key);
                });
            } else {
                if (transaction) {
                    transaction.records[name] = (() => {
                        this.clear(name);
                    });
                    return;
                }
                delete views[name];

                raiseUpdated(name);
            }
        };

        this.setOrUpdate = function (name: string, template: any, controller: any) {
            ensureName(name);

            if (transaction) {
                transaction.records[name] = (() => {
                    this.setOrUpdate(name, template, controller);
                });
                return;
            }

            if (containsView(views, name)) {
                //TODO: Should we make this latebound so only views actually used gets loaded and rendered? 
                views[name].template = $template.get(template);
                views[name].controller = controller;
                views[name].version++;
            } else {
                views[name] = {
                    //TODO: Should we make this latebound so only views actually used gets loaded and rendered? 
                    template: $template.get(template),
                    controller: controller,
                    version: 0
                };
            }
            raiseUpdated(name);
        };

        this.setIfAbsent = function (name: string, template: any, controller: any) {
            ensureName(name);

            if (transaction) {
                if (!containsView(transaction.records, name)) {
                    transaction.records[name] = (() => {
                        this.setIfAbsent(name, template, controller);
                    });
                }
                return;
            }

            if (!containsView(views, name)) {
                views[name] = {
                    //TODO: Should we make this latebound so only views actually used gets loaded and rendered? 
                    template: $template.get(template),
                    controller: controller,
                    version: 0
                };
                raiseUpdated(name);
            }
        }

        this.get = function (name: string) {
            //TODO: return copies instead of actuals...
            if (angular.isUndefined(name))
                return views;

            // Ensure checks if the view was defined at any point, not if it is still defined.
            // if it was defined but cleared, then null is returned which can be used to clear the view if desired.
            return views[name];
        };

        this.beginUpdate = function () {
            if (transaction)
                throw new Error("Can't start multiple transactions");

            var trx = transaction = {
                records: {}
            };
            return {
                commit: function () {
                    transaction = null;
                    angular.forEach(trx.records, (fn) => { fn(); })
                },
                cancel: function () {
                    transaction = null;
                }
            };
        }

        return this;
    }];
}
angular.module('ui.routing').provider('$view', $ViewProvider);

