var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id: {
        type: String,
        index: true
    },
    name: String,
    startAt: String,
    duration: String,
    moments: Object,
    createdAt: String
});

module.exports = schema;
