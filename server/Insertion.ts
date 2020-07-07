import mongoose = require('mongoose');
import user = require('./User');
import public_message = require('./PublicMessage');

export interface Insertion extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    title: string,
    authors: [string],
    edition: string,
    faculty: string,

    insertion_timestamp: Date,
    insertionist_id: user.User,
    reserve_price: number,
    price: number,
    expire_date: Date,
    current_winner: user.User,

    //messages: [public_message.PublicMessage]
}

// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//
//export function isMessage(arg: any): arg is Message {
//    return arg && arg.content && typeof(arg.content) == 'string' && arg.tags && Array.isArray(arg.tags) && arg.timestamp && arg.timestamp instanceof Date && arg.authormail && typeof(arg.authormail) == 'string' ;
//}


// We use Mongoose to perform the ODM between our application and
// mongodb. To do that we need to create a Schema and an associated
// data model that will be mapped into a mongodb collection
//
// Type checking cannot be enforced at runtime so we must take care
// of correctly matching the Message interface with the messageSchema 
//
// Mongoose Schema

var insertionSchema = new mongoose.Schema( {
    title: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    authors: {
        type: [mongoose.SchemaTypes.String],
        required: true 
    },
    edition: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    faculty: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    insertion_timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    insertionist_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    reserve_price: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    price: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    expire_date: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    current_winner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false
    }
})

export function getSchema() { return insertionSchema; }

// Mongoose Model
var insertionModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< mongoose.Document > { // Return Model as singleton
    if( !insertionModel ) {
        insertionModel = mongoose.model('Insertion', getSchema() )
    }
    return insertionModel;
}