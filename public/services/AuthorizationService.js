var module = angular.module('AuthorizationService', ['ngCookies']);

module.factory('AuthorizationFunctional', function($http, $q, $cookies, $window, $state) {
    var ParseJwt = function(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse($window.atob(base64));
    };

    var GetToken = function () {
        return $cookies.get('authToken');
    };

    var IsAuth = function() {
        var token = GetToken();
        if(token) {
            var params = ParseJwt(token);
            return Math.round(new Date().getTime() / 1000) <= params.exp;
        } else {
            return false;
        }
    };
    this.IsAuth = IsAuth;

    this.logIn = function(login, password) {
        var deferred = $q.defer();
        var SuccessfulResponse = function(response) {
            if (response.status == 200) {
                $cookies.put('authToken', response.data.token);
                $cookies.put('login', login);
                deferred.resolve();
            } else {
                $cookies.remove('authToken');
                $cookies.remove('login');
                deferred.reject();
            }
        };
        var UnsuccessfulResponse = function(response) {
            deferred.reject();
        };

        $http.post('/api/login', {
            login: login,
            password: password
        }).then(
            SuccessfulResponse,
            UnsuccessfulResponse
        );
        return deferred.promise;
    };
    this.signIn = function(login, password) {
        var deferred = $q.defer();
        var SuccessfulResponse = function(response) {
            if (response.status == 200) {
                $cookies.put('authToken', response.data.token);
                $cookies.put('login', login);
                deferred.resolve();
            } else {
                $cookies.remove('authToken');
                $cookies.remove('login');
                deferred.reject();
            }
        };
        var UnsuccessfulResponse = function(response) {
            deferred.reject();
        };

        $http.post('/api/signIn', {
            login: login,
            password: password
        }).then(
            SuccessfulResponse,
            UnsuccessfulResponse
        );
        return deferred.promise;
    };
    this.logOut = function() {
        var deferred = $q.defer();
        if (!IsAuth()) {
            deferred.reject();
        } else {
            $cookies.remove('authToken');
            $cookies.remove('login');
            $state.go('loginState');

            /*
            var SuccessfulResponse = function (response) {
            };
            var UnsuccessfulResponse = function (response) {
                deferred.reject();
            };



             $http.post('/api/logout', {
             login: $cookies.get('login'),
             }).then(
             SuccessfulResponse,
             UnsuccessfulResponse
             );
             */
        }
        return deferred.promise;
    };
    return this;
});