var apn = require('apn');
var fs = require('fs');

var certPem = fs.readFileSync('./certs/cert.pem', encoding='ascii');
var keyPem = fs.readFileSync('./certs/key.pem', encoding='ascii');

var API_PREFIX = '/api/pushup/';

module.exports = {
    createPushupWorker: function(app, Models, __dirname) {
        var Tokens = Models.Token;

        var options = {
            "cert": certPem,
            "key":  keyPem,
            "passphrase": "0000",
            "gateway": "gateway.sandbox.push.apple.com",
            "port": 2195,
            "enhanced": true,
            "cacheLength": 5,
            "batchFeedback": true,
            "interval": 300
        };
        var apnConnection = new apn.Connection(options);

        var apnFeedback = new apn.Feedback(options);
        apnFeedback.on("feedback", function(devices) {
            devices.forEach(function(item) {
                Tokens.remove({value: item.device}, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });

        app.post(API_PREFIX + 'newToken', function(req, res) {
            var data = req.body;
            if (!data.token || !data.eventId) {
                res.sendStatus(403);
                return;
            }

            var token = new Tokens({
                value: data.token,
                eventId: data.eventId
            });
            token.save(function(err, newUser) {
                if (err) {
                    res.sendStatus(403);
                } else {
                    res.sendStatus(200);
                }
            });
        });

        this.Send = function(eventId) {
            Tokens.find({id: eventId}, function(err, tokens) {
                if (err) {
                    console.log(err);
                }
                Tokens.remove({id: eventId}, function(err) {
                    if (err) {
                        console.log(err);
                    }

                    var note = new apn.notification();
                    note.setAlertText('Event is coming, are you ready?');

                    apnConnection.pushNotification(note, tokens.map(function(event) {
                        return event.value;
                    }));
                });
            });
        };

        return this;
    }
};