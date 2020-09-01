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

// Mongoose Schema
var messageSchema = new mongoose.Schema( {
    content: {
        type: mongoose.SchemaTypes.String,
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
            type: mongoose.SchemaTypes.String,
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
var messageModel; 
export function getModel() : mongoose.Model< Message > { 
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