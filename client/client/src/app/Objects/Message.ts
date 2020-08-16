// A message has some text content, a list of tags and a timestamp
//


export interface Message {
    _id: string,
    content: string,
    author: {
        _id: string,
        username: string,
        mail: string
    },
    timestamp: Date,
    responses: [{
        content: string,
        author: {
            _id: string,
            username: string,
            mail: string
        },
        timestamp: Date
    }],
    private: boolean
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
