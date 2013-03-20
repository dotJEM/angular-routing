/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />

'use strict';

angular.module('ui.routing.legacy', ['ui.routing', 'ng'])
    .config([<any>'$routeProvider', ($routeProvider: ui.routing.IRouteProvider) => {
        $routeProvider.decorate('templateDecorator',
            [<any>'$q', '$injector', '$templateCache', '$http',
                 function ($q: ng.IQService, $injector: ng.auto.IInjectorService, $templateCache: ng.ITemplateCacheService, $http: ng.IHttpService) {
                     var next = this,
                         values = [],
                         keys = [],
                         template;

                     forEach(next.resolve || {}, function (value, key) {
                         keys.push(key);
                         values.push(isString(value) ? $injector.get(value) : $injector.invoke(value));
                     });

                     if (angular.isDefined(template = next.template)) {
                         if (angular.isFunction(template)) {
                             template = template(next.params);
                         }
                     } else if (isDefined(template = next.templateUrl)) {
                         if (isFunction(template)) {
                             template = template(next.params);
                         }
                         if (isDefined(template)) {
                             next.loadedTemplateUrl = template;
                             template = $http.get(template, { cache: $templateCache }).
                                 then(function (response) { return response.data; });
                         }
                     }

                     if (isDefined(template)) {
                         keys.push('$template');
                         values.push(template);
                     }

                     return $q.all(values)
                         .then(function (values) {
                             var locals = {};
                             forEach(values, function (value, index) {
                                 locals[keys[index]] = value;
                             });
                             return locals;
                         })
                         .then(function (locals) {
                             next.locals = locals;
                         });
                 }]);
    }]);