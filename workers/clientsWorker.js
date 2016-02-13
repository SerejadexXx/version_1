var crypto = require('crypto');
var uuid = require('node-uuid');

var API_PREFIX = '/api/clients/';

module.exports = {
    createClientsWorker: function(app, Models, __dirname) {
        var pushupWorker = require('./pushupWorker').createPushupWorker(app, Models, __dirname);

        var GetHash = function(val) {
            return crypto.createHash('md5').update(val).digest('hex');
        };

        var _events = [];
        var _eventsHash = GetHash(JSON.stringify(_events));

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
                _events.forEach(function(event) {
                    var timeToStart = Date.now() - (new Date(Number(event.startAt))).getTime();
                    if ((timeToStart > 5 * 60 * 1000) && (timeToStart < 10 * 60 * 1000)) {
                        pushupWorker.Send(event.id);
                    }
                });
            });
        };
        setInterval(fetchFromDB, 5000);

        app.get('/', function(req, res) {
            res.sendFile(__dirname + '/public/client.html');
        });
        app.get(API_PREFIX + 'catchUpdates', function(req, res) {
            var localData = JSON.parse(req.query.localData);
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
        app.get(API_PREFIX + 'catchTime', function(req, res) {
            var data = {};
            data.currentTime = Date.now();

            res.send(data);
        });
        return this;
    }
};