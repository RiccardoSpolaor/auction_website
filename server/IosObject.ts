import {Insertion} from './Insertion';
import * as insertion from './Insertion';

enum Kind {
    notification = 'notification',
    message = 'message',
    insertion = 'insertion',
    private_chat_list = 'private_chat_list',
    private_chat = 'private_chat',
    user = 'user',
    user_deleted = 'user_deleted'
}


export function createIosNotification (user : string) {
    return {type: Kind.notification, user: user}
}

export function createIosMessage (insertion: string) {
    return {type: Kind.message, insertion: insertion}
}

export function createIosInsertion (id : string) {
    return {type: Kind.insertion, id: id}
}

export function createiosPrivateChatList (users : string[]) {
    return {type: Kind.private_chat_list, users: users}
}

export function createiosPrivateChat (id : string) {
    return {type: Kind.private_chat, id: id}
}

export function createIosUser () {
    return {type: Kind.user}
}

export function createIosUserDeleted (id : string) {
    return {type: Kind.user_deleted, id: id}
}

/*
enum Kinds{
    auctionEnded = "auctionEnded"
}

export class IosObject {

    constructor(private kind: Kinds, ) {
        
    }
} 


export class AuctionEnded{
    private insertion;
    private insertionist;
    private winner;


    constructor(document: Insertion){
        
        this.insertion = document.id;
        this.insertionist = document.insertionist;
        this.winner = document.current_winner;
    }

}
*/