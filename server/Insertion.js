"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModel = exports.getSchema = exports.isValidUpdate = exports.isInsertion = void 0;
const mongoose = require("mongoose");
const publicMessage = require("./PublicMessage");
// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//
function isInsertion(arg) {
    return arg && arg.title && typeof (arg.title) == 'string'
        && arg.authors && Array.isArray(arg.authors) && arg.authors.length
        && arg.edition != undefined && typeof (arg.edition) == 'number' && arg.edition >= 0
        && arg.faculty && typeof (arg.faculty) == 'string'
        && arg.university && typeof (arg.university) == 'string'
        && arg.insertion_timestamp && arg.insertion_timestamp instanceof Date
        && arg.insertionist && typeof (arg.insertionist) == 'string'
        && arg.start_price != undefined && typeof (arg.start_price) == 'number' && arg.start_price >= 0
        && arg.reserve_price != undefined && typeof (arg.reserve_price) == 'number' && arg.reserve_price > arg.start_price
        && arg.expire_date && arg.expire_date instanceof Date && arg.expire_date > arg.insertion_timestamp;
}
exports.isInsertion = isInsertion;
function areReserveAndStartPriceCompatible(body_start, body_reserve, db_start, db_reserve) {
    if (body_start != undefined && body_reserve != undefined) {
        if (typeof (body_start) == 'number' && typeof (body_reserve) == 'number')
            return body_start < body_reserve;
        else
            return false;
    }
    if (body_start != undefined) {
        if (typeof (body_start) == 'number')
            return body_start < db_reserve;
        else
            return false;
    }
    if (body_reserve != undefined) {
        if (typeof (body_reserve) == 'number')
            return body_reserve > db_start;
        else
            return false;
    }
    return true;
}
/* CONTROLLARE che non metta inserzionista diverso da quello che l'ha creato, current_price, insertion_timestamp, current_winner, ecc. */
function isValidUpdate(arg, db) {
    console.log(JSON.stringify(db));
    return !(!arg || (arg.title && typeof (arg.title) != 'string')
        || (arg.authors && (!Array.isArray(arg.authors) || !arg.authors.length))
        || (arg.edition != undefined && (typeof (arg.edition) != 'number' || arg.edition < 0))
        || (arg.faculty && typeof (arg.faculty) != 'string')
        || !areReserveAndStartPriceCompatible(arg.start_price, arg.reserve_price, db.start_price, db.reserve_price)
        || (arg.university && typeof (arg.university) != 'string')
        || (arg.expire_date && (arg.expire_date instanceof Date && arg.expire_date <= db.insertion_timestamp)));
}
exports.isValidUpdate = isValidUpdate;
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
    messages: {
        type: [publicMessage.getSchema()],
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
});
/*function isClosed(expire_date: Date){
    function fun(){
        if(expire_date <= new Date())
            clearInterval(myVar);
    }
    var myVar = setInterval(fun, 3000);
}*/
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