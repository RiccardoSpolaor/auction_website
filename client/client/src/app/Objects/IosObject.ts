enum Kind {
    notification = 'notification',
    message = 'message',
    insertion = 'insertion',
    private_chat_list = 'private_chat_list',
    private_chat = 'private_chat',
    user = 'user',
    user_deleted = 'user_deleted'
}

interface IosObject {
    readonly type: Kind
}

export interface IosNotification extends IosObject {
    readonly type: Kind.notification
    readonly user: string    
} 

export interface IosMessage extends IosObject {
    readonly type: Kind.message
    readonly insertion: string
}

export interface IosInsertion extends IosObject {
    readonly type: Kind.insertion
    readonly id: string
}

export interface IosPrivateChatList extends IosObject {
    readonly type: Kind.private_chat_list
    readonly users: [string]
}

export interface IosPrivateChat extends IosObject {
    readonly type: Kind.private_chat
    readonly id: string
}

export interface IosUser extends IosObject {
    readonly type: Kind.user
}

export interface IosUserDeleted extends IosObject {
    readonly type: Kind.user_deleted
    readonly id: string
}

export function isIosNotification (iosObject : any) : iosObject is IosNotification {
    return iosObject.type && iosObject.type == Kind.notification && iosObject.user && typeof(iosObject.user) === 'string'
}

export function isIosMessage (iosObject : any) : iosObject is IosMessage {
    return iosObject.type && iosObject.type == Kind.message && iosObject.insertion && typeof(iosObject.insertion) === 'string'
}

export function isIosInsertion (iosObject : any) : iosObject is IosInsertion {
    return iosObject.type && iosObject.type == Kind.insertion && iosObject.id && typeof(iosObject.id) === 'string'
}

export function isIosPrivateChatList (iosObject : any) : iosObject is IosPrivateChatList {
    return iosObject.type && iosObject.type == Kind.private_chat_list && iosObject.user && Array.isArray(iosObject.user) && iosObject.user.every(user => typeof(user) === 'string')
}

export function isIosPrivateChat (iosObject : any) : iosObject is IosPrivateChat {
    return iosObject.type && iosObject.type == Kind.private_chat && iosObject.id && typeof(iosObject.id) === 'string'
}

export function isIosUser (iosObject : any) : iosObject is IosUser {
    return iosObject.type && iosObject.type == Kind.user
}

export function isIosUserDeleted (iosObject : any) : iosObject is IosUserDeleted {
    return iosObject.type && iosObject.type == Kind.user_deleted && iosObject.id && typeof(iosObject.id) === 'string'
}