var module = angular.module('NavigationService', ['ui.router']);

module.factory('NavigationFunctional', function($state, $stateParams) {
    var States = [
        'indexState',
        'songChooserState',
        'showCreationState',
        'showPlanningState',
        'countdownState'
    ];

    var _GetCurrentState = function() {
        return $state.current.name;
    };

    this.NavigateNext = function(params) {
        if (!params) {
            params = $stateParams;
        }
        var currentState = _GetCurrentState();
        if (States.indexOf(currentState) >= 0 && States.indexOf(currentState) + 1 < States.length) {
            $state.go(States[States.indexOf(currentState) + 1], params);
        }
    };

    this.NavigatePrev = function(params) {
        if (!params) {
            params = $stateParams;
        }
        var currentState = _GetCurrentState();
        if (States.indexOf(currentState) - 1 >= 0) {
            $state.go(States[States.indexOf(currentState) - 1], params);
        }
    };

    this.NavigateTo = function(stateTo, params) {
        if (!params) {
            params = $stateParams;
        }
        if (States.indexOf(stateTo) >= 0) {
            $state.go(stateTo, params);
        }
    };

    this.Params = function() {
        return $stateParams;
    };

    this.GetCurrentState = function() {
        return _GetCurrentState();
    };

    return this;
});