"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = exports.isInsertion = void 0;
const mongoose = require("mongoose");
// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//
function isInsertion(arg) {
    return arg && arg.title && typeof (arg.title) == 'string'
        && arg.authors && Array.isArray(arg.authors) && arg.authors.length
        && typeof (arg.edition) == 'number' && arg.edition >= 0
        && arg.faculty && typeof (arg.faculty) == 'string'
        && arg.university && typeof (arg.university) == 'string'
        && arg.insertion_timestamp && arg.insertion_timestamp instanceof Date
        && arg.insertionist && typeof (arg.insertionist) == 'string'
        && typeof (arg.price) == 'number' && arg.price >= 0
        && typeof (arg.reserve_price) == 'number' && arg.reserve_price > arg.price
        && arg.expire_date && arg.expire_date instanceof Date && arg.expire_date > arg.insertion_timestamp;
}
exports.isInsertion = isInsertion;
// We use Mongoose to perform the ODM between our application and
// mongodb. To do that we need to create a Schema and an associated
// data model that will be mapped into a mongodb collection
//
// Type checking cannot be enforced at runtime so we must take care
// of correctly matching the Message interface with the messageSchema 
//
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
    insertion_timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    insertionist: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    reserve_price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    expire_date: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    current_winner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: false
    }
});
function getSchema() { return insertionSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var insertionModel; // This is not exposed outside the model
function getModel() {
    if (!insertionModel) {
        insertionModel = mongoose.model('Insertion', getSchema());
    }
    return insertionModel;
}
exports.getModel = getModel;
//# sourceMappingURL=Insertion.js.map