var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    deviceType: String,
    value: Buffer,
    eventId: String
});

module.exports = schema;
