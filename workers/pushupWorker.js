var apn = require('apn');
var gcm = require('node-gcm');
var fs = require('fs');

var certPem = fs.readFileSync('./certs/cert.pem', encoding='ascii');
var keyPem = fs.readFileSync('./certs/key.pem', encoding='ascii');

var androidSender = new gcm.Sender('AIzaSyDmmY4crcE3W0_ojkCC4qGQUm80hR6cBDE');

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
            if (!data.deviceType || !data.token || !data.eventId) {
                res.sendStatus(403);
                return;
            }

            var token = new Tokens({
                deviceType: data.deviceType,
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
            // ios PushUp
            Tokens.find({$and: [
                {"deviceType": 'ios'},
                {"eventId": eventId}
            ]}, function(err, tokens) {
                if (err) {
                    console.log(err);
                }
                Tokens.remove({$and: [
                    {"deviceType": 'ios'},
                    {"eventId": eventId}
                ]}, function(err) {
                    if (err) {
                        console.log(err);
                    }

                    var note = new apn.notification();
                    note.setAlertText('Event is coming, are you ready?');

                    if (tokens.length > 0) {
                        apnConnection.pushNotification(note, tokens.map(function (event) {
                            return event.value;
                        }));
                    }
                });
            });

            // android PushUp
            Tokens.find({$and: [
                {"deviceType": 'android'},
                {"eventId": eventId}
            ]}, function(err, tokens) {
                console.log(tokens);
                console.log(eventId);
                if (err) {
                    console.log(err);
                }
                Tokens.remove({$and: [
                    {"deviceType": 'android'},
                    {"eventId": eventId}
                ]}, function(err) {
                    if (err) {
                        console.log(err);
                    }

                    var message = new gcm.Message();
                    message.addNotification('Flare', 'Event is coming, are you ready?');

                    if (tokens.length > 0) {
                        androidSender.sendNoRetry(message, {
                            registrationTokens: tokens.map(function (event) {
                                return event.value;
                            })
                        }, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
            });
        };

        return this;
    }
};