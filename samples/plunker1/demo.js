var app = angular.module('demo', [
  'demo.home','demo.about','demo.contact',
  'dotjem.routing']);

app.config(['$locationProvider', function (lp) {
    lp.html5Mode(true);
}]);


app.controller('siteController', ['$scope', '$state',
  function($scope, $state) {
      $scope.fn = {
          isActive: $state.isActive,
          goto: function(state) {
              $state.goto(state);
          }
      };
  }]);