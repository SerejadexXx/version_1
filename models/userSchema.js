var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    login: String,
    password: String
});

module.exports = schema;
