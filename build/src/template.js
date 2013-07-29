/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
function $TemplateProvider() {
    var urlmatcher = new RegExp('^(((http|https|ftp)://([\\w-\\d]+\\.)+[\\w-\\d]+){0,1}(/?[\\w~,;\\-\\./?%&+#=]*))', 'i');
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
                if(isDefined(obj.url)) {
                    return getFromUrl(obj.url);
                }
                if(isDefined(obj.fn)) {
                    return getFromFunction(obj.fn);
                }
                if(isDefined(obj.html)) {
                    return $q.when(obj.html);
                }
                throw new Error("Object must define url, fn or html.");
            }
            this.get = function (template) {
                if(isString(template)) {
                    if(urlmatcher.test(template)) {
                        return getFromUrl(template);
                    } else {
                        return $q.when(template);
                    }
                }
                if(isFunction(template) || isArray(template)) {
                    return getFromFunction(template);
                }
                if(isObject(template)) {
                    return getFromObject(template);
                }
                throw new Error("Template must be either an url as string, function or a object defining either url, fn or html.");
            };
            return this;
        }    ];
}
angular.module('dotjem.routing').provider('$template', $TemplateProvider);
