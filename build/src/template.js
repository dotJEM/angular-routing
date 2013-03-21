'use strict';
function $TemplateProvider() {
    this.$get = [
        '$http', 
        '$q', 
        '$injector', 
        '$templateCache', 
        function ($http, $q, $injector, $templateCache) {
            function getFromUrl(url) {
                return $http.get(url, {
                    cache: $templateCache
                }).then(function (response) {
                    return response.data;
                });
            }
            function getFromFunction(fn) {
                return $q.when($injector.invoke(fn));
            }
            function getFromObject(obj) {
                if(angular.isDefined(obj.url)) {
                    return getFromUrl(obj.url);
                }
                if(angular.isDefined(obj.fn)) {
                    return getFromFunction(obj.fn);
                }
                if(angular.isDefined(obj.html)) {
                    return $q.when(obj.html);
                }
                throw new Error("Object must define url, fn or html.");
            }
            this.get = function (template) {
                if(angular.isString(template)) {
                    return getFromUrl(template);
                }
                if(angular.isFunction(template)) {
                    return getFromFunction(template);
                }
                if(angular.isObject(template)) {
                    return getFromObject(template);
                }
                throw new Error("Template must be either an url as string, function or a object defining either url, fn or html.");
            };
            return this;
        }    ];
}
angular.module('ui.routing').provider('$template', $TemplateProvider);
