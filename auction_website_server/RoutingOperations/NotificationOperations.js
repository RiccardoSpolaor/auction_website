"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putNotificationAsRead = exports.getUnreadNotificationsCount = exports.getNotifications = void 0;
const notification = require("../Notification");
const iosObject = require("../IosObject");
function getNotifications(req, res, next) {
    notification.getModel().find({ to: req.user.id }).populate('insertion', ['_id', 'title']).sort({ "timestamp": -1 }).then((documents) => {
        return res.status(200).json(documents);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.getNotifications = getNotifications;
function getUnreadNotificationsCount(req, res, next) {
    notification.getModel().countDocuments({ $and: [{ to: req.user.id }, { read: { $ne: true } }] }).then((result) => {
        return res.status(200).json(result);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.getUnreadNotificationsCount = getUnreadNotificationsCount;
function putNotificationAsRead(req, res, next) {
    notification.getModel().findById(req.params.id).then((data) => {
        if (data.to != req.user.id) {
            return next({ statusCode: 404, error: true, errormessage: "This user is not allowed to edit the notification!" });
        }
        data.read = true;
        data.save().then((data) => {
            req.ios.emit('broadcast', iosObject.createIosNotification(req.user.id));
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch((reason) => {
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
        });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.putNotificationAsRead = putNotificationAsRead;
//# sourceMappingURL=NotificationOperations.js.map