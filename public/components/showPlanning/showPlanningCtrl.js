var module = angular.module('adminApp');

module.config(function($stateProvider) {
    $stateProvider.state('showPlanningState', {
        url: '/admin/showPlanning?eventId',
        templateUrl: '/components/showPlanning/showPlanning.html',
        controller: 'showPlanningCtrl',
        needAuth: true
    });
});

module.controller('showPlanningCtrl', function($scope, $http, $filter, $timeout, $cookies, Upload, NavigationFunctional, TemporaryStorageFunctional) {
    $scope.selectedAudio = TemporaryStorageFunctional.GetProp('selectedAudio');
    $scope.info = null;

    var success = function (response) {
        $scope.info = response.data.info;
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

    $scope.GetLength = function() {
        if ($scope.info && $scope.info.duration) {
            return $scope.info.duration + ' ms';
        } else {
            return 'Not selected';
        }
    };
    $scope.GetStartDate = function() {
        if ($scope.info && $scope.info.startAt) {
            if ($scope.info.startAt == 'Draft') {
                return $scope.info.startAt;
            } else {
                return $filter('date')($scope.info.startAt, 'MM/dd HH:mm:ss');
            }
        } else {
            return 'Not selected';
        }
    };

    $scope.startTime = new Date(Date.now());
    $scope.selectingStart = false;

    $scope.dateToSelect = null;
    $scope.timeToSelect = null;
    $scope.saving = false;
    $scope.lastSave = 'none';

    $scope.Actions = {
        MoveToSongChooser: function() {
            NavigationFunctional.NavigateTo('songChooserState');
        },
        UpdateDuration: function() {
            Upload.mediaDuration($scope.selectedAudio).then(function(duration) {
                $scope.info.duration = Math.floor(duration * 100);
            });
        },
        Draft: function() {
            $scope.info.startAt = 'Draft';
        },
        SelectStart: function() {
            $scope.selectingStart = true;
            $scope.dateToSelect = null;
            $scope.timeToSelect = null;
            if ($scope.info && $scope.info.startAt && $scope.info.startAt != 'Draft') {
                $scope.dateToSelect = new Date(
                    $scope.info.startAt.getFullYear(),
                    $scope.info.startAt.getMonth(),
                    $scope.info.startAt.getDate(),
                    0,
                    0,
                    0,
                    0
                );
                $scope.timeToSelect = new Date(
                    0,
                    0,
                    0,
                    $scope.info.startAt.getHours(),
                    $scope.info.startAt.getMinutes(),
                    0,
                    0
                );
            }
        },
        UseStart: function() {
            if ($scope.dateToSelect && $scope.timeToSelect) {
                $scope.info.startAt = new Date(
                    $scope.dateToSelect.getFullYear(),
                    $scope.dateToSelect.getMonth(),
                    $scope.dateToSelect.getDate(),
                    $scope.timeToSelect.getHours(),
                    $scope.timeToSelect.getMinutes(),
                    0,
                    0
            );
                $scope.selectingStart = false;
            }
        },
        DeselectStart: function() {
            $scope.selectingStart = false;
        },
        Save: function() {
            if ($scope.info.startAt == 'Draft') {
                var success = function(response) {
                    $scope.saving = false;
                    $scope.lastSave = 'success';
                };
                var fail = function(response) {
                    $scope.saving = false;
                    $scope.lastSave = 'fail';
                };
                $scope.saving = true;
                $http.post('/api/events/savePlanInfo', {
                    eventId: NavigationFunctional.Params().eventId,
                    info: $scope.info
                }).then(success, fail);
            } else {
                if (!$scope.info.startAt) {
                    $scope.lastSave = 'fail';
                    return;
                }
                if (!$scope.info.name) {
                    $scope.lastSave = 'fail';
                    return;
                }
                if (!$scope.info.duration) {
                    $scope.lastSave = 'fail';
                    return;
                }

                var success = function(response) {
                    $scope.saving = false;
                    $scope.lastSave = 'success';
                    NavigationFunctional.NavigateNext();
                };
                var fail = function(response) {
                    $scope.saving = false;
                    $scope.lastSave = 'fail';
                };
                $scope.saving = true;
                $http.post('/api/events/savePlanInfo', {
                    eventId: NavigationFunctional.Params().eventId,
                    info: $scope.info
                }).then(success, fail);
            }
        }
    };
});