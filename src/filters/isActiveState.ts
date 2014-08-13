angular.module('dotjem.routing')
    .filter('isActiveState', ['$state', function ($state) {
        return function (state, params) {
            return $state.isActive(state, params);
        };
    }]);