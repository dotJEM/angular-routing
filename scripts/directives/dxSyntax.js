/// <reference path="../_references.d.ts" />
angular.module('dotjem.routing.pages').directive('dxSyntax', [
    'syntax', function (syntax) {
        return {
            restrict: 'ECA',
            terminal: false,
            link: function (scope, element) {
                syntax.Highlight(element);
            }
        };
    }
]);
//# sourceMappingURL=dxSyntax.js.map
