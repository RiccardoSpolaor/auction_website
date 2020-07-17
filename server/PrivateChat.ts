import mongoose = require('mongoose');
import {Message} from './Message';
import * as message from './Message';

export interface PrivateChat extends mongoose.Document {
    //readonly _id: mongoose.Schema.Types.ObjectId,
    insertion_id: string,
    insertionist: string,
    sender: string,
    messages: [Message]
}

// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//

// passo solo insertion_id perchè dall'inserzione recupero l'insertionist 
export function isPrivateChat(arg: any): arg is PrivateChat {
    return arg && arg.insertion_id && typeof(arg.insertion_id) == 'string'
               && arg.insertionist && typeof(arg.insertionist) == 'string'
               && arg.sender && typeof(arg.sender) == 'string'
               && arg.messages && Array.isArray(arg.messages) && arg.messages.length == 1
}

/* 
export function isValidUpdate(arg: any, db: Insertion): boolean {
    console.log(JSON.stringify(db));
    return !(!arg || (arg.title && typeof(arg.title) != 'string')
               || (arg.authors && (!Array.isArray(arg.authors) || !arg.authors.length))
               || (arg.edition!=undefined && (typeof(arg.edition) != 'number' || arg.edition < 0))
               || (arg.faculty && typeof(arg.faculty) != 'string')
               || !areReserveAndStartPriceCompatible(arg.start_price, arg.reserve_price, db.start_price, db.reserve_price)
               || (arg.university && typeof(arg.university) != 'string') 
               || (arg.expire_date && (arg.expire_date !instanceof Date && arg.expire_date <= db.insertion_timestamp)))
}
*/


// We use Mongoose to perform the ODM between our application and
// mongodb. To do that we need to create a Schema and an associated
// data model that will be mapped into a mongodb collection
//
// Type checking cannot be enforced at runtime so we must take care
// of correctly matching the Message interface with the messageSchema 
//body
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
    }
})

privateChatSchema.index({insertion_id: 1, sender: 1}, {unique: true})

export function getSchema() { return privateChatSchema; }

// Mongoose Model
var privateChatModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< PrivateChat > { // Return Model as singleton
    if( !privateChatModel ) {
        privateChatModel = mongoose.model('PrivateChat', getSchema() )
    }
    return privateChatModel;
}