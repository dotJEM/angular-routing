/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
function $TemplateProvider() {
    'use strict';
    var urlmatcher = new RegExp('^(((http|https|ftp)://([\\w-\\d]+\\.)+[\\w-\\d]+){0,1}(/?[\\w~,;\\-\\./?%&+#=]*))', 'i');
    /**
    * @ngdoc object
    * @name dotjem.routing.$template
    *
    * @requires $http
    * @requires $q
    * @requires $injector
    * @requires $templateCache
    *
    * @description
    * The $template services is used to load templates, templates are cached using the '$templateCache'.
    * <br/>
    * **Note:** all templates are returned as promises.
    */
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
            /**
            * @ngdoc method
            * @name dotjem.routing.$template#get
            * @methodOf dotjem.routing.$template
            *
            * @param {string|Object|function} template Either a string reprecenting the actual template,
            * an url to it, a function returning it or an object specifying a location of the template.
            *
            * If a template object i used, one of the following properties must be used:
            *
            * - `url` `{string}`: An url location of the template.
            * - `fn` `{function}`: A function that returns the template.
            * - `html` `{string}`: The actual template as raw html.
            *
            * <br/>
            * **Note:** if a template object defines more than one of those, the first one the `$template` service encounters will be used
            * based on the order above, and the rest ignored. E.g. if a template object defines `url` and `html`, `html` is ignored.
            *
            * @returns {Promise} a promise that resolves to the template.
            *
            * @description
            * Retrieves a template and returns that as a promise. A Template is a piece of html.
            */
            var $template = {
                'get': function (template) {
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
                }
            };
            return $template;
        }    ];
}
angular.module('dotjem.routing').provider('$template', $TemplateProvider);
