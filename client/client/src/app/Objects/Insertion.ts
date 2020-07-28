// A message has some text content, a list of tags and a timestamp
//

import {Message} from './Message'

export interface Insertion {
    //readonly _id: mongoose.Schema.Types.ObjectId,
    title: string,
    authors: [string],
    edition: number,
    faculty: string,
    university: string,
    messages: [Message],

    insertion_timestamp: Date,
    insertionist: {
        _id: string,
        username: string,
        mail: string,
        location: string
    },
    reserve_price: number,
    start_price: number,
    current_price: number,
    expire_date: Date,
    current_winner: string,
    closed: boolean,
    history: [{
        user: {
            _id: string,
            usernme: string,
            mail: string
        }
        timestamp: Date,
        price: Number
    }],
    remaining_time: string

    //messages: [message.Message]
}

// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//

/*
export function isMessage(arg: any): arg is Message {
    return arg && arg.content && typeof(arg.content) === 'string' &&
           arg.tags && Array.isArray(arg.tags) && arg.timestamp &&
           arg.timestamp instanceof Date && arg.authormail && typeof(arg.authormail) === 'string' ;
}
*/
