var module = angular.module('adminApp');

module.config(function($stateProvider) {
    $stateProvider.state('countdownState', {
        url: '/admin/countdown?eventId',
        templateUrl: '/components/countdown/countdown.html',
        controller: 'countdownCtrl',
        needAuth: true
    });
});

module.controller('countdownCtrl', function($scope, $timeout, $interval, $rootScope, $http, $cookies, NavigationFunctional, TimeSyncFunctional) {
    $scope.info = null;
    var lockTimeout;
    $scope.$on('$destroy', function() {
        $interval.cancel(intervalPromise);
        $timeout.cancel(lockTimeout);
        $rootScope.$broadcast('unlockFooterCreatingPart', {});
    });

    var success = function (response) {
        $scope.info = response.data.info;
        if (!$scope.info.startAt || $scope.info.startAt == 'Draft') {
            NavigationFunctional.NavigatePrev();
        }
        lockTimeout = $timeout(function() {
            $rootScope.$broadcast('lockFooterCreatingPart', {});
        }, 500);
    };
    var fail = function () {
        $timeout(fetch, 5000);
    };
    var fetch = function () {
        $http.get('/api/events/getPlanInfo', {
            params: {
                eventId: NavigationFunctional.Params().eventId
            }
        }).then(success, fail);
    };
    fetch();

    var GetCurrentTime = function() {
        $scope.currentTime = TimeSyncFunctional.GetTime();
    };
    GetCurrentTime();
    var intervalPromise = $interval(
        GetCurrentTime,
        500
    );

    $scope.GetStart = function() {
        if ($scope.info) {
            return $scope.info.startAt;
        }
    };
    $scope.changingStart = 0;
    $scope.dateToSelect = null;
    $scope.timeToSelect = null;
    $scope.Actions = {
        SaveDraft: function() {
            var success = function(response) {
                NavigationFunctional.NavigatePrev();
            };
            var fail = function(response) {

            };
            $scope.info.startAt = 'Draft';
            $http.post('/api/events/savePlanInfo', {
                eventId: NavigationFunctional.Params().eventId,
                info: $scope.info
            }).then(success, fail);
        },
        ChangeStart: function() {
            var success = function(response) {
                $scope.Actions.ChangingStart();
            };
            var fail = function(response) {

            };
            $scope.info.startAt = new Date(
                $scope.dateToSelect.getFullYear(),
                $scope.dateToSelect.getMonth(),
                $scope.dateToSelect.getDate(),
                $scope.timeToSelect.getHours(),
                $scope.timeToSelect.getMinutes(),
                0,
                0
            );
            $http.post('/api/events/savePlanInfo', {
                eventId: NavigationFunctional.Params().eventId,
                info: $scope.info
            }).then(success, fail);
        },
        ChangingStart: function() {
            var oldDate = new Date($scope.info.startAt);
            $scope.dateToSelect = new Date(
                oldDate.getFullYear(),
                oldDate.getMonth(),
                oldDate.getDate(),
                0,
                0,
                0,
                0
            );
            $scope.timeToSelect = new Date(
                0,
                0,
                0,
                oldDate.getHours(),
                oldDate.getMinutes(),
                0,
                0
            );
            $scope.changingStart ^= 1;
        },
        SendPushUps: function() {
            var success = function() {

            };
            var fail = function() {

            };
            $http.post('/api/clients/sendPushUps', {
                eventId: NavigationFunctional.Params().eventId,
            }).then(success, fail);
        }
    };
});