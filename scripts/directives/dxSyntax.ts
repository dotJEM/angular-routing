/// <reference path="../_references.d.ts" />

angular.module('dotjem.routing.pages').directive('dxSyntax', [
    <any>'syntax', function(syntax){
        return {
            restrict: 'ECA',
            terminal: false,
            link: function (scope, element) {
                syntax.Highlight(element);
            }
        };
    }
]);
