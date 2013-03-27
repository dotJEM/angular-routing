angular
    .module('sample', ['ui.routing', 'ui.routing.legacy'])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/', {
                    template: "Home"
                })
                .when('/one', {
                    template: "Page One"
                })
                .when('/two', {
                    template: "Page Two"
                })
                .when('/three', {
                    template: "Page Three"
                })
                .otherwise({redirectTo: '/'});
        }]);