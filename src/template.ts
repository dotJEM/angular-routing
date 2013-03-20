/// <reference path="../lib/angular/angular-1.0.d.ts" />

'use strict';

function $TemplateProvider() {

    this.$get = [<any>'$http', '$q', '$injector', '$templateCache',
    function ($http: ng.IHttpService, $q: ng.IQService, $injector: ng.auto.IInjectorService, $templateCache: ng.ITemplateCacheService) {

        function getFromUrl(url): ng.IPromise {
            return $http.get(url, { cache: $templateCache }).then(response => { return response.data; });
        }

        function getFromFunction(fn): ng.IPromise {
            return $q.when($injector.invoke(fn));
        }

        function getFromObject(obj): ng.IPromise {
            if (angular.isDefined(obj.url))
                return getFromUrl(obj.url);

            if (angular.isDefined(obj.fn))
                return getFromFunction(obj.fn);

            if (angular.isDefined(obj.html))
                return $q.when(obj.html);

            throw new Error("Object must define url, fn or html.");
        }

        this.get = function (template): ng.IPromise {
            if (angular.isString(template))
                return getFromUrl(template);

            if (angular.isFunction(template))
                return getFromFunction(template);

            if (angular.isObject(template))
                return getFromObject(template);

            throw new Error("Template must be either an url as string, function or a object defining either url, fn or html.");
        }

        return this;
    }];
}
angular.module('ui.routing').provider('$template', $TemplateProvider);