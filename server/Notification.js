"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = void 0;
const mongoose = require("mongoose");
var notificationSchema = new mongoose.Schema({
    content: {
        type: mongoose.SchemaTypes.String,
    },
    to: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        immutable: true
    },
    insertion: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Insertion',
        required: true
    },
    read: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    }
});
function getSchema() { return notificationSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var notificationModel; // This is not exposed outside the model
function getModel() {
    if (!notificationModel) {
        notificationModel = mongoose.model('Notification', getSchema());
    }
    return notificationModel;
}
exports.getModel = getModel;
//# sourceMappingURL=Notification.js.map