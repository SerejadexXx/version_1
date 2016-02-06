var module = angular.module('adminApp');

module.config(function($stateProvider) {
    $stateProvider.state('showCreationState', {
        url: '/admin/showCreation?eventId',
        templateUrl: '/components/showCreation/showCreation.html',
        controller: 'showCreationCtrl',
        needAuth: true
    });
});

module.controller('showCreationCtrl', function($location, $scope, $rootScope, $cookies, NavigationFunctional, PlayerFunctional, $interval, $window, MomentsCreationFunctional) {
    $scope.$on('$destroy', function() {
        $interval.cancel(intervalPromise);
    });
    $scope.defaultSeconds = 60;
    $scope.pixelsPerSec = 20;
    var _CalcSecondsToShow = function() {
        if (PlayerFunctional.GetLength() > 0) {
            return Math.floor(PlayerFunctional.GetLength() * $scope.pixelsPerSec) / $scope.pixelsPerSec;
        }
        return $scope.defaultSeconds;
    };
    $scope.secondsToShow = _CalcSecondsToShow();
    $scope.$on('PlayerNewAudioUploaded', function() {
        $scope.secondsToShow = _CalcSecondsToShow();
        MomentsCreationFunctional.SetTotalLength($scope.secondsToShow * 100);
    });

    $scope.viewMode = 'momentsCreation';
    $scope.$on('momentToEdit', function() {
        $scope.viewMode = 'momentEditor';
    });
    $scope.$on('momentToEditDone', function(event, args) {
        $scope.viewMode = 'momentsCreation';
        if ($scope.ProgressInPixels < 5 * $scope.pixelsPerSec) {
            $location.hash('anchor_footer');
        } else {
            $location.hash('anchor_'
                + Math.floor(
                    $scope.Filters.ProgressInPixelsToProgress(
                        $scope.ProgressInPixels - 5 * $scope.pixelsPerSec
                    ) / 100
                )
            );
        }
    });

    $scope.ProgressInPixels = 0;
    // should receive progress property in milliseconds
    var intervalPromise = $interval(function() {
        var progressByPlayer = PlayerFunctional.GetProgress();
        $scope.ProgressInPixels = $scope.Filters.ProgressToProgressInPixels(progressByPlayer);
    }, 10);

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    $scope.Filters = {
        s_mmss: function(seconds) {
            var mm = Math.floor(seconds / 60);
            if (mm < 10) {
                mm = '0' + mm;
            }
            var ss = seconds % 60;
            if (ss < 10) {
                ss = '0' + ss;
            }
            return mm + ':' + ss;
        },
        NormalizeProgressInPixels: function(progressInPixels) {
            if (progressInPixels < 0) {
                progressInPixels = 0;
            }
            if (progressInPixels > $scope.secondsToShow * $scope.pixelsPerSec) {
                progressInPixels = $scope.secondsToShow * $scope.pixelsPerSec;
            }
            return progressInPixels;
        },
        ProgressInPixelsToProgress: function(progressInPixels) {
            return Math.floor(progressInPixels * 100 / $scope.pixelsPerSec);
        },
        ProgressToProgressInPixels: function(progress) {
            return Math.floor(progress * $scope.pixelsPerSec / 100);
        }
    };

    var _trackingMouse = false;
    angular.element($window).bind('mousemove', function(event) {
        if (_trackingMouse) {
            var progressInPixels = event.pageY - document.getElementById('idShowCreationProgressLine').offsetTop;
            progressInPixels = $scope.Filters.NormalizeProgressInPixels(progressInPixels);
            PlayerFunctional.SetProgress($scope.Filters.ProgressInPixelsToProgress(progressInPixels));
        }
        $scope.$apply();
    });
    angular.element($window).bind('mouseup', function(event) {
        if (_trackingMouse) {
            _trackingMouse = false;
        }
        $scope.$apply();
    });
    $scope.Actions = {
        ProgressMouseDown: function(event) {
            _trackingMouse = true;
            var progressInPixels = event.pageY - document.getElementById('idShowCreationProgressLine').offsetTop;
            progressInPixels = $scope.Filters.NormalizeProgressInPixels(progressInPixels);
            PlayerFunctional.SetProgress($scope.Filters.ProgressInPixelsToProgress(progressInPixels));
        }
    };
});