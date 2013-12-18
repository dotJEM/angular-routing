/// <reference path="refs.d.ts" />

var $ResolveProvider = [function () {
    'use strict';

    /**
     * @ngdoc object
     * @name dotjem.routing.$resolve
     *
     * @requires $q
     * @requires $injector
     *
     * @description
     * The `$resolve` service is used to resolve values for states
     * 
     * 
     *
     */
    this.$get = [<any> '$q', '$injector',
    function ($q: ng.IQService, $injector: ng.auto.IInjectorService) {
        var $service: any = {};

        var cache = {};

        /**
         * @ngdoc method
         * @name dotjem.routing.$resolve#push
         * @methodOf dotjem.routing.$resolve
         *
         * @param {string} key A key for the value.
         * @param {Object} value The value.
         *
         * @description
         * Pushes a value into the resolver.
         */
        $service.push = function (key: string, value: any) {
            cache[key] = value;
        };

        /**
         * @ngdoc method
         * @name dotjem.routing.$resolve#clear
         * @methodOf dotjem.routing.$resolve
         *
         * @param {string} key A key for the value to remove from the resolvers cache.
         *
         * @description
         * Clears a value in the resolver.
         */

        /**
         * @ngdoc method
         * @name dotjem.routing.$resolve#clear
         * @methodOf dotjem.routing.$resolve
         *
         * @param {Array} keys An array of keys for the values to remove from the resolvers cache.
         *
         * @description
         * Clears a list of values in the resolver.
         */
        $service.clear = function (arg?: any) {
            if (isUndefined(arg)) {
                cache = {};
            }

            if (isString(arg)) {
                delete cache[arg];
            } else if (isObject(arg)) {
                //TODO: This part should not be the responsibility of the resolver?
                angular.forEach(arg, function (value, key) {
                    $service.clear(key);
                });
            } else if (isArray(arg)) {
                angular.forEach(arg, function (key) {
                    $service.clear(key);
                });
            }
        };

        $service.all = function (args: any, locals: any, scoped: any) {
            var values = [], keys = [], def = $q.defer();

            angular.forEach(args, function (value, key) {
                var ifn: IInjector;
                keys.push(key);
                try {
                    if (!(key in cache)) {
                        if (isString(value)) {
                            cache[key] = angular.isString(value);
                        } else if ((ifn = injectFn(value)) != null) {
                            cache[key] = ifn($injector, extend({}, locals, scoped));
                        }
                    }
                    values.push(cache[key]);
                } catch (e) {
                    def.reject("Could not resolve " + key +  ", error was: " + e);
                }
            });

            $q.all(values).then(function (values) {
                var locals = {};
                angular.forEach(values, function (value, index) {
                    locals[keys[index]] = value;
                });
                def.resolve(locals);
            }, function (error) { def.reject(error); });

            return def.promise;
        };

        return $service;
    }];
}];

angular.module('dotjem.routing').provider('$resolve', $ResolveProvider);