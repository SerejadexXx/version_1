var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    deviceType: String,
    value: String,
    eventId: String
});

module.exports = schema;
