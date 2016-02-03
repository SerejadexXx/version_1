var module = angular.module('adminApp');

module.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/admin/login");

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

module.controller('adminCtrl', function($scope, $rootScope, $location, $interval, $cookies, $state, AuthorizationFunctional) {
    $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams) {
            if (toState.needAuth && !AuthorizationFunctional.IsAuth()) {
                event.preventDefault();
                $state.go('loginState');
            }
            if (toState.name == 'loginState' && AuthorizationFunctional.IsAuth()) {
                event.preventDefault();
                $state.go('indexState');
            }
        });
});