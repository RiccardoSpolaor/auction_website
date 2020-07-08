import mongoose = require('mongoose');
import {User} from './User';
import {Insertion} from './Insertion';

export interface PublicMessage extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    content: string,
    author: User,
    timestamp: Date,
    insertion: Insertion
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

var publicMessageSchema = new mongoose.Schema( {
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
    insertion_id: {
        type: mongoose.SchemaTypes.ObjectId, 
        ref: 'Insertion',
        required: true
    },
})

export function getSchema() { return publicMessageSchema; }

// Mongoose Model
var publicMessageModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< PublicMessage > { // Return Model as singleton
    if( !publicMessageModel ) {
        publicMessageModel = mongoose.model('PublicMessage', getSchema() )
    }
    return publicMessageModel;
}