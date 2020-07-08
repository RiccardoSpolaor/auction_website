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
import * as insertion from './Insertion';

import {PublicMessage} from './PublicMessage';
import * as public_message from './PublicMessage';

import { User } from './User';
import * as user from './User';

import express = require('express');
import bodyparser = require('body-parser');      // body-parser middleware is used to parse the request body and
                                                 // directly provide a JavaScript object if the "Content-type" is
                                                 // application/json

import passport = require('passport');           // authentication middleware for Express
import passportHTTP = require('passport-http');  // implements Basic and Digest authentication for HTTP (used for /login endpoint)

import jsonwebtoken = require('jsonwebtoken');  // JWT generation
import jwt = require('express-jwt');            // JWT parsing middleware for express

import cors = require('cors');                  // Enable CORS middleware
import io = require('socket.io');               // Socket.io websocket library



declare global {
  namespace Express {
      interface User {
        mail:string,
        username: string,
        roles: string[],
        id: string
      }
    }
}


var ios = undefined;
var app = express();

// We create the JWT authentication middleware
// provided by the express-jwt library.  
// 
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.
//
var auth = jwt( {secret: process.env.JWT_SECRET} );


app.use( cors() );

// Install the top-level middleware "bodyparser"
// body-parser extracts the entire body portion of an incoming request stream 
// and exposes it on req.body
app.use( bodyparser.json() );


// Add API routes to express application
//

app.get("/", (req,res) => {

    res.status(200).json( { api_version: "1.0", endpoints: [ "/books", "/books/:id/messages"] } ); // json method sends a JSON response (setting the correct Content-Type) to the client

});

mongoose.connect( 'mongodb://localhost:27017/auction_website' ).then( 
    function onconnected() {

        console.log("Connected to MongoDB");

        var u = user.newUser( {
          username: "admin",
          mail: "admin@postmessages.it",
          location: "Italy"
        } );
        u.setAdmin();
        u.setPassword("admin");
        u.save().then( ()=> {
          console.log("Admin user created");
/*
          message.getModel().countDocuments({}).then(
              ( count ) => {
                  if( count == 0 ) {
                      console.log("Adding some test data into the database");
                      var m1 = message
                        .getModel()
                        .create({
                          tags: ["Tag1", "Tag2", "Tag3"],
                          content: "Post 1",
                          timestamp: new Date(),
                          authormail: u.mail
                        });
                      var m2 = message
                        .getModel()
                        .create({
                          tags: ["Tag1", "Tag5"],
                          content: "Post 2",
                          timestamp: new Date(),
                          authormail: u.mail
                        });
                      var m3 = message
                        .getModel()
                        .create({
                          tags: ["Tag6", "Tag10"],
                          content: "Post 3",
                          timestamp: new Date(),
                          authormail: u.mail
                        });

                      Promise.all([m1, m2, m3])
                        .then(function() {
                          console.log("Messages saved");
                        })
                        .catch(function(reason) {
                          console.log("Unable to save: " + reason);
                        });

                  }
              })*/
        }).catch( (err)=> {
          console.log("Unable to create admin user: " + err );
        }).finally( ()=> {

          let server = http.createServer(app);

          ios = io(server);
          ios.on('connection', function(client) {
            console.log( "Socket.io client connected".green );
          });
          server.listen( 8080, () => console.log("HTTP Server started on port 8080") );

          // To start an HTTPS server we create an https.Server instance 
          // passing the express application middleware. Then, we start listening
          // on port 8443
          //
          /*
          https.createServer({
            key: fs.readFileSync('keys/key.pem'),
            cert: fs.readFileSync('keys/cert.pem')
          }, app).listen(8443);
          */
      });

    },
    function onrejected(err) {
        console.log("Unable to connect to MongoDB" + err);
        process.exit(-2);
    }
)
