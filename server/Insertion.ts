import mongoose = require('mongoose');
import {User, newUser} from './User';
import {PublicMessage} from './PublicMessage';
import * as publicMessage from './PublicMessage';

export interface Insertion extends mongoose.Document {
    //readonly _id: mongoose.Schema.Types.ObjectId,
    title: string,
    authors: [string],
    edition: number,
    faculty: string,
    university: string,
    messages: [PublicMessage],

    insertion_timestamp: Date,
    insertionist: string,
    reserve_price: number,
    start_price: number,
    current_price: number,
    expire_date: Date,
    current_winner: string,

    //messages: [public_message.PublicMessage]
}

// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//
export function isInsertion(arg: any): arg is Insertion {
    return arg && arg.title && typeof(arg.title) == 'string' 
               && arg.authors && Array.isArray(arg.authors) && arg.authors.length
               && arg.edition!=undefined && typeof(arg.edition) == 'number' && arg.edition >= 0
               && arg.faculty && typeof(arg.faculty) == 'string' 
               && arg.university && typeof(arg.university) == 'string' 
               && arg.insertion_timestamp && arg.insertion_timestamp instanceof Date 
               && arg.insertionist && typeof(arg.insertionist) == 'string' 
               && arg.start_price!=undefined && typeof(arg.start_price) == 'number' && arg.start_price >= 0
               && arg.reserve_price!=undefined && typeof(arg.reserve_price) == 'number' && arg.reserve_price > arg.start_price
               && arg.expire_date && arg.expire_date instanceof Date && arg.expire_date > arg.insertion_timestamp
}

function areReserveAndStartPriceCompatible( body_start : any, body_reserve : any, db_start : number, db_reserve : number) {
    if (body_start!=undefined && body_reserve!=undefined){
        if(typeof(body_start) == 'number' && typeof(body_reserve) == 'number')
            return body_start < body_reserve;
        else
            return false;
    }
    if (body_start != undefined) {
        if(typeof(body_start) == 'number')
            return body_start < db_reserve;
        else
            return false;
    }
    if (body_reserve != undefined) {
        if(typeof(body_reserve) == 'number')
            return body_reserve > db_start;
        else
            return false;
    }
    return true;
}

/* CONTROLLARE che non metta inserzionista diverso da quello che l'ha creato, current_price, insertion_timestamp, current_winner, ecc. */

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
        type: [publicMessage.getSchema()], 
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
    }
})

export function getSchema() { return insertionSchema; }

// Mongoose Model
var insertionModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< Insertion > { // Return Model as singleton
    if( !insertionModel ) {
        insertionModel = mongoose.model('Insertion', getSchema() )
    }
    return insertionModel;
}
