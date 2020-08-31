
export interface Notification{
    readonly _id: string,
    content: string,
    to: string,
    timestamp: Date,
    insertion: {
        _id: string,
        title: string
    }
    read: boolean
}