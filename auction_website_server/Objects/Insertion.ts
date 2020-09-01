import mongoose = require('mongoose');
import {Message} from './Message';
import * as message from './Message';

export interface Insertion extends mongoose.Document {
    title: string,
    authors: [string],
    edition: number,
    faculty: string,
    university: string,
    messages: [Message],

    insertion_timestamp: Date,
    insertionist: string,
    reserve_price: number,
    start_price: number,
    current_price: number,
    expire_date: Date,
    current_winner: string,
    closed: boolean,
    history: [{
        user: string,
        timestamp: Date,
        price: number
    }],
}

// Mongoose Schema
var insertionSchema = new mongoose.Schema( {
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
})


export function getSchema() { return insertionSchema; }

// Mongoose Model
var insertionModel; 
export function getModel() : mongoose.Model< Insertion > { 
    if( !insertionModel ) {
        insertionModel = mongoose.model('Insertion', getSchema() )
    }
    return insertionModel;
}
