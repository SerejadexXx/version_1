var UserSchema = require('./../models/userSchema.js');
var EventSchema = require('./../models/eventSchema.js');
var TokenSchema = require('./../models/tokenSchema.js');

module.exports = function(db) {
    return {
        User: db.model('User', UserSchema),
        Event: db.model('Event', EventSchema),
        Token: db.model('Token', TokenSchema)
    };
};