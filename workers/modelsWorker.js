var UserSchema = require('./../models/userSchema.js');
var EventSchema = require('./../models/eventSchema.js');

module.exports = function(db) {
    return {
        User: db.model('User', UserSchema),
        Event: db.model('Event', EventSchema)
    };
};