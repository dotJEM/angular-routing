angular.module('dotjem.routing')
    .filter('isActiveState', ['$state', function ($state) {
        function isActiveState(state, params) {
            return $state.isActive(state, params);
        };
        (<any>isActiveState).$stateful = true;
        return isActiveState;
    }]);