var module = angular.module('adminApp');

module.controller('momentEditorCtrl', function($scope, $rootScope, $interval, MomentsCreationFunctional, PlayerFunctional) {
    $scope.momentToEdit = null;
    $scope.endsAt = 0;

    $scope.displayPreview = true;
    $scope.previewInfo = {
        orientation: 'horizontal',
        moments: null,
        totalLength: 0,
        currentProgress: 0
    };
    var UpdatePreviewInfo = function() {
        $scope.previewInfo.moments = [$scope.momentToEdit];
        $scope.previewInfo.totalLength = $scope.endsAt;
    };
    var ReleasePreviewInfo = function() {
        $scope.previewInfo.moments = null;
        $scope.previewInfo.totalLength = 0;
    };

    $scope.DisplayPreview = function() {
        return $scope.displayPreview;
    };

    var watcher = null;

    $scope.$on('momentToEdit', function(event, args) {
        $rootScope.$broadcast('lockFooter');
        $scope.momentToEdit = MomentsCreationFunctional.GetMomentById(args.momentToEdit);
        $scope.endsAt = MomentsCreationFunctional.GetMomentEnd($scope.momentToEdit);
        PlayerFunctional.SetProgress($scope.momentToEdit.startAt);
        $scope.displayPreview = true;
        watcher = $interval(function() {
            console.log('I am still here');
            var progress = PlayerFunctional.GetProgress();
            $scope.previewInfo.currentProgress = progress;
            if (progress >= $scope.endsAt - 0.0001) {
                $scope.Actions.Stop();
            }
        }, 10);

       UpdatePreviewInfo();

        var momentType = $scope.momentToEdit.type;
        if (momentType == 'random') {
            momentType = 'cycle';
        }
        switch (momentType) {
            case 'singleColor':
            {
                $scope.selectedColor = tinycolor($scope.momentToEdit.data.color).toHexString();
                $scope.ChangedColor = function () {
                    $scope.momentToEdit.data.color = tinycolor($scope.selectedColor).toRgb();
                };
                break;
            }
            case 'colorToColor':
            {
                $scope.selectedColor1 = tinycolor($scope.momentToEdit.data.color1).toHexString();
                $scope.selectedColor2 = tinycolor($scope.momentToEdit.data.color2).toHexString();
                $scope.ChangedColor1 = function () {
                    $scope.momentToEdit.data.color1 = tinycolor($scope.selectedColor1).toRgb();
                };
                $scope.ChangedColor2 = function () {
                    $scope.momentToEdit.data.color2 = tinycolor($scope.selectedColor2).toRgb();
                };
                break;
            }
            case 'cycle':
            {
                var lastIndex = 0;
                $scope.selectedColors = $scope.momentToEdit.data.colors.map(function (RgbColor) {
                    lastIndex++;
                    return {
                        id: lastIndex,
                        color: tinycolor(RgbColor).toHexString()
                    };
                });
                $scope.ChangedColor = function () {
                    $scope.momentToEdit.data.colors = $scope.selectedColors.map(function (HexColor) {
                        return tinycolor(HexColor.color).toRgb();
                    });
                };
                $scope.AddColor = function (color) {
                    if ($scope.selectedColors.length > 8) {
                        return;
                    }

                    color = color || '#ee0000';
                    lastIndex++;
                    $scope.selectedColors.push({
                        id: lastIndex,
                        color: tinycolor(color).toHexString()
                    });
                    $scope.ChangedColor();
                };
                $scope.DeleteColor = function (index) {
                    if ($scope.selectedColors.length <= 1) {
                        return;
                    }
                    $scope.selectedColors.splice(index, 1);
                    $scope.ChangedColor();
                };

                $scope.ChangedDuration = function () {
                    if (isNaN($scope.momentToEdit.data.duration)
                        || Number($scope.momentToEdit.data.duration) !== $scope.momentToEdit.data.duration
                        || $scope.momentToEdit.data.duration % 1 !== 0) {
                        $scope.momentToEdit.data.duration = 5;
                        return;
                    }
                    if ($scope.momentToEdit.data.duration < 5) {
                        $scope.momentToEdit.data.duration = 5;
                        return;
                    }
                    if ($scope.momentToEdit.data.duration > 999) {
                        $scope.momentToEdit.data.duration = 999;
                        return;
                    }
                };
                break;
            }
            case 'colorPlusBlink':
            {
                $scope.selectedColor1 = tinycolor($scope.momentToEdit.data.color1).toHexString();
                $scope.selectedColor2 = tinycolor($scope.momentToEdit.data.color2).toHexString();
                $scope.ChangedColor1 = function () {
                    $scope.momentToEdit.data.color1 = tinycolor($scope.selectedColor1).toRgb();
                };
                $scope.ChangedColor2 = function () {
                    $scope.momentToEdit.data.color2 = tinycolor($scope.selectedColor2).toRgb();
                };
                break;
            }
            case 'wave':
            {
                $scope.selectedColor1 = tinycolor($scope.momentToEdit.data.color1).toHexString();
                $scope.selectedColor2 = tinycolor($scope.momentToEdit.data.color2).toHexString();
                $scope.ChangedColor1 = function () {
                    $scope.momentToEdit.data.color1 = tinycolor($scope.selectedColor1).toRgb();
                };
                $scope.ChangedColor2 = function () {
                    $scope.momentToEdit.data.color2 = tinycolor($scope.selectedColor2).toRgb();
                };
                break;
            }
            default:
                break;
        }
    });
    $scope.Release = function() {
        $rootScope.$broadcast('unlockFooter');
        $rootScope.$broadcast('momentToEditDone');
        $scope.momentToEdit = null;
        PlayerFunctional.UseMain();
        $interval.cancel(watcher);
        ReleasePreviewInfo();
    };

    $scope.Actions = {
        SaveExit: function() {
            MomentsCreationFunctional.SetMoment($scope.momentToEdit);
            $scope.Release();
        },
        DiscardExit: function() {
            $scope.Release();
        },
        Delete: function() {
            MomentsCreationFunctional.DeleteMoment($scope.momentToEdit);
            $scope.Release();
        },
        MoveBack: function() {
            if ($scope.canMoveBack()) {
                $scope.momentToEdit.startAt -= 5;
                $scope.Actions.Refresh();
            }
        },
        MoveForward: function() {
            if ($scope.canMoveForward()) {
                $scope.momentToEdit.startAt += 5;
                $scope.Actions.Refresh();
            }
        },
        Play: function() {
            $scope.Actions.Refresh();
            PlayerFunctional.Play();
        },
        Stop: function() {
            PlayerFunctional.Stop();
            $scope.Actions.Refresh();
        },
        Refresh: function() {
            PlayerFunctional.SetProgress($scope.momentToEdit.startAt);
            UpdatePreviewInfo();
        },
        PreviewSwitch: function() {
            $scope.displayPreview ^= 1;
        },
        SetTypeTo: function(type) {
            if ($scope.momentToEdit.type == type) {
                return;
            }

            $scope.momentToEdit.type = type;
            $scope.momentToEdit.data = {};
            var momentType = $scope.momentToEdit.type;
            if (momentType == 'random') {
                momentType = 'cycle';
            }
            switch (momentType) {
                case 'singleColor':
                {
                    $scope.selectedColor = tinycolor('#ee0000').toHexString();
                    $scope.ChangedColor = function () {
                        $scope.momentToEdit.data.color = tinycolor($scope.selectedColor).toRgb();
                    };
                    $scope.ChangedColor();
                    break;
                }
                case 'colorToColor':
                {
                    $scope.selectedColor1 = tinycolor('#ee0000').toHexString();
                    $scope.selectedColor2 = tinycolor('#0000ee').toHexString();
                    $scope.ChangedColor1 = function () {
                        $scope.momentToEdit.data.color1 = tinycolor($scope.selectedColor1).toRgb();
                    };
                    $scope.ChangedColor1();
                    $scope.ChangedColor2 = function () {
                        $scope.momentToEdit.data.color2 = tinycolor($scope.selectedColor2).toRgb();
                    };
                    $scope.ChangedColor2();
                    break;
                }
                case 'cycle':
                {
                    var lastIndex = 0;
                    $scope.selectedColors = [];
                    $scope.ChangedColor = function () {
                        $scope.momentToEdit.data.colors = $scope.selectedColors.map(function (HexColor) {
                            return tinycolor(HexColor.color).toRgb();
                        });
                    };
                    $scope.ChangedColor();

                    $scope.AddColor = function (color) {
                        if ($scope.selectedColors.length > 8) {
                            return;
                        }

                        color = color || '#ee0000';
                        lastIndex++;
                        $scope.selectedColors.push({
                            id: lastIndex,
                            color: tinycolor(color).toHexString()
                        });
                        $scope.ChangedColor();
                    };
                    $scope.AddColor('#ee0000');
                    $scope.AddColor('#00ee00');
                    $scope.AddColor('#0000ee');

                    $scope.DeleteColor = function (index) {
                        if ($scope.selectedColors.length <= 1) {
                            return;
                        }
                        $scope.selectedColors.splice(index, 1);
                        $scope.ChangedColor();
                    };

                    $scope.momentToEdit.data.duration = 5;
                    $scope.momentToEdit.data.smoothness = 0;
                    $scope.ChangedDuration = function () {
                        if (isNaN($scope.momentToEdit.data.duration)
                            || Number($scope.momentToEdit.data.duration) !== $scope.momentToEdit.data.duration
                            || $scope.momentToEdit.data.duration % 1 !== 0) {
                            $scope.momentToEdit.data.duration = 5;
                            return;
                        }
                        if ($scope.momentToEdit.data.duration < 5) {
                            $scope.momentToEdit.data.duration = 5;
                            return;
                        }
                        if ($scope.momentToEdit.data.duration > 999) {
                            $scope.momentToEdit.data.duration = 999;
                            return;
                        }
                    };
                    break;
                }
                case 'colorPlusBlink':
                {
                    $scope.selectedColor1 = tinycolor('#000000').toHexString();
                    $scope.selectedColor2 = tinycolor('#eeeeee').toHexString();
                    $scope.ChangedColor1 = function () {
                        $scope.momentToEdit.data.color1 = tinycolor($scope.selectedColor1).toRgb();
                    };
                    $scope.ChangedColor1();
                    $scope.ChangedColor2 = function () {
                        $scope.momentToEdit.data.color2 = tinycolor($scope.selectedColor2).toRgb();
                    };
                    $scope.ChangedColor2();
                    $scope.momentToEdit.data.blinkProbability = 10;
                    break;
                }
                case 'wave':
                {
                    $scope.selectedColor1 = tinycolor('#000000').toHexString();
                    $scope.selectedColor2 = tinycolor('#eeeeee').toHexString();
                    $scope.ChangedColor1 = function () {
                        $scope.momentToEdit.data.color1 = tinycolor($scope.selectedColor1).toRgb();
                    };
                    $scope.ChangedColor1();
                    $scope.ChangedColor2 = function () {
                        $scope.momentToEdit.data.color2 = tinycolor($scope.selectedColor2).toRgb();
                    };
                    $scope.ChangedColor2();
                    $scope.momentToEdit.data.type = 'xRay';
                    break;
                }
                default:
                    break;
            }
        }
    };
    $scope.canMoveBack = function() {
        if ($scope.momentToEdit) {
            $scope.momentToEdit.startAt -= 5;
            var result = false;
            if (MomentsCreationFunctional.CanSetMoment($scope.momentToEdit)) {
                result = true;
            }
            $scope.momentToEdit.startAt += 5;
            return result;
        }
    };
    $scope.canMoveForward = function() {
        if ($scope.momentToEdit) {
            $scope.momentToEdit.startAt += 5;
            var result = false;
            if (MomentsCreationFunctional.CanSetMoment($scope.momentToEdit)) {
                result = true;
            }
            $scope.momentToEdit.startAt -= 5;
            return result;
        }
    };
    $scope.IsPlaying = function() {
        return PlayerFunctional.IsPlaying();
    };

    $scope.Filters = {
        mm_ss_ms: function(time) {
            var mm = Math.floor(time/6000);
            var ss = Math.floor(time % 6000 / 100);
            var ms = time % 100;

            var ans = "";

            if (mm < 10) {
                ans += "0";
            }
            ans += mm + ":";
            if (ss < 10) {
                ans += "0";
            }
            ans += ss + ".";
            if (ms < 10) {
                ans += "0";
            }
            ans += ms;
            return ans;
        }
    };


    $scope.MomentTypes = MomentsCreationFunctional.GetDisplayTypesList();
    /*
    $scope.someColor = '#ee0000';
    $scope.$watch('someColor', function() {
        console.log(tinycolor($scope.someColor).toRgb());
    });
    */
});