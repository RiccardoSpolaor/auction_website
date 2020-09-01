import express = require('express');

import * as notification from '../Objects/Notification';
import * as iosObject from '../Objects/IosObject'

export function getNotifications ( req : express.Request,res : express.Response, next : express.NextFunction ) {

    notification.getModel().find( {to: req.user.id}).populate('insertion', ['_id', 'title']).sort({"timestamp" : -1}).then( (documents) => {
        return res.status(200).json( documents );
    }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
    })
}

export function getUnreadNotificationsCount ( req : express.Request,res : express.Response, next : express.NextFunction ) {

    notification.getModel().countDocuments({$and: [{to: req.user.id}, {read: {$ne: true}}]}).then( (result) => {
        return res.status(200).json( result );
    }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
    })
}

export function putNotificationAsRead ( req : express.Request,res : express.Response, next : express.NextFunction ) {
    notification.getModel().findById( req.params.id ).then((data)=>{
        if (data.to != req.user.id) {
            return next({ statusCode:404, error: true, errormessage: "This user is not allowed to edit the notification!" });
        }
        data.read = true;
        data.save().then( (data) =>  {
            req.ios.emit('broadcast', iosObject.createIosNotification(req.user.id));
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch( (reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: " + reason.errmsg });
        })
    }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
    })
}