(function() {
    var module = angular.module('testApp');

    var controller = function($scope, $http, $timeout) {
        $scope.responsesSum = 0;
        $scope.responsesCount = 0;
        function Routine() {
            var success = function (response) {
                $scope.responsesSum += response.data.req;
                $scope.responsesCount++;
            };
            var fail = function (response) {
            };
            for (var request = 0; request < 1000; request++) {
                $http.get('/api/test/smallData').then(success, fail);
            }
        }
        $timeout(Routine, 1);
    };

    controller.$inject = ['$scope', '$http', '$timeout'];

    module.controller('testCtrl', controller);
})();