var module = angular.module('clientApp');

module.controller('clientEventListCtrl', function($scope, $rootScope, TimeSyncFunctional) {
    $scope.FormattedEventList = [];
    var FormattedEventListUpdater = function() {
        if (!$scope.$parent.eventList) {
            $scope.FormattedEventList = [];
            return;
        }

        // TODO add sort here
        $scope.FormattedEventList =
            $scope.$parent.eventList
                  .filter(function(event) {
                      var start = (new Date(event.startAt)).getTime();
                      var duration = Number(event.duration) * 10;
                      console.log(event);
                      console.log(TimeSyncFunctional.GetTime());
                      console.log(start + duration);
                      console.log(TimeSyncFunctional.GetTime() - (start + duration));
                      return (TimeSyncFunctional.GetTime() - (start + duration) < 1000 * 60 * 60 * 24);
                  })
                  .sort(function(a, b) {
                      var aStart = (new Date(a.startAt)).getTime();
                      var bStart = (new Date(b.startAt)).getTime();
                      return aStart - bStart;
                  })
                  .map(function(event) {
                        return {
                            id: event.id,
                            name: event.name
                        };
                    });
    };
    FormattedEventListUpdater();
    $scope.$on('newEventList', function() {
        FormattedEventListUpdater();
    });
    $scope.Actions = {
        SelectShow: function(id) {
            $rootScope.$broadcast('selectedShow', {eventId: id});
        }
    };
});