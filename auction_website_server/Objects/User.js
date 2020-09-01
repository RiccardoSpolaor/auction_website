"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newUser = exports.getModel = exports.getSchema = void 0;
const mongoose = require("mongoose");
const crypto = require("crypto");
// Mongoose Schema
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
        unique: true,
        sparse: true
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
userSchema.methods.setPassword = function (pwd) {
    this.salt = crypto.randomBytes(16).toString('hex');
    var hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest('hex');
};
userSchema.methods.validatePassword = function (pwd) {
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
var userModel;
function getModel() {
    if (!userModel) {
        userModel = mongoose.model('User', getSchema());
    }
    return userModel;
}
exports.getModel = getModel;
function newUser(data) {
    var usermodel = getModel();
    var user = new usermodel(data);
    return user;
}
exports.newUser = newUser;
//# sourceMappingURL=User.js.map