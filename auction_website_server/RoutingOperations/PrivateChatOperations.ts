import express = require('express');

import mongoose = require('mongoose');

import {Insertion} from '../Objects/Insertion';
import * as insertion from '../Objects/Insertion';

import {Message} from '../Objects/Message';
import * as message from '../Objects/Message';

import {PrivateChat} from '../Objects/PrivateChat';
import * as private_chat from '../Objects/PrivateChat';
import * as iosObject from '../Objects/IosObject'

import { User } from '../Objects/User';
import * as user from '../Objects/User';


function isPrivateChat(arg: any): arg is PrivateChat {
    return arg && arg.insertion_id && typeof(arg.insertion_id) == 'string'
               && arg.insertionist && typeof(arg.insertionist) == 'string'
               && arg.sender && typeof(arg.sender) == 'string'
               && arg.messages && Array.isArray(arg.messages) && arg.messages.length == 1
}

export function postPrivateChat ( req : express.Request,res : express.Response, next : express.NextFunction) {
    var body = req.body;
    console.log(req.user.id)
    private_chat.getModel().find({$and: [{insertion_id: body.insertion_id}, {sender: req.user.id}]}).then((data) =>{
        console.log(data)
        if(data.length) { 
            req.params.id = data[0]._id;
            req.body = {content: req.body.message}
            putPrivateChatMessage(req, res, next);
        } else{
            insertion.getModel().findById(body.insertion_id).then((data)=>{
                if (data.insertionist == req.user.id)
                return next({ statusCode:404, error: true, errormessage: "You can't send a private message to yourself." });

                var m = {content: body.message, author: req.user.id, timestamp: new Date()}
                if(message.isMessage(m)){
                    var messages = [m];
                    var chat = {insertion_id: data.id, insertionist: data.insertionist.toString(), sender: req.user.id, messages: messages}
        
                    if(isPrivateChat(chat)){
                    private_chat.getModel().create( chat ).then( ( data ) => {
                        req.ios.emit('broadcast', iosObject.createiosPrivateChatList([data.insertionist, data.sender]));
                        return res.status(200).json({ error: false, errormessage: "", id: data._id });
                    }).catch((reason) => {
                        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
                    })
                    }else 
                        return next({ statusCode:404, error: true, errormessage: "Data is not a valid Private Chat" });
            } else
                return next({ statusCode:404, error: true, errormessage: "Data is not a valid Message" });
            }).catch( (reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
            })
        }
    }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
  };

export function getPrivateChat ( req : express.Request,res : express.Response, next : express.NextFunction) { 

    private_chat.getModel().find( {$or: [{sender: req.user.id}, {insertionist: req.user.id}]}).populate('insertionist', ['_id', 'username', 'mail'])
    .populate('sender', ['_id', 'username', 'mail']).populate('insertion_id', ['_id', 'title']).sort({"messages.timestamp" : -1}).then( (documents) => {
        return res.status(200).json( documents );
    }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
    })
}

export function putPrivateChatMessage ( req : express.Request,res : express.Response, next : express.NextFunction ) {
    var body = req.body;
    private_chat.getModel().findById(req.params.id).then((data)=>{
      if (!data)
        return next({ statusCode:404, error: true, errormessage: "Cannot find Chat" });
      if(data.sender == req.user.id || data.insertionist == req.user.id){
        body.timestamp = new Date()
        body.author = req.user.id
  
        if(message.isMessage(body)){
          var m = message.newMessage(body);
          data.messages.push(m);

          if (data.insertionist == req.user.id)
            data.senderRead = false
          else
            data.insertionistRead = false
  
          data.save().then( (data) =>  {
            req.ios.emit('broadcast', iosObject.createiosPrivateChat(data.id));
            req.ios.emit('broadcast', iosObject.createiosPrivateChatList([data.insertionist, data.sender]));
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
          }).catch( (reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
          })
        }else
          return next({ statusCode:404, error: true, errormessage: "Data is not a valid Message" });
      }else
        return next({ statusCode:404, error: true, errormessage: "You can't post in this chat" });
  
    }).catch( (reason) => {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}

export function putPrivateChatRead ( req : express.Request,res : express.Response, next : express.NextFunction ) {
  private_chat.getModel().findById(req.params.id).then((data)=>{
    if (!data)
      return next({ statusCode:404, error: true, errormessage: "Cannot find Chat" });
    
    if(data.sender == req.user.id)
      data.senderRead = true
    
    else if(data.insertionist == req.user.id)
      data.insertionistRead = true

    else
      return next({ statusCode:404, error: true, errormessage: "You can't post in this chat" });

    data.save().then( (data) =>  {
      req.ios.emit('broadcast', iosObject.createiosPrivateChatList([data.insertionist, data.sender]));
      return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch( (reason) => {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
    })
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })
}

export function getPrivateChatById ( req : express.Request,res : express.Response, next : express.NextFunction ) {
    private_chat.getModel().findById( req.params.id ).then( (document) => { 
        if(document.sender == req.user.id || document.insertionist == req.user.id)
            document.populate([{
                path: 'insertionist', 
                select: '_id mail username'
              },
              {
                path: 'sender', 
                select: '_id mail username'
              },
              {
                path: 'insertion_id', 
                select: '_id title'
              },
              {
                path: 'messages.author', 
                select: '_id mail username'
              }
              ]).execPopulate().then((data) => { 
                return res.status(200).json( data )
              }).catch ( (reason) => {
                return next({ statusCode:500, error: true, errormessage: "DB error: "+reason });
              });
        else 
            return next({ statusCode:404, error: true, errormessage: "You can't acces this chat" });
    }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}


export function getUnreadChatsCount ( req : express.Request,res : express.Response, next : express.NextFunction ) {

  private_chat.getModel().countDocuments(
    {$or: 
      [
        {$and: [{insertionist: req.user.id}, {insertionistRead: {$ne: true}}]},
        {$and: [{sender: req.user.id}, {senderRead: {$ne: true}}]}
      ]
    }
  ).then( (result) => {
      return res.status(200).json( result );
  }).catch( (reason) => {
      return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
  })
}
