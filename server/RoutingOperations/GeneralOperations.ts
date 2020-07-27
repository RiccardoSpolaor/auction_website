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

import passport = require('passport');           // authentication middleware for Express
import passportHTTP = require('passport-http');  // implements Basic and Digest authentication for HTTP (used for /login endpoint)

import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import jwt = require('express-jwt');            // JWT parsing middleware for express

import cors = require('cors');                  // Enable CORS middleware
import io = require('socket.io');               // Socket.io websocket library
import { report } from 'process';
import { AuctionEnded, IosObject } from '../IosObject';

// We create the JWT authentication middleware
// provided by the express-jwt library.  
// 
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.
//
export var auth = jwt( {secret: process.env.JWT_SECRET} );

export function addTokenUserInfoIfExists(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null){
      next();
    }else{
      jsonwebtoken.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
      })
    }
  }