var module = angular.module('adminApp', [
    'ui.router',
    'ngFileUpload',
    'ngCookies',
    'AuthorizationService',
    'NavigationService',
    'TemporaryStorageService',
    'MomentsParserService',
    'ngMaterial',
    'mdColorPicker',
    'TimeSyncService'
]).config(function($httpProvider) {
    $httpProvider.interceptors.push(function($cookies) {
        return {
            request: function(config) {
                var token = $cookies.get('authToken');
                if(token) {
                    config.headers['x-access-token'] = token;
                }

                return config;
            },
            response: function(res) {
                return res;
            }
        }
    });
});