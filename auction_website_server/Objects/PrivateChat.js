"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = void 0;
const mongoose = require("mongoose");
const message = require("./Message");
// Mongoose Schema
var privateChatSchema = new mongoose.Schema({
    insertion_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Insertion',
        required: true,
        immutable: true
    },
    insertionist: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
    },
    sender: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
    },
    messages: {
        type: [message.getSchema()],
        required: true
    },
    insertionistRead: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false
    },
    senderRead: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: true
    },
});
privateChatSchema.index({ insertion_id: 1, sender: 1 }, { unique: true });
function getSchema() { return privateChatSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var privateChatModel;
function getModel() {
    if (!privateChatModel) {
        privateChatModel = mongoose.model('PrivateChat', getSchema());
    }
    return privateChatModel;
}
exports.getModel = getModel;
//# sourceMappingURL=PrivateChat.js.map