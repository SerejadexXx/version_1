var module = angular.module('adminApp');

module.controller('footerCtrl', function($scope, NavigationFunctional) {
    $scope.States = {
        'indexState': {
            displayName: 'Events'
        },
        'songChooserState': {
            displayName: 'Choose Song'
        },
        'showCreationState': {
            displayName: 'Create Show'
        },
        'showPlanningState': {
            displayName: 'Plan Start'
        },
        'countdownState': {
            displayName: 'Finalize'
        }
    };
    $scope.currentState = NavigationFunctional.GetCurrentState();
    $scope.isLocked = false;
    $scope.lockCreation = false;
    $scope.Actions = {
        NavigateTo: function(stateTo) {
            if (stateTo != $scope.currentState) {
                NavigationFunctional.NavigateTo(stateTo);
            }
        }
    };
    $scope.$on('lockFooter', function() {
        $scope.isLocked = true;
    });
    $scope.$on('unlockFooter', function() {
        $scope.isLocked = false;
    });
    $scope.$on('lockFooterCreatingPart', function() {
        $scope.lockCreation = true;
    });
    $scope.$on('unlockFooterCreatingPart', function() {
        $scope.lockCreation = false;
    });
});