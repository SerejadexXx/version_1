var module = angular.module('adminApp');

module.config(function($stateProvider) {
    $stateProvider.state('indexState', {
        url: '/admin',
        templateUrl: '/components/index/index.html',
        controller: 'indexCtrl',
        needAuth: true
    });
});

module.controller('indexCtrl', function($scope, $cookies, $http, NavigationFunctional, AuthorizationFunctional) {
    $scope.username = $cookies.get('login');
    $scope.Actions = {
        LogOut: function () {
            AuthorizationFunctional.logOut();
        },
        AddEvent: function() {
            var SuccessfulResponse = function(response) {
                $scope.eventList = response.data.eventList;
            };
            var UnsuccessfulResponse = function() {
            };
            $http.post('/api/events/addNew', {
                login: $cookies.get('login')
            }).then(SuccessfulResponse, UnsuccessfulResponse);
        },
        EditEvent: function(eventId, startAt) {
            if (startAt && startAt != 'Draft') {
                NavigationFunctional.NavigateTo('countdownState', {'eventId': eventId});
            } else {
                NavigationFunctional.NavigateNext({'eventId': eventId});
            }
        },
        DeleteEvent: function(eventId) {
            var SuccessfulResponse = function(response) {
                $scope.eventList = response.data.eventList;
            };
            var UnsuccessfulResponse = function() {
            };
            $http.post('/api/events/delete', {
                login: $cookies.get('login'),
                eventId: eventId
            }).then(SuccessfulResponse, UnsuccessfulResponse);
        }
    };

    $scope.Event = function(event) {
        var _event = event;
        this.GetName = function() {
            if (_event.name) {
                return _event.name;
            }
            return 'Not assigned';
        };
        this.GetCreationDate = function() {
            if (_event.createdAt) {
                return new Date(Number(_event.createdAt));
            }
            return 'Unknown';
        };
        this.GetStartDate = function() {
            if (_event.startAt) {
                return _event.startAt;
            }
            return 'Not planned';
        };
        this.GetDuration = function() {
            if (_event.duration) {
                return _event.duration;
            }
            return 'N/A';
        };

        return this;
    };
    $scope.eventList = [];
    $scope.displayEventList = [];
    $scope.$watch('eventList', function() {
        if ($scope.eventList) {
            $scope.displayEventList = $scope.eventList.sort(function (a, b) {
                var timeA = (new Date(Number(a.createdAt))).getTime();
                var timeB = (new Date(Number(b.createdAt))).getTime();
                return (timeA - timeB);
            });
        } else {
            $scope.displayEventList = [];
        }
    });
    var FetchEventList = function() {
        var SuccessfulResponse = function(response) {
            $scope.eventList = response.data.eventList;
        };
        var UnsuccessfulResponse = function() {

        };
        $http.get('/api/events/getList', { params: {
            login: $cookies.get('login')
        }}).then(SuccessfulResponse, UnsuccessfulResponse);
    };
    FetchEventList();
});