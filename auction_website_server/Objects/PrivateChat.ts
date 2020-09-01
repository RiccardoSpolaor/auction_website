import mongoose = require('mongoose');
import {Message} from './Message';
import * as message from './Message';

export interface PrivateChat extends mongoose.Document {
    insertion_id: string,
    insertionist: string,
    sender: string,
    messages: [Message],
    insertionistRead: boolean,
    senderRead: boolean
}

// Mongoose Schema
var privateChatSchema = new mongoose.Schema( {
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
})

privateChatSchema.index({insertion_id: 1, sender: 1}, {unique: true})

export function getSchema() { return privateChatSchema; }

// Mongoose Model
var privateChatModel; 
export function getModel() : mongoose.Model< PrivateChat > {
    if( !privateChatModel ) {
        privateChatModel = mongoose.model('PrivateChat', getSchema() )
    }
    return privateChatModel;
}