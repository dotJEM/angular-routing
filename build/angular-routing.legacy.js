/**
 * @license dotJEM Angular Routing
 * (c) 2012-2013 dotJEM (Jens Melgaard)
 * License: MIT
 *
 * @module angular-routing
 */
(function(window, document, undefined) {
/// <reference path="../refs.d.ts" />
'use strict';
angular.module('dotjem.routing.legacy', ['dotjem.routing']).config([
    '$routeProvider', function ($routeProvider) {
        $routeProvider.decorate('templateDecorator', [
            '$q', '$injector', '$templateCache', '$http',
            function ($q, $injector, $templateCache, $http) {
                var next = this, values = [], keys = [], template;

                angular.forEach(next.resolve || {}, function (value, key) {
                    keys.push(key);
                    values.push(angular.isString(value) ? $injector.get(value) : $injector.invoke(value));
                });

                if (angular.isDefined(template = next.template)) {
                    if (angular.isFunction(template)) {
                        template = template(next.params);
                    }
                } else if (angular.isDefined(template = next.templateUrl)) {
                    if (angular.isFunction(template)) {
                        template = template(next.params);
                    }
                    if (angular.isDefined(template)) {
                        next.loadedTemplateUrl = template;
                        template = $http.get(template, { cache: $templateCache }).then(function (response) {
                            return response.data;
                        });
                    }
                }

                if (angular.isDefined(template)) {
                    keys.push('$template');
                    values.push(template);
                }

                return $q.all(values).then(function (values) {
                    var locals = {};
                    angular.forEach(values, function (value, index) {
                        locals[keys[index]] = value;
                    });
                    return locals;
                }).then(function (locals) {
                    next.locals = locals;
                });
            }]);
    }]);

})(window, document);