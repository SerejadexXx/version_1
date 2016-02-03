var express = require('express');
    app = express(),
    server = require('http').createServer(app),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken');

var superSecret = 'PutinLALALA';
app.set('superSecret', superSecret);
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/flareTest');
var Models = require('./workers/modelsWorker.js')(db);

var favicon = require('serve-favicon');
var fs = require('fs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    req.decodedToken = 'fail';
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
            } else {
                req.decodedToken = decoded;
            }
            next();
        });
    } else {
        next();
    }
});


var eventsWorker = require('./workers/eventWorker').createEventWorker(app, Models);
var adminWorker = require('./workers/adminWorker').createAdminWorker(app, Models, __dirname);
var clientsWorker = require('./workers/clientsWorker').createClientsWorker(app, Models, __dirname);

server.listen(20029);