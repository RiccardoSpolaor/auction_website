import mongoose = require('mongoose');

export interface Message extends mongoose.Document {
    content: string,
    author: string,
    timestamp: Date,
    responses: [{
        content: string,
        author: string,
        timestamp: Date
    }],
    private: boolean
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

var messageSchema = new mongoose.Schema( {
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
})

export function getSchema() { return messageSchema; }


export function isMessage(arg: any): arg is Message {
    return arg && arg.content && typeof(arg.content) == 'string' 
               && arg.author && typeof(arg.author) == 'string' 
               && arg.timestamp && arg.timestamp instanceof Date 
}
               
        



// Mongoose Model
var messageModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< Message > { // Return Model as singleton
    if( !messageModel ) {
        messageModel = mongoose.model('Message', getSchema() )
    }
    return messageModel;
}

export function newMessage( data ): Message {
    var messagemodel = getModel();
    var message = new messagemodel( data );

    return message;
}