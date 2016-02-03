var API_PREFIX = '';

var jwt = require('jsonwebtoken');

module.exports = {
    createAdminWorker: function(app, Models, __dirname) {
        var Events = Models.Event;
        var Users = Models.User;

        app.get('/admin', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            res.sendFile(__dirname + '/public/admin.html');
        });

        app.get('/admin/login', function(req, res) {
            if (req.decodedToken != 'fail') {
                res.redirect('/admin');
                return;
            }
            res.sendFile(__dirname + '/public/admin.html');
        });

        app.get('/admin/songChooser', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var eventId = req.query.eventId;
            Events.find({id: eventId}, function(err, events) {
                if (err) {
                    console.log(err);
                }
                if (events.length > 0) {
                    res.sendFile(__dirname + '/public/admin.html');
                } else {
                    res.redirect('/admin');
                }
            });
        });

        app.get('/admin/showCreation', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var eventId = req.query.eventId;
            Events.find({id: eventId}, function(err, events) {
                if (err) {
                    console.log(err);
                }
                if (events.length > 0) {
                    res.sendFile(__dirname + '/public/admin.html');
                } else {
                    res.redirect('/admin');
                }
            });
        });

        app.get('/admin/showPlanning', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var eventId = req.query.eventId;
            Events.find({id: eventId}, function(err, events) {
                if (err) {
                    console.log(err);
                }
                if (events.length > 0) {
                    res.sendFile(__dirname + '/public/admin.html');
                } else {
                    res.redirect('/admin');
                }
            });
        });

        app.get('/admin/countdown', function(req, res) {
            if (req.decodedToken == 'fail') {
                res.redirect('/admin/login');
                return;
            }
            var eventId = req.query.eventId;
            Events.find({id: eventId}, function(err, events) {
                if (err) {
                    console.log(err);
                }
                if (events.length > 0) {
                    res.sendFile(__dirname + '/public/admin.html');
                } else {
                    res.redirect('/admin');
                }
            });
        });

        app.post('/api/signIn', function(req, res) {
            var data = req.body;
            var login = data.login;
            var password = data.password;
            Users.find({login: login}, function(err, users) {
                if (users.length > 0) {
                    res.sendStatus(400);
                } else {
                    var user = new Users({
                        login: login,
                        password: password
                    });
                    user.save(function(err, newUser) {
                        if (err) {
                            console.log(err);
                        }
                        var token = jwt.sign(newUser, app.get('superSecret'), {
                            expiresInMinutes: 1440
                        });
                        res.json({
                            token: token
                        });
                    });
                }
            });
        });

        app.post('/api/login', function(req, res) {
            var data = req.body;
            var login = data.login;
            var password = data.password;
            Users.find({login: login}, function(err, users) {
                if (users.length == 0 || users[0].password != password) {
                    res.sendStatus(403);
                } else {
                    var token = jwt.sign(users[0], app.get('superSecret'), {
                        expiresInMinutes: 1440
                    });
                    res.json({
                        token: token
                    });
                }
            });
        });

        return this;
    }
};