var module = angular.module('TimeSyncService', []);

module.service('TimeSyncFunctional', function($http, $timeout) {
    var _intervals = [];

    var turnedOff = false;
    var turnedOffConfirmed = false;
    this.TurnOffAutoSync = function() {
        turnedOff = true;
        turnedOffConfirmed = false;
    };

    var _PutTimeUpdater = function() {
        var success = function(response) {
            var finishAt = Date.now();
            _AddTimeStamp({
                startAt: startAt,
                finishAt: finishAt,
                serverTime: response.data.currentTime
            });
            if (!turnedOff) {
                $timeout(_PutTimeUpdater, 600);
            } else {
                turnedOffConfirmed = true;
            }
        };
        var fail = function() {
            if (!turnedOff) {
                $timeout(_PutTimeUpdater, 600);
            } else {
                turnedOffConfirmed = true;
            }
        };
        var startAt = Date.now();
        $http.get('/api/clients/catchTime').then(success, fail);
    };
    _PutTimeUpdater();

    var _GetExpectedDifference = function() {
        if (_intervals.length == 0) {
            return 0;
        }
        var Min = _intervals[0].left;
        var Max = _intervals[0].right;
        for (var i = 1; i < _intervals.length; i++) {
            Min = Math.max(Min, _intervals[i].left);
            Max = Math.min(Max, _intervals[i].left);
        }

        // TODO should be something smarter
        return Min + (Max - Min) / 2;
    };

    var _CheckIntervals = function() {
        var Min = _intervals[0].left;
        var Max = _intervals[0].right;
        for (var i = 1; i < _intervals.length; i++) {
            Min = Math.max(Min, _intervals[i].left);
            Max = Math.min(Max, _intervals[i].left);
        }
        if (Min > Max) {
            return false;
        }
        return true;
    };

    var _AddInterval = function(interval) {
        console.log(interval);
        _intervals.push(interval);
        while (_intervals.length > 10 && !_CheckIntervals()) {
            _intervals.splice(0, 1);
        }
    };

    this.GetTime = function() {
        return Date.now() + _GetExpectedDifference();
    };

    this.AddTimeStamp = function(stamp) {
        var serverTime = stamp.serverTime;
        var startAt = stamp.startAt;
        var finishAt = stamp.finishAt;
        var duration = finishAt - startAt;
        var maximalDifference = serverTime - startAt;
        var minimalDifference = serverTime - finishAt;
        _AddInterval({
            left: minimalDifference,
            right: maximalDifference
        });
    };
    var _AddTimeStamp = this.AddTimeStamp;
    return this;
});