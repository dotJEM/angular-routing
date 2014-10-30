angular.module('dotjem.routing')
    .filter('isCurrentState', ['$state', function ($state) {
        function isCurrentState(state, params) {
            return $state.is(state, params);
        };
        (<any>isCurrentState).$stateful = true;
        return isCurrentState;
    }]); 