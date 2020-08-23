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


import jsonwebtoken = require('jsonwebtoken');

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
}

function isUser(arg: any): boolean {
    return arg && arg.username && typeof(arg.username) == 'string'
               && arg.name && typeof(arg.name) == 'string'
               && arg.surname && typeof(arg.surname) == 'string'
               && arg.mail && typeof(arg.mail) == 'string' && validateEmail(arg.mail)
               && arg.location && typeof(arg.location) == 'string' 
               && arg.mod==undefined && arg.validated==undefined && arg.salt==undefined && arg.digest==undefined 
}

function isMod(arg: any): boolean {
    return arg && arg.username && typeof(arg.username) == 'string'
               && arg.mail==undefined && arg.name==undefined && arg.surname==undefined && arg.location==undefined
               && arg.mod==undefined && arg.validated==undefined && arg.salt==undefined && arg.digest==undefined 
}

export function postMod ( req : express.Request,res : express.Response, next : express.NextFunction ) {

    if(req.user.mod && req.user.validated){
      if(!isMod(req.body))
        return next({ statusCode:404, error: true, errormessage: "Invalid Moderator Data"} );
  
      var u = user.newUser(req.body);
  
      if( !req.body.password ) {
        return next({ statusCode:404, error: true, errormessage: "Password field missing"} );
      }
      u.setPassword( req.body.password );
  
      u.setMod();

      u.save().then( (data) => {
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
      }).catch( (reason) => {
        if( reason.code === 11000 ) 
          return next({statusCode:404, error:true, errormessage: "Mod already exists"} );
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
      })
    }else
      return next({ statusCode:404, error: true, errormessage: "Just a validated moderator can add a new moderator" });
}

export function postStudent ( req : express.Request,res : express.Response, next : express.NextFunction ) {

    if(!req.user){
      if(!isUser(req.body))
          return next({ statusCode:404, error: true, errormessage: "Invalid Data"} );
  
      var u = user.newUser(req.body);
  
      if( !req.body.password ) {
        return next({ statusCode:404, error: true, errormessage: "Password field missing"} );
      }
      u.setPassword( req.body.password );
  
      u.validateUser();
  
      u.save().then( (data) => {
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
      }).catch( (reason) => {
        if( reason.code === 11000 )
          return next({statusCode:404, error:true, errormessage: "User already exists"} );
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
      })
    }else
      return next({ statusCode:404, error: true, errormessage: "You can't sign up a new user while you are logged in"});
  
}

export function getUsers ( req : express.Request,res : express.Response, next : express.NextFunction ) {

    // req.params.mail contains the :mail URL component
    user.getModel().find({},{digest: 0, salt:0 }).then( (user)=> {
      return res.status(200).json( user );
    }).catch( (reason) => {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
  
}

function validateMod (req : express.Request,res : express.Response, next : express.NextFunction, body : any, data : User) {
    var errors : Array<string> = [];

    if (!body)
        return next({ statusCode:404, error: true, errormessage: "Missing Data"});

    if (!body.username || !(typeof(body.username) == 'string'))
        errors.push('Missing or invalid Username');
    
    if (!body.mail || typeof(body.mail) != 'string' || !validateEmail(body.mail))
        errors.push('Missing or invalid Mail');
    
    if (!body.password || !(typeof(body.password) == 'string'))
        errors.push('Missing or invalid Password');
    
    if (!body.name || !(typeof(body.name) == 'string'))
        errors.push('Missing or invalid Name');
    
    if (!body.surname || !(typeof(body.surname) == 'string'))
        errors.push('Missing or invalid Surname');
    
    if (!body.location || !(typeof(body.location) == 'string'))
        errors.push('Missing or invalid Location');

    if (errors.length)
        return next({ statusCode:404, error: true, errormessage: "Errors: " + errors});
    
    data.setPassword( body.password );
    data.username = body.username;
    data.name = body.name;
    data.surname = body.surname;
    data.location = body.location;
    data.mail = body.mail;
    data.validateUser();  
}

function updateUser (req: any, res : any, next : any, body : any, data : User) {
    var errors : Array<string> = [];

    if (!body)
        return next({ statusCode:404, error: true, errormessage: "Missing Data"});

    if (body.username)
        if(!(typeof(body.username) == 'string'))
            errors.push('Invalid Username');
        else
            data.username = body.username;
    
    if (body.mail)
        if(typeof(body.mail) != 'string' || !validateEmail(body.mail))
            errors.push('Invalid Mail');
        else
            data.mail = body.mail;
    
    if (body.name)
        if(!(typeof(body.name) == 'string'))
            errors.push('Invalid Name');
        else
            data.name = body.name;

    if (body.surname)
        if(!(typeof(body.surname) == 'string'))
            errors.push('Invalid Surname');
        else
            data.surname = body.surname;
        
    if (body.location)
        if(!(typeof(body.location) == 'string'))
            errors.push('Invalid Location');
        else
            data.location = body.location;
    
    if (errors.length)
        return next({ statusCode:404, error: true, errormessage: "Errors: " + errors});  
}

/*******************************
 * 
 * VIENE RIGENERATO IL TOKEN SE L'UPDATE VA A BUON FINE CONTENENTE I NUOVI DATI. RICORDARSI CHE DEVE ESSERE AGGIORNATO LATO CLIENT IL TOKEN PRENDENDO QUELLO NUOVO PASSATO VIA HEADER!
 * 
 * ******************************* */
export function putUser ( req : express.Request,res : express.Response, next : express.NextFunction ) {
    var body = req.body;
    user.getModel().findById( req.user.id ).then( (user)=> {
      return user;
    }).then((data)=>{
      
      if(req.user.mod && !req.user.validated)
        validateMod (req, res, next, body, data);
  
      else
        updateUser(req, res, next, body, data)
        
      /****REGENERATING TOKEN ****/  
      data.save().then( (data) => {
        
        var tokendata = {
          username: data.username,
          mod: data.mod,
          mail: data.mail,
          id: data._id,
          validated: data.validated
          //location: req.user.location
        };
      
        console.log("Regenerating Token" );
        var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn:  '7d' } );
        return res.status(200).json({ error: false, errormessage: "", id: data._id, token: token_signed });

      }).catch( (reason) => {
        if( reason.code === 11000 )
          return next({statusCode:404, error:true, errormessage: "User already exists"} );
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
      })
    })
}


function deleteUserOpenInsertions(data: User) {
  return insertion.getModel().deleteMany({$and: [{closed: { $ne: true }}, {insertionist: data.id} ]})
}


function changeCurrentWinnersAndCurrentPrice(data: User)  {
  return insertion.getModel().find({current_winner: data.id}).populate('history.user', '_id').then( (documents : any) => {
    documents.forEach(doc => {
      console.log(JSON.stringify(doc.history))
      var i = doc.history.length - 1
      var flag = true
      while (flag && i >= 0) {
        if (doc.history[i].user && doc.history[i].user._id != data.id) {
          flag = false;
          doc.current_winner = doc.history[i].user
          doc.current_price = doc.history[i].price
        }       
        i--
      }
      
      if (flag) {
        doc.current_winner = null
        doc.current_price = null
      }
      doc.save()
    });
    return Promise.all(documents)
  })

 /*var u = this.insertion.history.length?this.insertion.history[this.insertion.history.length-1].user:null;
    var i = this.insertion.history.length-2;
    while(u==null && i>=0){
      u=this.insertion.history[i].user;
      i--;
    }
    return u?u.username:'None';*/
}

export function deleteUserById ( req : express.Request,res : express.Response, next : express.NextFunction ) {

    // Check mod role
    if( !user.newUser(req.user).hasModRole() ) {
      return next({ statusCode:404, error: true, errormessage: "Unauthorized: user is not an moderator"} );
    }
    
    // req.params.id contains the :id URL component
  
    user.getModel().findById(req.params.id).then( (data)=> {
      if(!data.hasModRole()){

        deleteUserOpenInsertions(data).then(() => {
          changeCurrentWinnersAndCurrentPrice(data).then (() => {
            data.remove().then(()=>{
              return res.status(200).json( {error:false, errormessage:""} );
            }).catch( (reason)=> {
              return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
            });
          }).catch( (reason)=> {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
          });
        }).catch( (reason)=> {
          return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
        });
        /*
        data.remove().then(()=>{
          return res.status(200).json( {error:false, errormessage:""} );
        }).catch( (reason)=> {
          return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
        });*/
      }else
        return next({ statusCode:404, error: true, errormessage: "Unauthorized: moderator can't be deleted"} )
    }).catch( (reason)=> {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}

/*****************************************DA PROVARE***************************************/ 
export function getUserStats ( req : express.Request,res : express.Response, next : express.NextFunction ) {

    if (req.user.mod) {
      if(!req.user.validated)
        return next({ statusCode:404, error: true, errormessage: "Unauthorized: moderator is not validated"} )
      var active_insertion_list = insertion.getModel().countDocuments({closed: { $ne: true }});
      var completed_insertion_list = insertion.getModel().countDocuments(
        {closed: { $eq: true }}
        ).where('current_price').gte('reserve_price');
      var active_insertion_list = insertion.getModel().countDocuments(
        {closed: { $eq: true }}
        ).where('current_price').lt('reserve_price');
  
    } else {
      var user_insertion_list = insertion.getModel().find({insertionist: { $eq: req.user.id }});
      var user_participation_list = insertion.getModel().find({'history.user': req.user.id });
      var user_winner_list = insertion.getModel().find({ $and: [{insertionist: { $eq: req.user.id }}, {closed: { $eq: true }} ]});
  
      Promise.all([user_insertion_list, user_participation_list, user_winner_list]).then(function(result) {
        var obj = {
          insertion_list: result[0],
          participation_list: result[1],
          winner_list: result[2]
         }
        return res.status(200).json( obj );
      })
      .catch(function(reason) {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
      });
    }
  }