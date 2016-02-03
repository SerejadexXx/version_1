var module = angular.module('adminApp');

module.factory('MomentsCreationFunctional', function($rootScope, $http, $timeout, NavigationFunctional) {
    var _types = [
        'singleColor',
        'colorToColor',
        'cycle',
        'random',
        'colorPlusBlink',
        'wave'
    ];
    this.GetDisplayTypesList = function() {
        var types = [];
        types.push(
            {
                type: 'singleColor',
                name: 'Single Color'
            },
            {
                type: 'colorToColor',
                name: 'Color to Color'
            },
            {
                type: 'cycle',
                name: 'Cycle'
            },
            {
                type: 'random',
                name: 'Random'
            },
            {
                type: 'colorPlusBlink',
                name: 'Color With Blink'
            },
            {
                type: 'wave',
                name: 'Wave'
            });
        return types;
    };
    var _moments = [];
    var _getId = function() {
        var id = '#';
        for (var i = 0; i < 20; i++) {
            id += ('n' + Math.floor(Math.random()*1000));
        }
        return id;
    };
    var _totalLength = 6000;
    var dataLoaded = false;

    var CreateDefaultMoment = function(progress) {
        return {
            id: _getId(),
            startAt: progress,
            type: _types[0],
            data: {
                color: tinycolor('#ee0000').toRgb()
            }
        }
    };

    this.CreateDefaultMoment = function(progress) {
        return CreateDefaultMoment(progress);
    };
    this.Init = function() {
        dataLoaded = false;
        _moments = [];
        _moments.push(this.CreateDefaultMoment(0));
        var SuccessfulDownload = function(response) {
            _moments = response.data.moments;
            if (!_moments) {
                _moments = [];
                _moments.push(CreateDefaultMoment(0));
            }
            $rootScope.$broadcast('someMomentChanged', {});
            dataLoaded = true;
        };
        var UnsuccessfulDownload = function(response) {
            if (response.status != 404) {
                $timeout(fetch, 5000);
            }
        };
        var fetch = function() {
            $http.get('/api/events/getMoments', {params: {eventId: NavigationFunctional.Params().eventId}}).then(
                SuccessfulDownload,
                UnsuccessfulDownload
            );
        };
        fetch();
    };

    this.SaveData = function(success, fail) {
        $http.post('/api/events/saveMoments', {
            eventId: NavigationFunctional.Params().eventId,
            moments: _moments
        }).then(
            success,
            fail
        );
    };

    // length of show in milliseconds
    this.SetTotalLength = function(totalLength) {
        _totalLength = totalLength;
    };
    this.GetTotalLength = function() {
        return _totalLength;
    };
    this.Init();

    var _AreMomentsCorrect = function(moments) {
        if (moments[0].startAt != 0) {
            return false;
        }
        for (var i = 0, j = 0; i < moments.length; i++) {
            if (i > 0) {
                if (moments[i].startAt <= moments[i - 1].startAt) {
                    return false;
                }
            }
            while (Math.floor(moments[i].startAt / 100) > Math.floor(moments[j].startAt / 100)) {
                j++;
            }
            if (i - j > 2) {
                return false;
            }
        }
        if (moments[moments.length - 1].startAt >= _totalLength) {
            return false;
        }
        return true;
    };

    this.LeastMomentsAtSecond = function(progress) {
        var count = 0;
        for (var i = 0; i < _moments.length; i++) {
            if (Math.floor(_moments[i].startAt / 100) == Math.floor(progress / 100) && _moments[i].startAt < progress) {
                count++;
            }
        }
        return count;
    };

    this.AddMomentByProgress = function(progress) {
        if (!dataLoaded) {
            return;
        }
        var dummyMoments;
        for (var i = 0; i < _moments.length; i++) {
            if (_moments[i].startAt > progress) {
                dummyMoments = JSON.parse(JSON.stringify(_moments));
                dummyMoments.splice(i, 0, this.CreateDefaultMoment(progress));
                if (_AreMomentsCorrect(dummyMoments)) {
                    _moments = JSON.parse(JSON.stringify(dummyMoments));
                    $rootScope.$broadcast('someMomentChanged', {});
                    return true;
                }
                return false;
            }
            if (_moments[i].startAt == progress) {
                return false;
            }
        }
        dummyMoments = JSON.parse(JSON.stringify(_moments));
        dummyMoments.push(this.CreateDefaultMoment(progress));
        if (_AreMomentsCorrect(dummyMoments)) {
            _moments = JSON.parse(JSON.stringify(dummyMoments));
            $rootScope.$broadcast('someMomentChanged', {});
            return true;
        }
        return false;
    };

    this.DeleteMoment = function(moment) {
        if (!dataLoaded) {
            return;
        }
        _moments = _moments.filter(function(val) {
            return val.id != moment.id;
        });
        $rootScope.$broadcast('someMomentChanged', {});
    };

    this.GetMomentById = function(id) {
        var moment = _moments.filter(function(val) {
            return val.id == id;
        });
        if (moment.length == 0) {
            return {};
        } else {
            return JSON.parse(JSON.stringify(moment[0]));
        }
    };

    this.GetMomentByProgress = function(progress) {
        for (var i = 0; i + 1 < _moments.length; i++) {
            if (progress < _moments[i + 1].startAt) {
                return _moments[i].id;
            }
        }
        return _moments[_moments.length - 1].id;
    };

    this.GetMomentEnd = function(moment) {
        for (var i = 0; i + 1 < _moments.length; i++) {
            if (_moments[i].id == moment.id) {
                return _moments[i + 1].startAt;
            }
        }
        return _totalLength;
    };

    var SetMoment = function(newMoment) {
        _moments = _moments.map(function(val) {
            if (val.id != newMoment.id) {
                return val;
            } else {
                return newMoment;
            }
        });
    };

    this.SetMoment = function(newMoment) {
        if (!dataLoaded) {
            return;
        }
        SetMoment(newMoment);
        $rootScope.$broadcast('someMomentChanged', {});
    };

    this.CanSetMoment = function(newMoment) {
        if (!dataLoaded) {
            return;
        }
        var dummyMoments = JSON.parse(JSON.stringify(_moments));
        SetMoment(newMoment);
        var result = false;
        if (_AreMomentsCorrect(_moments)) {
            result = true;
        }
        _moments = JSON.parse(JSON.stringify(dummyMoments));
        return result;
    };

    this.GetMoments = function() {
        return _moments;
    };

    return this;
});

module.controller('momentsCreationCtrl', function($scope, $rootScope, $interval, PlayerFunctional, MomentsCreationFunctional) {
    $scope.$on('$destroy', function() {
        $interval.cancel(intervalPromise);
    });
    MomentsCreationFunctional.Init();
    $scope.moments = MomentsCreationFunctional.GetMoments();
    $scope.$on('someMomentChanged', function() {
        $scope.moments = MomentsCreationFunctional.GetMoments();
    });

    $scope.activeId = null;
    var intervalPromise = $interval(function() {
        var progressByPlayer = PlayerFunctional.GetProgress();
        $scope.activeId = MomentsCreationFunctional.GetMomentByProgress(progressByPlayer);
    }, 10);

    $scope.$on('createNewMoment', function() {
        var progress = PlayerFunctional.GetProgress();
        MomentsCreationFunctional.AddMomentByProgress(progress);
        $scope.moments = MomentsCreationFunctional.GetMoments();
    });

    $scope.Actions = {
        DeleteMoment: function(moment) {
            $scope.activeId = null;
            MomentsCreationFunctional.DeleteMoment(moment);
        },
        EditMoment: function(moment) {
            PlayerFunctional.UseCopy();
            $rootScope.$broadcast('momentToEdit', {momentToEdit: moment.id});
        },
        MoveToMoment: function(moment) {
            PlayerFunctional.SetProgress(moment.startAt);
        }
    };

    $scope.ProgressToTopPosition = function(progress) {
        return Math.floor(progress / 5);
    };
    $scope.ProgressToLeftPosition = function(progress) {
        return MomentsCreationFunctional.LeastMomentsAtSecond(progress) * 320 + 160 * (Math.floor(progress / 100) % 2);
    };
});