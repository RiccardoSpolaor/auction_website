"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = void 0;
const mongoose = require("mongoose");
const message = require("./Message");
// Mongoose Schema
var insertionSchema = new mongoose.Schema({
    title: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    authors: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    edition: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    faculty: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    university: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    messages: {
        type: [message.getSchema()],
        required: false
    },
    insertion_timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        immutable: true
    },
    insertionist: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
    },
    reserve_price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    start_price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    current_price: {
        type: mongoose.SchemaTypes.Number,
        required: false
    },
    expire_date: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    current_winner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: false
    },
    closed: {
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
    },
    history: [{
            user: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'User',
                required: true
            },
            timestamp: {
                type: mongoose.SchemaTypes.Date,
                required: true
            },
            price: {
                type: mongoose.SchemaTypes.Number,
                required: true
            },
        }]
});
function getSchema() { return insertionSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var insertionModel;
function getModel() {
    if (!insertionModel) {
        insertionModel = mongoose.model('Insertion', getSchema());
    }
    return insertionModel;
}
exports.getModel = getModel;
//# sourceMappingURL=Insertion.js.map