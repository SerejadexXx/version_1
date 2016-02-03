var module = angular.module('adminApp');

module.config(function($stateProvider) {
    $stateProvider.state('songChooserState', {
        url: '/admin/songChooser?eventId',
        templateUrl: '/components/songChooser/songChooser.html',
        controller: 'songChooserCtrl',
        needAuth: true
    });
});

module.controller('songChooserCtrl', function($scope, $cookies, Upload, NavigationFunctional, TemporaryStorageFunctional) {
    $scope.selectedAudio = TemporaryStorageFunctional.GetProp('selectedAudio');
    $scope.selectedAudioName = null;
    $scope.$watch('selectedAudio', function() {
        TemporaryStorageFunctional.SetProp('selectedAudio', $scope.selectedAudio);
        if ($scope.selectedAudio) {
            $scope.selectedAudioName = $scope.selectedAudio.name;
        } else {
            $scope.selectedAudioName = null;
        }
    });
    $scope.Actions = {
        NavigateNext: function() {
            NavigationFunctional.NavigateNext();
        }
    };
});