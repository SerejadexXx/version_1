var module = angular.module('adminApp');

module.factory('PlayerFunctional', function($rootScope, Upload) {
    var _selectedAudio = null;
    var _duration = 0;
    var _active = false;
    var _mockingTime = 0;
    var _players = ['idSelectedAudio', 'idSelectedAudioCopy'];
    var _use = 0;

    var _savedProgress;

    this.UseCopy = function() {
        if (_use == 1) {
            console.log('Warning, calling copy player when using copy');
            return;
        }
        this.Stop();
        _savedProgress = this.GetProgress();

        _use = 1;
        this.SetProgress(0);
    };
    this.UseMain = function() {
        if (_use == 0) {
            console.log('Warning, calling main player when using main');
            return;
        }
        this.Stop();

        _use = 0;
        this.SetProgress(_savedProgress);
    };

    this.Init = function(audio) {
        _selectedAudio = audio;
        if (_selectedAudio) {
            Upload.mediaDuration(_selectedAudio).then(function (durationInSeconds) {
                _duration = durationInSeconds;
                $rootScope.$broadcast('PlayerNewAudioUploaded', {});
            });
        } else {
            _duration = 0;
            $rootScope.$broadcast('PlayerNewAudioUploaded', {});
        }
    };
    this.GetLength = function() {
        return _duration;
    };
    this.Play = function() {
        if (!_active && _selectedAudio) {
            _active = true;
            var player = document.getElementById(_players[_use]);
            player.play();
        }
    };
    this.Stop = function() {
        if (_active) {
            _active = false;
            var player = document.getElementById(_players[_use]);
            player.pause();
        }
    };
    this.IsPlaying = function() {
        return _active;
    };
    this.SetProgress = function(timeToPlay) {
        if (_selectedAudio) {
            var player = document.getElementById(_players[_use]);
            player.currentTime = timeToPlay / 100;
        } else {
            _mockingTime = timeToPlay;
        }
    };
    this.GetProgress = function() {
        if (_selectedAudio) {
            var player = document.getElementById(_players[_use]);
            return Math.floor(player.currentTime * 100);
        }
        return _mockingTime;
    };
    return this;
});

module.controller('playerCtrl', function($scope, $rootScope, $interval, TemporaryStorageFunctional, PlayerFunctional, MomentsCreationFunctional) {
    $scope.$on('$destroy', function() {
        $interval.cancel(intervalPromise);
        $scope.Actions.Stop();
    });
    var _UpdateAudio = function() {
        $scope.selectedAudio = TemporaryStorageFunctional.GetProp('selectedAudio');
        PlayerFunctional.Init($scope.selectedAudio);
    };
    _UpdateAudio();
    $scope.$on('TemporaryStorageUpdateOn_selectedAudio', function() {
        _UpdateAudio();
    });

    $scope.IsPlaying = function() {
        return PlayerFunctional.IsPlaying();
    };

    $scope.previewOn = false;
    $scope.previewInfo = {
        orientation: 'vertical',
        moments: MomentsCreationFunctional.GetMoments(),
        totalLength: MomentsCreationFunctional.GetTotalLength(),
        currentProgress: PlayerFunctional.GetProgress()
    };
    $scope.$on('someMomentChanged', function() {
        $scope.previewInfo.moments = MomentsCreationFunctional.GetMoments();
        $scope.previewInfo.totalLength = MomentsCreationFunctional.GetTotalLength();
        $scope.previewInfo.currentProgress = PlayerFunctional.GetProgress();
        $scope.saveBox = 'dirty';
    });
    var intervalPromise = $interval(function() {
        $scope.previewInfo.currentProgress = PlayerFunctional.GetProgress();
    }, 10);
    $scope.IsPreviewOn = function() {
        return $scope.previewOn;
    };

    var watcher = null;
    $scope.saveBox = 'none';

    $scope.Actions = {
        Play: function() {
            PlayerFunctional.Play();
            watcher = $interval(function() {
                console.log('I am still here');
                if (PlayerFunctional.GetProgress() >= Math.floor(PlayerFunctional.GetLength() * 100) - 0.0001) {
                    $scope.Actions.Stop();
                }
            }, 10);
        },
        Stop: function() {
            PlayerFunctional.Stop();
            $interval.cancel(watcher);
        },
        AddMoment: function() {
            $rootScope.$broadcast('createNewMoment', {});
        },
        PreviewSwitch: function() {
            $scope.previewOn = ($scope.previewOn ^ 1);
        },
        SaveData: function() {
            var success = function() {
                $scope.saveBox = 'success';
            };
            var fail = function() {
                $scope.saveBox = 'fail';
            };
            $scope.saveBox = 'waiting';
            MomentsCreationFunctional.SaveData(success, fail);
        }
    };
});