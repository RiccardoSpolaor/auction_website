import mongoose = require('mongoose');
import {User} from './User';

export interface PublicMessage extends mongoose.Document {
    content: string,
    author: string,
    timestamp: Date,
}

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
    }
})

export function getSchema() { return publicMessageSchema; }


export function isPublicMessage(arg: any): arg is PublicMessage {
    return arg && arg.content && typeof(arg.content) == 'string' 
               && arg.author && typeof(arg.author) == 'string' 
               && arg.timestamp && arg.timestamp instanceof Date 
}
               
        



// Mongoose Model
var publicMessageModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< PublicMessage > { // Return Model as singleton
    if( !publicMessageModel ) {
        publicMessageModel = mongoose.model('PublicMessage', getSchema() )
    }
    return publicMessageModel;
}

export function newMessage( data ): PublicMessage {
    var messagemodel = getModel();
    var message = new messagemodel( data );

    return message;
}