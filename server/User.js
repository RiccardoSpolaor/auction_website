"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newUser = exports.isMod = exports.isCorrectUpdate = exports.isUser = exports.getModel = exports.getSchema = void 0;
const mongoose = require("mongoose");
const crypto = require("crypto");
var userSchema = new mongoose.Schema({
    mod: {
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
    },
    validated: {
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
    },
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    name: {
        type: mongoose.SchemaTypes.String,
        required: function () { return !this.mod; }
    },
    surname: {
        type: mongoose.SchemaTypes.String,
        required: function () { return !this.mod; }
    },
    mail: {
        type: mongoose.SchemaTypes.String,
        required: function () { return !this.mod; },
        unique: true
    },
    location: {
        type: mongoose.SchemaTypes.String,
        required: false,
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest: {
        type: mongoose.SchemaTypes.String,
        required: false
    }
});
// Here we add some methods to the user Schema
userSchema.methods.setPassword = function (pwd) {
    this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt
    // We use the hash function sha512 to hash both the password and salt to
    // obtain a password digest 
    // 
    // From wikipedia: (https://en.wikipedia.org/wiki/HMAC)
    // In cryptography, an HMAC (sometimes disabbreviated as either keyed-hash message 
    // authentication code or hash-based message authentication code) is a specific type 
    // of message authentication code (MAC) involving a cryptographic hash function and 
    // a secret cryptographic key.
    //
    var hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
};
userSchema.methods.validatePassword = function (pwd) {
    // To validate the password, we compute the digest with the
    // same HMAC to check if it matches with the digest we stored
    // in the database.
    //
    var hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.digest === digest);
};
userSchema.methods.hasModRole = function () {
    return this.mod;
};
userSchema.methods.setMod = function () {
    if (!this.hasModRole())
        this.mod = true;
};
userSchema.methods.isValidated = function () {
    return this.validated;
};
userSchema.methods.validateUser = function () {
    if (!this.isValidated())
        this.validated = true;
};
function getSchema() { return userSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var userModel; // This is not exposed outside the model
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('User', getSchema());
    }
    return userModel;
}
exports.getModel = getModel;
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
}
function isUser(arg) {
    return arg && arg.username && typeof (arg.username) == 'string'
        && arg.name && typeof (arg.name) == 'string'
        && arg.surname && typeof (arg.surname) == 'string'
        && arg.mail && typeof (arg.mail) == 'string' && validateEmail(arg.mail)
        && arg.location && typeof (arg.location) == 'string'
        && arg.mod == undefined && arg.validated == undefined && arg.salt == undefined && arg.digest == undefined;
}
exports.isUser = isUser;
function isCorrectUpdate(arg) {
    return arg && (!arg.username || typeof (arg.username) == 'string')
        && (!arg.name || typeof (arg.name) == 'string')
        && (!arg.surname || typeof (arg.surname) == 'string')
        && (!arg.mail || (typeof (arg.mail) == 'string' && validateEmail(arg.mail)))
        && (!arg.location || typeof (arg.location) == 'string')
        && arg.mod == undefined && arg.validated == undefined && arg.salt == undefined && arg.digest == undefined;
}
exports.isCorrectUpdate = isCorrectUpdate;
function isMod(arg) {
    return arg && arg.username && typeof (arg.username) == 'string'
        && arg.mail == undefined && arg.name == undefined && arg.surname == undefined && arg.location == undefined
        && arg.mod == undefined && arg.validated == undefined && arg.salt == undefined && arg.digest == undefined;
}
exports.isMod = isMod;
function newUser(data) {
    var usermodel = getModel();
    var user = new usermodel(data);
    return user;
}
exports.newUser = newUser;
//# sourceMappingURL=User.js.map