import mongoose = require('mongoose');

export interface Notification extends mongoose.Document {
    content: string,
    to: string,
    timestamp: Date,
    insertion: string,
    read: boolean
}

// Mongoose Schema
var notificationSchema = new mongoose.Schema( {
    content: {
        type: mongoose.SchemaTypes.String,
    },
    to: {
        type: mongoose.SchemaTypes.ObjectId, 
        ref: 'User',
        required: true
    },
    timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        immutable: true
    },
    insertion:{
        type: mongoose.SchemaTypes.ObjectId, 
        ref: 'Insertion',
        required: true
    },
    read: {
        type: mongoose.SchemaTypes.Boolean,
        default: false,
    } 
})

export function getSchema() { return notificationSchema; }

// Mongoose Model
var notificationModel;  
export function getModel() : mongoose.Model< Notification > { 
    if( !notificationModel ) {
        notificationModel = mongoose.model('Notification', getSchema() )
    }
    return notificationModel;
}
