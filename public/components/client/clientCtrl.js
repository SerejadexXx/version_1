var module = angular.module('clientApp');

module.controller('clientCtrl', function($scope, $http, $timeout, TimeSyncFunctional) {
    $scope.state = 'eventListState';
    var localData = {
        id: null,
        eventListHash: null
    };
    $scope.eventList = null;

    TimeSyncFunctional.TurnOffAutoSync();
    var fetchUpdates = function() {
        var success = function(response) {
            localData.id = response.data.id;
            if (response.data.eventList) {
                $scope.eventList = response.data.eventList;
                localData.eventListHash = response.data.eventListHash;
                $scope.$broadcast('newEventList');
            }

            var finishAt = Date.now();
            TimeSyncFunctional.AddTimeStamp({
                startAt: startAt,
                finishAt: finishAt,
                serverTime: response.data.currentTime
            });

            $timeout(fetchUpdates, 600);
        };
        var fail = function(response) {
            $timeout(fetchUpdates, 600);
        };

        var startAt = Date.now();
        $http.get('/api/clients/catchUpdates', {params: {localData: localData}}).then(
            success,
            fail
        );
    };
    fetchUpdates();

    $scope.$on('selectedShow', function(event, args) {
        $scope.state = 'showState';
    });

    $scope.$on('deselectedShow', function(event, args) {
        $scope.state = 'eventListState';
    });
});