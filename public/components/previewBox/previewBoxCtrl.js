var module = angular.module('adminApp');

module.controller('previewBoxCtrl', function($scope, $interval, MomentsParserFunctional) {
    // 'horizontal' or 'vertical'
    $scope.info = $scope.$parent.previewInfo;
    $scope.userColor = '#ffffff';
    var parserToken = MomentsParserFunctional.GetToken();
    $interval(function() {
        $scope.info = $scope.$parent.previewInfo;
        if ($scope.info.moments) {
            $scope.userColor = MomentsParserFunctional.GetColor(
                parserToken,
                $scope.info.moments,
                $scope.info.totalLength,
                $scope.info.currentProgress
            );
            if (typeof $scope.userColor != 'string') {
                var data = $scope.userColor.data;
                if ($scope.userColor.type == 'wave') {
                    $scope.userColor = data.mainColor;
                }
            }
        } else {
            $scope.userColor = '#ffffff';
        }
    }, 10);
});