import express = require('express');

import mongoose = require('mongoose');

import {Insertion} from '../Insertion';
import * as insertion from '../Insertion';

import {Message} from '../Message';
import * as message from '../Message';

import {PrivateChat} from '../PrivateChat';
import * as private_chat from '../PrivateChat';

import { User } from '../User';
import * as user from '../User';

function isInsertion(arg: any): arg is Insertion {
  return arg && arg.title && typeof(arg.title) == 'string' 
             && arg.authors && Array.isArray(arg.authors) && arg.authors.length
             && arg.edition!=undefined && typeof(arg.edition) == 'number' && arg.edition >= 0
             && arg.faculty && typeof(arg.faculty) == 'string' 
             && arg.university && typeof(arg.university) == 'string' 
             && arg.insertion_timestamp && arg.insertion_timestamp instanceof Date 
             && arg.insertionist && typeof(arg.insertionist) == 'string' 
             && arg.start_price!=undefined && typeof(arg.start_price) == 'number' && arg.start_price >= 0
             && arg.reserve_price!=undefined && typeof(arg.reserve_price) == 'number' && arg.reserve_price > arg.start_price
             && arg.expire_date && arg.expire_date instanceof Date && arg.expire_date > arg.insertion_timestamp
}

function findFilteredInsertions( req : express.Request,res : express.Response, next : express.NextFunction, data : User[] ) {
    var filter = {};
    var expressions = [];
  
    if( req.query.title ) {
      expressions.push ({ title: { $regex: req.query.title, $options: "i" }  });
    } 
    if( req.query.faculty ) {
      expressions.push ({ faculty: { $regex: req.query.faculty, $options: "i" }  });
    }
    if( req.query.university ) {
      expressions.push ({ university: { $regex: req.query.university, $options: "i" }  });
    }
    if( req.query.price ) {
      expressions.push ({ current_price: { $eq: Number(req.query.price) }  });
    }
    if(data){
      expressions.push ({ insertionist: {$in: data }});
    }
  
    filter = expressions.length ? {$and: expressions} : {};
  
    console.log("Using filter: " + JSON.stringify(filter) );
    console.log(" Using query: " + JSON.stringify(req.query) );
  //Slice ritorna con -1 ultimo elemento dell'array, populate aggrega gli oggetti degli schema.
    insertion.getModel().find( filter , {messages : 0, reserve_price : 0, history: {$slice: -1}} )
    .populate('history.user', ['_id', 'username', 'mail'])
    .populate('insertionist', ['_id', 'username', 'mail', 'location']).sort({insertion_timestamp:-1}).then( (documents) => {

      return res.status(200).json( documents );
    }).catch( (reason) => {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}

function findFilteredInsertionsByUsers ( req : express.Request,res : express.Response, next : express.NextFunction, userfilter : any ) {
    user.getModel().find( userfilter ).select("_id").then( (data) => {
        findFilteredInsertions(req,res,next,data);
      }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
      })
}

export function getInsertions ( req : express.Request,res : express.Response, next : express.NextFunction ) {
  var userfilter = {};
  var userexpressions = [];

  if( req.query.location ) {
    userexpressions.push ({ location: { $regex: req.query.location, $options: "i" }  });
  }
  
  if( req.query.user ) {
    userexpressions.push ({ $or: [{ username: {$regex: req.query.user, $options: "i"} }, { mail: {$regex: req.query.user, $options: "i"} }]});
  }

  userfilter = userexpressions.length ? {$and: userexpressions} : null;

  if(userfilter){
     findFilteredInsertionsByUsers(req,res,next,userfilter)
  }else{
    findFilteredInsertions(req,res,next,null);
  }
}

export function postInsertion ( req : express.Request,res : express.Response, next : express.NextFunction ) {

  console.log("Received: " + JSON.stringify(req.body) );

  // Checks if user is not a Mod
  if( user.newUser(req.user).hasModRole() ) {
    return next({ statusCode:404, error: true, errormessage: "Unauthorized: Mods can't create new Insertions"});
  }

  var recinsertion = req.body;
  recinsertion.expire_date = new Date(recinsertion.expire_date);
  recinsertion.insertion_timestamp = new Date();
  recinsertion.insertionist = req.user.id;

  if( isInsertion( recinsertion )) {
    insertion.getModel().create( recinsertion ).then( ( data ) => {
      // Notify all socket.io clients
      /*ios.emit('broadcast', data );*/
      return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch((reason) => {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    } )

  } else {
    return next({ statusCode:404, error: true, errormessage: "Data is not a valid Insertion" });
  }
}

export function getInsertionById  ( req : express.Request,res : express.Response, next : express.NextFunction )  { 

  insertion.getModel().findById( req.params.id ).then( (data)=> {
    if (data) {
      if(!req.user || (!req.user.mod && req.user.id != data.insertionist))
        data.reserve_price = undefined;

      data.populate([{
        path: 'messages.author', 
        select: '_id mail username'
      },
      {
        path: 'messages.responses.author', 
        select: '_id mail username'
      },
      {
        path: 'history.user', 
        select: '_id mail username'
      },
      {
        path: 'insertionist', 
        select: '_id mail username location'
      },
      {
        path: 'current_winner', 
        select: '_id mail username'
      }]).execPopulate().then((data) => { 
        return res.status(200).json( data )
      }).catch ( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
      });
    }else
      return res.status(200).json( data )

 }).catch( (reason) => {
   return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
 })
}

export function deleteInsertionById  ( req : express.Request,res : express.Response, next : express.NextFunction ) {

  // Check mod role
  if( !user.newUser(req.user).hasModRole() ) {
    return next({ statusCode:404, error: true, errormessage: "Unauthorized: user is not a moderator"} );
  }
  
  // req.params.id contains the :id URL component

  insertion.getModel().findByIdAndDelete(req.params.id).then( ()=> {
      return res.status(200).json( {error:false, errormessage:""} );
  }).catch( (reason)=> {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

}

function areReserveAndStartPriceCompatible( body_start : any, body_reserve : any, db_start : number, db_reserve : number) {
  if (body_start!=undefined && body_reserve!=undefined){
      if(typeof(body_start) == 'number' && typeof(body_reserve) == 'number')
          return body_start < body_reserve;
      else
          return false;
  }
  if (body_start != undefined) {
      if(typeof(body_start) == 'number')
          return body_start < db_reserve;
      else
          return false;
  }
  if (body_reserve != undefined) {
      if(typeof(body_reserve) == 'number')
          return body_reserve > db_start;
      else
          return false;
  }
  return true;
}

export function updateInsertionContent (req : express.Request,res : express.Response, next : express.NextFunction, body : any, data : Insertion) {
  var errors : Array<string> = [];

  if (!body)
      return next({ statusCode:404, error: true, errormessage: "Missing Data"});

  if (body.title)
    if (typeof(body.title) != 'string')
      errors.push('Invalid Title');
    else
      data.title = body.title
  
  if (body.authors)
    if (!Array.isArray(body.authors) || !body.authors.length)
      errors.push('Invalid Authors List');
    else
      data.authors = body.authors
  
  if (body.edition != undefined)
    if (typeof(body.edition) != 'number' || body.edition < 0)
      errors.push('Invalid Edition');
    else
      data.edition = body.edition
  
  if (body.faculty)
    if (typeof(body.faculty) != 'string')
      errors.push('Invalid Faculty');
    else
      data.faculty = body.faculty
  
  if (!areReserveAndStartPriceCompatible(body.start_price, body.reserve_price, data.start_price, data.reserve_price))
      errors.push('Reserve or Start Price Invalid or Incompatible');
  else {
    if (body.start_price != undefined)
      data.start_price = body.start_price
    if (body.reserve_price != undefined)
      data.reserve_price = body.reserve_price
  }
  
  if (body.university)
    if (typeof(body.university) != 'string')
      errors.push('Invalid University');
    else
      data.university = body.university

  if (body.expire_date) 
    var expire_date : Date = new Date(body.expire_date)
    if (!expire_date.getDate || isNaN(expire_date.getDate()) || expire_date <= data.insertion_timestamp)
      errors.push('Invalid Expire Date');
    else
      data.expire_date = expire_date

  if (errors.length)
      return next({ statusCode:404, error: true, errormessage: "Errors: " + errors});
    
  data.save().then( (data) => {
    console.log("Database Update");
    return res.status(200).json({ error: false, errormessage: "", id: data._id });

  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: " + reason.errmsg });
  })
}

export function putInsertionContentById  ( req : express.Request,res : express.Response, next : express.NextFunction ) {

  var body = req.body;
  

  insertion.getModel().findById( req.params.id ).then( (data)=> {
    if( !user.newUser(req.user).hasModRole() && req.user.id != data.insertionist)
      return next({ statusCode:404, error: true, errormessage: "Unauthorized: user is not a moderator or the insertionist."} );

    if(data.closed)
      return next({ statusCode:404, error: true, errormessage: "Unauthorized: closed auctions can't be edited."} );

    updateInsertionContent(req,res,next,body,data)

  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
  })
}

export function putInsertionPublicMessageById ( req : express.Request,res : express.Response, next : express.NextFunction ) {

  var body = req.body;
  insertion.getModel().findById( req.params.id ).then((data)=>{

    body.timestamp = new Date()
    body.author = req.user.id

    if(message.isMessage(body)){
      var m = message.newMessage(body);
      data.messages.push(m);

      data.save().then( (data) =>  {
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
      }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: " + reason.errmsg });
      })
  }else
    return next({ statusCode:404, error: true, errormessage: "Data is not a valid Message" });


  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
  })
}

export function putInsertionAnswerToPublicMessageById ( req : express.Request,res : express.Response, next : express.NextFunction ) {

  var body = req.body;
  insertion.getModel().findById( req.params.id ).then( (data)=> {

      body.timestamp = new Date()
      body.author = req.user.id

      if(message.isMessage(body)){
        var m = message.newMessage(body);

        data.messages.find((info) => {
          return info._id == req.params.m_id
        }).responses.push(m)

        data.save().then( (data) =>  {
          return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch( (reason) => {
          return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
        })
    }else
      return next({ statusCode:404, error: true, errormessage: "Data is not a valid Message" });
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })
}

export function putInsertionPriceById ( req : express.Request,res : express.Response, next : express.NextFunction ) {
  
  if (req.user.mod)
    return next({ statusCode:500, error: true, errormessage: "Moderators can't bet on someone's insertion"} );
  var body = req.body;
  insertion.getModel().findById( req.params.id ).then((data)=>{
    if(data.closed)
        return next({ statusCode:500, error: true, errormessage: "Insertion is already closed"} );
    if(data.insertionist == req.user.id)
      return next({ statusCode:500, error: true, errormessage: "Insetionists can't bet on their own insertion"} );

    if(body.current_price!=undefined && typeof body.current_price == 'number' && 
    (body.current_price > data.start_price) &&
    (data.current_price == undefined || data.current_price < body.current_price)) {
      data.history.push({
        user: req.user.id, 
        timestamp: new Date(), 
        price: body.current_price
      })
      data.current_price = body.current_price;
      data.current_winner = req.user.id;
      data.save().then( (data) =>  {
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
      }).catch( (reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: " + reason.errmsg });
      })
    }
    else
        return next({ statusCode:404, error: true, errormessage: "Invalid Data"} );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: " + reason });
  })
}