
angular.module('sample').directive('uiContent', function ($compile, $anchorScroll) {
    return {
        restrict: 'ECA',
        compile: function (elm, attr) {
            var srcExp = attr.uiContent || attr.src,
            onloadExp = attr.onload || '',
            autoScrollExp = attr.autoscroll;
            return function (scope, element) {
                var changeCounter = 0,
                    childScope;

                var clearContent = function () {
                    if (childScope) {
                        childScope.$destroy();
                        childScope = null;
                    }
                    element.html('');
                };

                scope.$watch(srcExp, function (src) {
                    var thisChangeId = ++changeCounter;
                    if (src) {
                        if (thisChangeId !== changeCounter) return;
                        if (childScope) childScope.$destroy();
                        childScope = scope.$new();
                        element.html(src);
                        $compile(element.contents())(childScope);
                        if (angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                            $anchorScroll();
                        }
                        childScope.$emit('$htmlContentLoaded');
                        scope.$eval(onloadExp);
                    } else clearContent();
                });
            };
        }
    };
});
