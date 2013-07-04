/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />
var uiSrefDirective = [
    '$state', 
    function ($state) {
        function parseStateRef(ref) {
            var parsed = ref.match(/^([^(]+?)\s*(\((.*)\))?$/);
            if(!parsed || parsed.length !== 4) {
                throw new Error("Invalid state ref '" + ref + "'");
            }
            return {
                state: parsed[1],
                paramExpr: parsed[3] || null
            };
        }
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var ref = parseStateRef(attrs.uiSref), params = null, url = null, isForm = element[0].nodeName === "FORM", attr = isForm ? "action" : "href", nav = true;
                function update(newVal) {
                    if(newVal) {
                        params = newVal;
                    }
                    if(!nav) {
                        return;
                    }
                    var newHref = $state.href(ref.state, params, {
                        lossy: true
                    });
                    if(!newHref) {
                        nav = false;
                        return false;
                    }
                    element[0][attr] = newHref;
                }
                ;
                if(ref.paramExpr) {
                    scope.$watch(ref.paramExpr, function (newVal, oldVal) {
                        if(newVal !== oldVal) {
                            update(newVal);
                        }
                    }, true);
                    params = scope.$eval(ref.paramExpr);
                }
                update();
                if(isForm) {
                    return;
                }
                element.bind("click", function (e) {
                    $state.transitionTo(ref.state, params);
                    scope.$apply();
                    e.preventDefault();
                });
            }
        };
    }];
angular.module('ui.routing').directive('uiSref', uiSrefDirective);
