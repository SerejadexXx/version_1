var crypto = require('crypto');
var uuid = require('node-uuid');

var API_PREFIX = '/api/clients/';

module.exports = {
    createClientsWorker: function(app, Models, configConstants,__dirname) {
        var pushupWorker = require('./pushupWorker').createPushupWorker(app, Models, __dirname);

        var GetHash = function(val) {
            return crypto.createHash('md5').update(val).digest('hex');
        };

        var _events = [];
        var _eventsHash = GetHash(JSON.stringify(_events));

        // separated events from start time
        var _events_v2 = [];
        var _eventsHash_v2 = GetHash(JSON.stringify(_events_v2));
        var _startAts_v2 = [];
        var _startAtsHash_v2 = GetHash(JSON.stringify(_startAts_v2));

        var Events = Models.Event;
        var fetchFromDB = function() {
            Events.find({
                    $and: [{
                        startAt: {$ne: 'Draft'}
                    }, {
                        startAt: {$ne: null}
                    }]
                },
                function(err, events) {
                    if (err) {
                        console.log(err);
                    }
                    _events = events;
                    _eventsHash = GetHash(JSON.stringify(_events));


                    _startAts_v2 = events.map(function(event) {
                        return {
                            startAt: event.startAt,
                            id: event.id
                        };
                    });
                    _startAtsHash_v2 = GetHash(JSON.stringify(_startAts_v2));
                    _events_v2 = events.map(function(event) {
                        var newEvent = JSON.parse(JSON.stringify(event));
                        newEvent.startAt = null;
                        return newEvent;
                    });
                    _eventsHash_v2 = GetHash(JSON.stringify(_events_v2));
                });
        };
        setInterval(fetchFromDB, 5000);


        app.post(API_PREFIX + 'sendPushUps', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var data = req.body;
            if (!data.eventId) {
                res.sendStatus(403);
                return;
            }

            pushupWorker.Send(data.eventId);
            res.sendStatus(200);
        });

        app.get('/', function(req, res) {
            res.sendFile(__dirname + '/public/client.html');
        });
        app.get(API_PREFIX + 'catchUpdates', function(req, res) {
            var localData = JSON.parse(req.query.localData || "{}");
            var id = localData.id;
            var data = {};
            if (!id) {
                id = uuid.v4();
            }
            data.id = id;
            if (localData.eventListHash != _eventsHash) {
                data.eventListHash = _eventsHash;
                data.eventList = _events;
            }

            data.currentTime = Date.now();

            res.send(data);
        });
        app.get(API_PREFIX + 'catchUpdates_v2', function(req, res) {
            var localData = JSON.parse(req.query.localData || "{}");
            var id = localData.id;
            var data = {};
            if (!id) {
                id = uuid.v4();
            }
            data.id = id;
            if (localData.eventListHash != _eventsHash_v2) {
                data.eventListHash = _eventsHash_v2;
                data.eventList = _events_v2;
            }

            if (localData.startAtHash != _startAtsHash_v2) {
                data.startAtHash = _startAtsHash_v2;
                data.startAtList = _startAts_v2;
            }

            data.currentTime = Date.now();
            data.nextUpdate = configConstants.defaultUpdateInterval;

            res.send(data);
        });
        app.get(API_PREFIX + 'catchTime', function(req, res) {
            var data = {};
            data.currentTime = Date.now();

            res.send(data);
        });
        return this;
    }
};