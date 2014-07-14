angular.module('dotjem.routing').filter('isActiveState', [
    '$state', function ($state) {
        var cachedState, cachedValue;

        return function (state, params) {
            if (cachedState === $state.current) {
                return cachedValue;
            }
            cachedState = $state.current;
            return cachedValue = $state.isActive(state, params);
        };
    }]);
