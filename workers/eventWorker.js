var uuid = require('node-uuid');

var API_PREFIX = '/api/events/';
var eventList = [];

module.exports = {
    createEventWorker: function(app, Models, configConstants) {
        var Events = Models.Event;
        var Users = Models.User;

        app.get(API_PREFIX + 'getList', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            Events.find({}, function(err, events) {
                if (err) {
                    console.log(err);
                    res.sendStatus(400);
                } else {
                    res.json({
                        eventList: events
                    });
                }
            });
        });
        app.post(API_PREFIX + 'addNew', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var event = new Events({
                id: uuid.v4(),
                name: null,
                subHeader: null,
                shortName: null,
                url: null,
                startAt: null,
                duration: null,
                moments: null,
                createdAt: Date.now()
            });
            event.save(function(err, newEvent) {
                if (err) {
                    console.log(err);
                }
                Events.find({}, function(err, events) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(400);
                    } else {
                        res.json({
                            eventList: events
                        });
                    }
                });
            });
        });
        app.post(API_PREFIX + 'delete', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            Events.remove({id: req.body.eventId}, function(err) {
                if (err) {
                    console.log(err);
                }
                Events.find({}, function(err, events) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(400);
                    } else {
                        res.json({
                            eventList: events
                        });
                    }
                });
            });
        });
        app.get(API_PREFIX + 'getMoments', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            Events.find({id: req.query.eventId}, function(err, events) {
                if (events.length == 0) {
                    res.sendStatus(404);
                } else {
                    res.json({
                        moments: events[0].moments
                    });
                }
            });
        });
        app.post(API_PREFIX + 'saveMoments', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var eventId = req.body.eventId;
            var moments = req.body.moments;

            Events.update({id: eventId}, {moments: moments}, function(err, numberAffected, rawResponse) {
                if (err) {
                    console.log(err);
                }
                res.sendStatus(202);
            });
        });
        app.get(API_PREFIX + 'getPlanInfo', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            Events.find({id: req.query.eventId}, function(err, events) {
                if (events.length == 0) {
                    res.sendStatus(404);
                } else {
                    res.json({
                        info: {
                            startAt: events[0].startAt,
                            duration: events[0].duration,
                            name: events[0].name,
                            subHeader: events[0].subHeader,
                            shortName: events[0].shortName,
                            url: events[0].url,
                            createdAt: events[0].createdAt
                        }
                    });
                }
            });
        });
        app.post(API_PREFIX + 'savePlanInfo', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var eventId = req.body.eventId;
            var info = req.body.info;
            Events.update({
                id: eventId
            }, {
                startAt: info.startAt,
                duration: info.duration,
                name: info.name,
                subHeader: info.subHeader,
                shortName: info.shortName,
                url: info.url,
                createdAt: info.createdAt
            }, function(err, numberAffected, rawResponse) {
                if (err) {
                    console.log(err);
                }
                res.sendStatus(202);
            });
        });
        app.post(API_PREFIX + 'saveUpdateInterval', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var updateInterval = req.body.updateInterval;
            if (updateInterval == null || !(updateInterval >= 600)) {
                updateInterval = 600;
            }
            configConstants.defaultUpdateInterval = updateInterval;
            res.sendStatus(202);
        });

        return this;
    }
};