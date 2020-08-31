import mongoose = require('mongoose');


export interface Notification extends mongoose.Document {
    //readonly _id: mongoose.Schema.Types.ObjectId,
    content: string,
    to: string,
    timestamp: Date,
    insertion: string,
    read: boolean
}

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
var notificationModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< Notification > { // Return Model as singleton
    if( !notificationModel ) {
        notificationModel = mongoose.model('Notification', getSchema() )
    }
    return notificationModel;
}
