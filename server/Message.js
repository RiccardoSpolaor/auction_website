"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newMessage = exports.getModel = exports.isMessage = exports.getSchema = void 0;
const mongoose = require("mongoose");
// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// We use Mongoose to perform the ODM between our application and
// mongodb. To do that we need to create a Schema and an associated
// data model that will be mapped into a mongodb collection
//
// Type checking cannot be enforced at runtime so we must take care
// of correctly matching the Message interface with the messageSchema 
//
// Mongoose Schema
var messageSchema = new mongoose.Schema({
    content: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    responses: [{
            content: {
                type: [mongoose.SchemaTypes.String],
                required: true
            },
            author: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'User',
                required: true
            },
            timestamp: {
                type: mongoose.SchemaTypes.Date,
                required: true
            }
        }],
    private: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false
    },
});
function getSchema() { return messageSchema; }
exports.getSchema = getSchema;
function isMessage(arg) {
    return arg && arg.content && typeof (arg.content) == 'string'
        && arg.author && typeof (arg.author) == 'string'
        && arg.timestamp && arg.timestamp instanceof Date;
}
exports.isMessage = isMessage;
// Mongoose Model
var messageModel; // This is not exposed outside the model
function getModel() {
    if (!messageModel) {
        messageModel = mongoose.model('Message', getSchema());
    }
    return messageModel;
}
exports.getModel = getModel;
function newMessage(data) {
    var messagemodel = getModel();
    var message = new messagemodel(data);
    return message;
}
exports.newMessage = newMessage;
//# sourceMappingURL=Message.js.map