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
     * @description
     * 
     */
    this.$get = [<any>'$http', '$q', '$injector', '$templateCache',
    function ($http: ng.IHttpService, $q: ng.IQService, $injector: ng.auto.IInjectorService, $templateCache: ng.ITemplateCacheService) {

        function getFromUrl(url): ng.IPromise {
            return $http.get(url, { cache: $templateCache }).then(response => { return response.data; });
        }

        function getFromFunction(fn): ng.IPromise {
            return $q.when($injector.invoke(fn));
        }

        function getFromObject(obj): ng.IPromise {
            if (isDefined(obj.url))
                return getFromUrl(obj.url);

            if (isDefined(obj.fn))
                return getFromFunction(obj.fn);

            if (isDefined(obj.html))
                return $q.when(obj.html);

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
         * If a template object i used, one of the following properties may be used:
         * - `url` `{string}`: An url location of the template.
         * - `fn` `{function}`: A function that returns the template.
         * - `html` `{string}`: The actual template as raw html.
         * 
         * @returns {Promise} a promise that resolves to the template.
         *
         * @description
         * 
         */
        this.get = function (template): ng.IPromise {
            if (isString(template)) {
                if (urlmatcher.test(template))
                    return getFromUrl(template)
                else
                    return $q.when(template);
            }

            if (isFunction(template) || isArray(template))
                return getFromFunction(template);

            if (isObject(template))
                return getFromObject(template);

            throw new Error("Template must be either an url as string, function or a object defining either url, fn or html.");
        }

        return this;
    }];
}
angular.module('dotjem.routing').provider('$template', $TemplateProvider);