var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    value: Buffer,
    eventId: String
});

module.exports = schema;
