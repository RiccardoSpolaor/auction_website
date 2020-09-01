"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIosUserDeleted = exports.createIosUser = exports.createiosPrivateChat = exports.createiosPrivateChatList = exports.createIosInsertion = exports.createIosMessage = exports.createIosNotification = void 0;
var Kind;
(function (Kind) {
    Kind["notification"] = "notification";
    Kind["message"] = "message";
    Kind["insertion"] = "insertion";
    Kind["private_chat_list"] = "private_chat_list";
    Kind["private_chat"] = "private_chat";
    Kind["user"] = "user";
    Kind["user_deleted"] = "user_deleted";
})(Kind || (Kind = {}));
function createIosNotification(user) {
    return { type: Kind.notification, user: user };
}
exports.createIosNotification = createIosNotification;
function createIosMessage(insertion) {
    return { type: Kind.message, insertion: insertion };
}
exports.createIosMessage = createIosMessage;
function createIosInsertion(id) {
    return { type: Kind.insertion, id: id };
}
exports.createIosInsertion = createIosInsertion;
function createiosPrivateChatList(users) {
    return { type: Kind.private_chat_list, users: users };
}
exports.createiosPrivateChatList = createiosPrivateChatList;
function createiosPrivateChat(id) {
    return { type: Kind.private_chat, id: id };
}
exports.createiosPrivateChat = createiosPrivateChat;
function createIosUser() {
    return { type: Kind.user };
}
exports.createIosUser = createIosUser;
function createIosUserDeleted(id) {
    return { type: Kind.user_deleted, id: id };
}
exports.createIosUserDeleted = createIosUserDeleted;
//# sourceMappingURL=IosObject.js.map