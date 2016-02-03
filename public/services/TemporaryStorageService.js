var module = angular.module('TemporaryStorageService', []);

module.factory('TemporaryStorageFunctional', function($rootScope) {
    var Props = [];
    this.SetProp = function(key, val) {
        Props[key] = val;
        $rootScope.$broadcast('TemporaryStorageUpdateOn_' + key, {});
    };
    this.GetProp = function(key) {
        return Props[key];
    };
    return this;
});