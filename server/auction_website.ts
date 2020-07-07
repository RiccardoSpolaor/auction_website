/**
 *  Simple HTTP REST server + MongoDB (Mongoose) + Express
 * 
 *  Post and get simple text messages. Each message has a text content, a list of tags
 *  and an associated timestamp.
 *  All the posted messages are stored in a MongoDB collection.
 * 
 *  The application also provide user authentication through JWT. The provided
 *  APIs are fully stateless.
 * 
 *  CI MANCANO LE CHAT PRIVATE
 * 
 *  Endpoints                    Attributes          Method        Description
 * 
 *     /                              -                GET         Returns the version and a list of available endpoints
 * 
 *     /books                     ?title=              GET         Returns all the books auctions, eventually filtered by, title;
 *                                ?faculty=                        faculty; university; location of the insertionist; current price of the auction.
 *                                ?university=
 *                                ?location=
 *                                ?price=
 *     /books                         -                POST        Posts a new book auction
 *
 *     /books/:id                     -                GET         Gets a book auction by id  
 *     /books/:id                     -                DELETE      Deletes a book auction by id, can just be done by an admin
 *     /books/:id                     -                PUT         Edits an auction content, can be done by the user who made it or the admin
 *                                                                 Every user can post a new price offer.
 * 
 *     /books/:id/public_messages     -                GET         Returns all book auction public messages.
 *     /books/:id/public_messages     -                POST        Posts a book auction public message.
 * 
 *  ?  /books/:id/private_messages/:mail-              GET         Returns the book auction private messages between the user (:mail) and the insertionist.
 *  ?  /books/:id/private_messages/:mail-              POST        (:id) posts a book auction private message to the insertionist.
 *
 *  ?  users/:id/bookchat/:id         -                GET         Returns a chat id of a certain user 
 *     /users/:mail                   -                GET         Get user info by mail
 *     /users                         -                POST        Add a new user 
 *     /users                         -                GET         List all users
 *     /users/:mail                   -                GET         Get user info by mail
 *     /users                         -                POST        Add a new user
 *     /login                         -                POST        login an existing user, returning a JWT
 * 
 * 
 * ------------------------------------------------------------------------------------ 
 *  To install the required modules:
 *  $ npm install
 * 
 *  To compile:
 *  $ npm run compile
 * 
 *  To setup:
 *  1) Create a file ".env" to store the JWT secret:
 *     JWT_SECRET=<secret>
 * 
 *    $ echo "JWT_SECRET=secret" > ".env"
 * 
 *  2) Generate HTTPS self-signed certificates
 *    $ cd keys
 *    $ openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 36
 *    $ openssl rsa -in key.pem -out newkey.pem && mv newkey.pem key.pem
 * 
 *  3) In postman go to settings and deselect HTTPS certificate check (self-signed
 *     certificate will not work otherwise)
 * 
 *  To run:
 *  $ node run start
 * 
 *  To manually inspect the database:
 *  > use postmessages
 *  > show collections
 *  > db.messages.find( {} )
 *  
 *  to delete all the messages:
 *  > db.messages.deleteMany( {} )
 * 
 */


const result = require('dotenv').config()     // The dotenv module will load a file named ".env"
                                              // file and load all the key-value pairs into
                                              // process.env (environment variable)
if (result.error) {
  console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
  process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
  console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
  process.exit(-1);
}

import fs = require('fs');
import http = require('http');                  // HTTP module
import https = require('https');                // HTTPS module
import colors = require('colors');
colors.enabled = true;


import mongoose = require('mongoose');
import {Insertion} from './Insertion';
//import * as message from './Message';

//import { User } from './User';
//import * as user from './User';

