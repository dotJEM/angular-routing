var app = angular.module('demo', ['dotjem.routing']);

app.config(['$stateProvider', '$routeProvider',
  function($stateProvider, $routeProvider){
    $routeProvider
      .convert('between', function(args){
          var lower = args.lower, 
              upper = args.upper;
          return {
            parse: function(param) {
                var isNumber = !isNaN(param),
                    value = isNumber ? Number(param) : 0;
                    isInvalid = !isNumber
                               || value < lower || value > upper;
                return {
                    accept: !isInvalid,
                    value: value
                };
            },
            format: function(value) {
                if (isNaN(value)) {
                    throw Error("Parameter was not a number");
                }
                if( value < lower || value > upper ){
                    throw Error("Parameter was not in the"
                                + " specified range: "
                                + lower + "-" + upper);
                }
                return value.toString();
            }
        };       
      })
      .when('/about2/{between({ "lower":0, "upper":100}):value}', {
            state: 'about'
      })
      .when('/contact2/{between({ "lower":0, "upper":100}):value}', {
            state: 'contact'
      })
      .otherwise({ redirectTo: '/404' });
    
    $stateProvider
      .state('about', {
        route: '/about',
        views: { main: { template: 'about.html' } }
      })
      .state('contact', {
        route: '/contact',
        views: { main: { template: 'contact.html' } }
      })
      .state('home', {
        route: '/',
        views: { main: { template: 'home.html' } }
      })
      .state('error', {
        route: '/404',
        views: { main: { template: '<h1>404 NOT FOUND</h1>' } }
      })
  }]);

app.controller('siteController', ['$scope', '$state',
  function($scope, $state) {
    $scope.fn = { isActive: $state.isActive }
  }]);