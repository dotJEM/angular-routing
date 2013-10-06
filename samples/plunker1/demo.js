var app = angular.module('demo', [
  'demo.home','demo.about','demo.contact',
  'dotjem.routing']);


app.controller('siteController', ['$scope', '$state',
  function($scope, $state) {
    var cache = {};
    
    $scope.fn = {};
    $scope.fn.isActive = function (state) {
        if (state in cache)
            return cache[state];
        return cache[state] = $state.isActive(state);
    }
    $scope.fn.url = function (state) {
        return $state.url(state);
    }
    
    $scope.$on('$stateChangeSuccess', function (event, state) {
      cache = {};
    })
  }]);