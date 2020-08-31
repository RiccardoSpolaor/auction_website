

import {Message} from './Message'

export interface PrivateChat {
    _id: string,
    insertion_id: {
        _id: string,
        title: string
    },
    insertionist: {
        _id: string,
        username: string,
        mail: string
    },
    sender: {
        _id: string,
        username: string,
        mail: string
    },
    messages: [Message]
    insertionistRead :boolean,
    senderRead: boolean

}