angular.module('dotjem.routing').filter('isCurrentState', [
    '$state', function ($state) {
        return function (state, params) {
            return $state.is(state, params);
        };
    }]);
