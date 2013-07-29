/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />
'use strict';
var uiAnchorDirective = [
    '$scroll', 
    '$timeout', 
    function ($scroll, $timeout) {
        return {
            restrict: 'ECA',
            terminal: false,
            link: function (scope, element, attr) {
                var name = attr['uiScroll'] || attr.id;
                //$scroll.$register(name, element);
                //TODO: This is not aware if there are multiple elements named the same, we should instead
                //      register the element with the $scroll service so that can throw an error if multiple
                //      elements has the same name.
                scope.$on('$scrollPositionChanged', function (event, target) {
                    scroll(target);
                });
                scroll($scroll.$current);
                function scroll(target) {
                    if(target === name) {
                        //Note: Delay scroll untill any digest is done.
                        $timeout(function () {
                            element[0].scrollIntoView();
                        }, 100);
                    }
                }
            }
        };
    }];
angular.module('ui.routing').directive('uiAnchor', uiAnchorDirective);
