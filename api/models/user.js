var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema({
	email: {type: String, unique: true, sparse: true, trim: true},
	reg_email: {type: String, unique: true, sparse: true, trim: true},
    blocked: Boolean,
	is: {},
	password: {type: String},
	avatarUrl: {type: String, default: '/api/user/default.png'},
	name: {type: String},
	data: {},
    tempAccessToken: String
}, {minimize: false});
schema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
schema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', schema);