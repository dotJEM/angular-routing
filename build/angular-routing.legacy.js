/* THIS IS A BANNER */ 
'use strict';
angular.module('ui.routing.legacy', [
    'ui.routing', 
    'ng'
]).config([
    '$routeProvider', 
    function ($routeProvider) {
        $routeProvider.decorate('templateDecorator', [
            '$q', 
            '$injector', 
            '$templateCache', 
            '$http', 
            function ($q, $injector, $templateCache, $http) {
                var next = this, values = [], keys = [], template;
                forEach(next.resolve || {
                }, function (value, key) {
                    keys.push(key);
                    values.push(isString(value) ? $injector.get(value) : $injector.invoke(value));
                });
                if(angular.isDefined(template = next.template)) {
                    if(angular.isFunction(template)) {
                        template = template(next.params);
                    }
                } else if(isDefined(template = next.templateUrl)) {
                    if(isFunction(template)) {
                        template = template(next.params);
                    }
                    if(isDefined(template)) {
                        next.loadedTemplateUrl = template;
                        template = $http.get(template, {
                            cache: $templateCache
                        }).then(function (response) {
                            return response.data;
                        });
                    }
                }
                if(isDefined(template)) {
                    keys.push('$template');
                    values.push(template);
                }
                return $q.all(values).then(function (values) {
                    var locals = {
                    };
                    forEach(values, function (value, index) {
                        locals[keys[index]] = value;
                    });
                    return locals;
                }).then(function (locals) {
                    next.locals = locals;
                });
            }        ]);
    }]);
