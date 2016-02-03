var module = angular.module('adminApp');

module.config(function($stateProvider) {
    $stateProvider.state('loginState', {
        url: '/admin/login',
        templateUrl: '/components/login/login.html',
        controller: 'loginCtrl',
        needAuth: false
    });
});

module.controller('loginCtrl', function($scope, $rootScope, $http, $cookies, AuthorizationFunctional, NavigationFunctional) {
    $scope.States = {
        loginForm: 'login-form',
        signInForm: 'sign-in-form'
    };
    $scope.blockedLoading = false;

    $scope.state = $scope.States.loginForm;

    $scope.UserData = {
        login: '',
        password: '',
        passwordCopy: '',
        Clear: function() {
            $scope.UserData.login = '';
            $scope.UserData.password = '';
            $scope.UserData.passwordCopy = '';
        },
        IncorrectLogin: function() {
            var login = $scope.UserData.login;
            if (!login) {
                return true;
            }
            if (login.length < 3) {
                return true;
            }
            if (login.length > 10) {
                return true;
            }
            return false;
        },
        IncorrectPassword: function() {
            var password = $scope.UserData.password;
            if (!password) {
                return true;
            }
            if (password.length < 5) {
                return true;
            }
            return false;
        },
        IncorrectPasswordCopy: function() {
            var password = $scope.UserData.password;
            if (!password) {
                return true;
            }
            if (password != $scope.UserData.passwordCopy) {
                return true;
            }
            return false;
        }
    };

    $scope.Actions = {
        ShowSignInForm: function() {
            $scope.UserData.Clear();
            $scope.state = $scope.States.signInForm;
        },
        ShowLoginForm: function() {
            $scope.UserData.Clear();
            $scope.state = $scope.States.loginForm;
        },
        Enter: function() {
            $scope.blockedLoading = true;
            var SuccessfulLogin = function(response) {
                $scope.blockedLoading = false;
                NavigationFunctional.NavigateTo('indexState');
            };
            var UnsuccessfulLogin = function(response) {
                $scope.blockedLoading = false;
            };
            AuthorizationFunctional.logIn($scope.UserData.login, $scope.UserData.password).then(
                SuccessfulLogin,
                UnsuccessfulLogin
            );
        },
        SignIn: function() {
            $scope.blockedLoading = true;
            var SuccessfulSignIn = function(response) {
                $scope.blockedLoading = false;
                NavigationFunctional.NavigateTo('indexState');
            };
            var UnsuccessfulSignIn = function(response) {
                $scope.blockedLoading = false;
            };
            AuthorizationFunctional.signIn($scope.UserData.login, $scope.UserData.password).then(
                SuccessfulSignIn,
                UnsuccessfulSignIn
            );
        }
    };

    $scope.Validators = {
        FormCorrect: function() {
            if ($scope.state == $scope.States.loginForm) {
                return (
                    !$scope.UserData.IncorrectLogin() &&
                    !$scope.UserData.IncorrectPassword()
                );
            }
            return (
                !$scope.UserData.IncorrectLogin() &&
                !$scope.UserData.IncorrectPassword() &&
                !$scope.UserData.IncorrectPasswordCopy()
            );
        }
    };
});