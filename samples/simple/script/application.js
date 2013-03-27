var app = angular.module('sample', ['ui.routing']);
app.config(['$stateProvider', '$routeProvider',
       function ($stateProvider, $routeProvider) {
           $routeProvider
               .otherwise({ redirectTo: '/' });

           $stateProvider
               .state('home', {
                   route: '/',
                   views: {
                       'main': {
                           template: { html: '@home' }
                       },
                       'hint': {
                           template: { html: '@home' }
                       }
                   }
               })
               .state('one', {
                   route: '/one',
                   views: {
                       'main': {
                           template: { html: '@one' }
                       },
                       'hint': {
                           template: { html: '@one' }
                       }
                   }
               })
               .state('two', {
                   route: '/two',
                   views: {
                       'main': {
                           template: { html: '@two' }
                       },
                       'hint': {
                           template: { html: '@two' }
                       }
                   }
               })
               .state('three', {
                   route: '/three',
                   views: {
                       'main': {
                           template: { html: '@three' }
                       },
                       'hint': {
                           template: { html: '@three' }
                       }
                   }
               });
       }]);

function clean(state) {
    var newState = {};

    newState.self = state.self;
    newState.fullname = state.fullname;
    newState.children = {};
    if (state.route)
        newState.route = state.route;

    angular.forEach(state.children, function(child, name) {
        newState.children[name] = clean(child);
    });
    return newState;
}

function PageController($scope, $route, $state, $transition) {
    $scope.routes = JSON.stringify($route.routes, null, 2);
    $scope.states = JSON.stringify(clean($state.root), null, 2);
    $scope.transitions = JSON.stringify($transition.root, null, 2);
}