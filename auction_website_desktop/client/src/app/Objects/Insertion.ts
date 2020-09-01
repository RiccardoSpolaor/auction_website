import {Message} from './Message'

export interface Insertion {
    _id: string,
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
    current_winner: {
        _id: string,
        username: string,
        mail: string
    },
    closed: boolean,
    history: [{
        user: {
            _id: string,
            username: string,
            mail: string
        }
        timestamp: Date,
        price: number
    }],
    remaining_time: string
}

