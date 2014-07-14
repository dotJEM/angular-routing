angular.module('dotjem.routing')
    .filter('isCurrentState', ['$state', function ($state) {
        var cachedState, cachedValue;

        return function (state, params) {
            if (cachedState === $state.current) {
                return cachedValue;
            }
            cachedState = $state.current;
            return cachedValue = $state.is(state, params);
        };
    }]); 