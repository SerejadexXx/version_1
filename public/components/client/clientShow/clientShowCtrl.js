var module = angular.module('clientApp');

module.controller('clientShowCtrl', function($scope, $interval, $rootScope, MomentsParserFunctional, TimeSyncFunctional) {
    $scope.id = null;
    $scope.showData = 0;
    $scope.currentColor = "rgb(29, 30, 45)";
    $scope.name = null;
    var momentsListener = null;
    var momentsToken = null;
    var moments = null;
    var duration = 0;
    var startAt = 0;
    $scope.countdownSeconds = null;
    $scope.countdownDays = null;
    $scope.$on('selectedShow', function(event, args) {
        $scope.showData = 1;
        $scope.id = args.eventId;
        var events = $scope.$parent.eventList.filter(function(event) {
            return event.id == $scope.id;
        });
        if (events.length > 0) {
            $scope.name = events[0].name;
            startAt = (new Date(events[0].startAt)).getTime();
            duration = events[0].duration;
        }
        if (events.length > 0 && events[0].moments) {
            moments = events[0].moments;
        }
        momentsToken = MomentsParserFunctional.GetToken();
        momentsListener = $interval(function() {
            var time = TimeSyncFunctional.GetTime();
            if (time + 1000 * 60 * 60 * 24 < startAt) {
                $scope.countdownDays = Math.floor((startAt - time) / (1000 * 60 * 60 * 24));
                $scope.countdownSeconds = null;
            } else
            if (time < startAt) {
                $scope.countdownDays = null;
                $scope.countdownSeconds = startAt - time;
            } else {
                $scope.countdownSeconds = null;
                $scope.countdownDays = null;
            }
            $scope.currentColor = MomentsParserFunctional.GetColor(
                momentsToken,
                moments,
                duration,
                Math.floor((time - startAt) / 10));
        }, 10);
    });
    $scope.$on('newEventList', function(event, args) {
        if ($scope.showData) {
            var events = $scope.$parent.eventList.filter(function (event) {
                return event.id == $scope.id;
            });
            if (events.length > 0) {
                $scope.name = events[0].name;
                startAt = (new Date(events[0].startAt)).getTime();
                duration = events[0].duration;
            }
            if (events.length > 0 && events[0].moments) {
                moments = events[0].moments;
            }
        }
    });

    $scope.$on('deselectedShow', function(event, args) {
        moments = null;
        $scope.name = null;
        $interval.cancel(momentsListener);
        $scope.countdownSeconds = null;
        $scope.countdownDays = null;
    });

    $scope.Actions = {
        Close: function() {
            $rootScope.$broadcast('deselectedShow', {});
        },
        SwapContent: function() {
            $scope.showData ^= 1;
        }
    };

    $scope.Filters = {
        ms_HHmmss: function(val) {
            var rez = "";
            var HH = Math.floor(val / (1000 * 60 * 60));
            if (HH < 10) {
                rez += "0";
            }
            rez += HH + ":";
            val %= (1000 * 60 * 60);
            var mm = Math.floor(val / (1000 * 60));
            if (mm < 10) {
                rez += "0";
            }
            rez += mm + ":";
            val %= (1000 * 60);
            var ss = Math.floor(val / (1000));
            if (ss < 10) {
                rez += "0";
            }
            rez += ss;
            return rez;
        }
    };
});