app.controller('siteController', ['$scope', '$state', '$view',
    function ($scope, $state, $view) {
        $scope.dorefresh = function () {
            $view.refresh();
        };
        $scope.isActive = $state.isActive;
        $scope.model = { refreshes: 0, loads: 0 };
        $scope.counters = {
            sticky: { refreshes: 0, loads: 0 },
            home: { refreshes: 0, loads: 0 },
            contact: { refreshes: 0, loads: 0 },
            about: { refreshes: 0, loads: 0 }
        };
    }]);

app.controller('stickyController', ['$scope', '$state',
    function ($scope, $state) {
        function refresh() {
            $scope.model.state = $state.current.$fullname;
            $scope.counters.sticky.refreshes++;
        }

        $scope.counters.sticky.refreshes = 0;
        $scope.counters.sticky.loads++;
        $scope.refresh = refresh;
        refresh();
    }]);

app.controller('homeController', ['$scope', '$state',
    function ($scope, $state) {
        function refresh() {
            $scope.counters.home.refreshes++;
        }

        $scope.counters.home.refreshes = 0;
        $scope.counters.home.loads++;
        $scope.refresh = refresh;
        refresh();
    }]);

app.controller('aboutController', ['$scope', '$state',
    function ($scope, $state) {
        function refresh() {
            $scope.counters.about.refreshes++;
        }

        $scope.counters.about.refreshes = 0;
        $scope.counters.about.loads++;
        $scope.refresh = refresh;
        refresh();
    }]);

app.controller('contactController', ['$scope', '$state',
    function ($scope, $state) {
        function refresh() {
            $scope.counters.contact.refreshes++;
        }

        $scope.counters.contact.refreshes = 0;
        $scope.counters.contact.loads++;
        $scope.refresh = refresh;
        refresh();
    }]);