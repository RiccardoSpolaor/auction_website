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