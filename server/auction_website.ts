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
 * 
 *  Endpoints                       Attributes          Method        Description
 * 
 *     /                                  -                GET         Returns the version and a list of available endpoints
 * 
 *     /insertions                    ?title=              GET         Returns all the books auctions, eventually filtered by, title;
 *                                    ?faculty=                        faculty; university; location of the insertionist; current price of the auction.
 *                                    ?university=
 *                                    ?location=
 *                                    ?price=
 *     /insertions                        -                POST        Posts a new book auction
 *
 *     /insertions/:id                    -                GET         Gets a book auction by id  
 *     /insertions/:id                    -                DELETE      Deletes a book auction by id, can just be done by an admin
 *     /insertions/:id                    -                PUT         Edits an auction content, can be done by the user who made it or the admin
 *                                                                     Every user can post a new price offer.
 * 
 *     /public_messages                   -                GET         Returns all current visualized book auction public messages.
 *     /public_messages                   -                POST        Posts a public message on the current insertion.
 * 
 *     /private_chat                       -             GET           Returns all the private chats of the current user where he is either the sender or the receiver 
 *     /private_chat                       -             POST         Create a new private chat where the sender is the current user and the receiver (è quello dell'nserzione visualizzata al momento e lo stesso vale per l'id )
 * 
 *     /private_chat/:id                  -             GET         Returns all the messsages of a specific chat
 *     /private_chat/:id                  -            POST         Post a message in a specific chat
 * 
 *     /users/:mail                   -                GET         Get user info by mail
 *     /users                         -                POST        Add a new user 
 *     /users                         -                GET         List all users
 * 
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
import { report } from 'process';



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

app.get('/users/:mail', auth, (req,res,next) => {

  // req.params.mail contains the :mail URL component
  user.getModel().findOne( {mail: req.params.mail }, {digest: 0, salt:0 }).then( (user)=> {
    return res.status(200).json( user );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});

app.get("/insertions", (req,res,next) => {

  var filter = {};
  var expressions = [];

  /*for (var i in ['title', 'faculty', 'university', 'location','price']){
      if( req.query[i] ) {
        expressions.push ({ i: { $regex: req.query[i], $options: "i" }  });
      }
  }*/

  /*var ex = ['title', 'faculty', 'university', 'location','price'];
  for (var i=0; i< ex.length; i++) {
    var d = ex[i];
    if( req.query.d ) {
      expressions.push ({ d: { $regex: req.query.d, $options: "i" }  });
    }
}*/

  if( req.query.title ) {
    expressions.push ({ title: { $regex: req.query.title, $options: "i" }  });
  } 
  if( req.query.faculty ) {
    expressions.push ({ faculty: { $regex: req.query.faculty, $options: "i" }  });
  }
  if( req.query.university ) {
    expressions.push ({ university: { $regex: req.query.university, $options: "i" }  });
  }
  if( req.query.location ) {
    expressions.push ({ location: { $regex: req.query.location, $options: "i" }  });
  }
  if( req.query.price ) {
    expressions.push ({ price: { $eq: Number(req.query.price) }  });
  }

  filter = expressions.length?{$and: expressions}:{};

  console.log("Using filter: " + JSON.stringify(filter) );
  console.log(" Using query: " + JSON.stringify(req.query) );

  insertion.getModel().find( filter ).sort({insertion_timestamp:-1}).then( (documents) => {
    return res.status(200).json( documents );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});

app.post( "/insertions", auth, (req,res,next) => {

  console.log("Received: " + JSON.stringify(req.body) );

  // Check admin role
  if( user.newUser(req.user).hasAdminRole() ) {
    return next({ statusCode:404, error: true, errormessage: "Unauthorized: Admins can't create new Insertions"} );
  }

  var recinsertion = req.body;
  recinsertion.expire_date = new Date(recinsertion.expire_date);
  recinsertion.insertion_timestamp = new Date();
  recinsertion.insertionist = req.user.id;
  //recinsertion.current_winner = null;

  if( insertion.isInsertion( recinsertion )) {
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

});

app.get("/insertions/:id", (req,res,next) => {
  
  insertion.getModel().findById( req.params.id ).then( (insertion)=> {
    return res.status(200).json( insertion );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});

app.delete( '/insertions/:id', auth, (req,res,next) => {

  // Check admin role
  if( !user.newUser(req.user).hasAdminRole() ) {
    return next({ statusCode:404, error: true, errormessage: "Unauthorized: user is not a moderator"} );
  }
  
  // req.params.id contains the :id URL component

  insertion.getModel().findByIdAndDelete(req.params.id).then( ()=> {
      return res.status(200).json( {error:false, errormessage:""} );
  }).catch( (reason)=> {
      return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});

app.put( '/insertions/:id', auth, (req,res,next) =>{

  var body = req.body;
  insertion.getModel().findById( req.params.id ).then( (insertion)=> {
      return insertion;
  }).then((data)=>{
    if( !user.newUser(req.user).hasAdminRole() && req.user.id != data.insertionist) {
      return next({ statusCode:404, error: true, errormessage: "Unauthorized: user is not a moderator"} );
    }
    if(body.expire_date)
      body.expire_date = new Date(body.expire_date);

    if(insertion.isValidUpdate( body,data)) {

      insertion.getModel().findByIdAndUpdate(req.params.id, body, function(err){
        if(err)
          return next({ statusCode:404, error: true, errormessage: "DB error: "+err });
        else{
          console.log("Database Update");
          return res.status(200).json( {error:false, errormessage:""} );
        }
      });
    }else return next({ statusCode:404, error: true, errormessage: "Data is not a valid Insertion" });

  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })
});

app.post('/users', (req,res,next) => {

  if(!user.isUser(req.body))
      return next({ statusCode:404, error: true, errormessage: "Invalid Data"} );

  var u = user.newUser(req.body);

  if( !req.body.password ) {
    return next({ statusCode:404, error: true, errormessage: "Password field missing"} );
  }
  u.setPassword( req.body.password );

  u.save().then( (data) => {
    return res.status(200).json({ error: false, errormessage: "", id: data._id });
  }).catch( (reason) => {
    if( reason.code === 11000 )
      return next({statusCode:404, error:true, errormessage: "User already exists"} );
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason.errmsg });
  })

});

app.get('/users/:mail', auth, (req,res,next) => {

  // req.params.mail contains the :mail URL component
  user.getModel().findOne( {mail: req.params.mail }, {digest: 0, salt:0 }).then( (user)=> {
    return res.status(200).json( user );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});

// Login endpoint uses passport middleware to check
// user credentials before generating a new JWT
app.get("/login", passport.authenticate('basic', { session: false }), (req,res,next) => {

  // If we reach this point, the user is successfully authenticated and
  // has been injected into req.user

  // We now generate a JWT with the useful user data
  // and return it as response

  var tokendata = {
    username: req.user.username,
    roles: req.user.roles,
    mail: req.user.mail,
    id: req.user.id
    //location: req.user.location
  };

  console.log("Login granted. Generating token" );
  var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' } );

  // Note: You can manually check the JWT content at https://jwt.io

  return res.status(200).json({ error: false, errormessage: "", token: token_signed });

});

// Configure HTTP basic authentication strategy 
// trough passport middleware.
// NOTE: Always use HTTPS with Basic Authentication

passport.use( new passportHTTP.BasicStrategy(
  function(username, password, done) {

    // Delegate function we provide to passport middleware
    // to verify user credentials 

    console.log("New login attempt from ".green + username );
    user.getModel().findOne( {mail: username} , (err, user)=>{
      if( err ) {
        return done( {statusCode: 500, error: true, errormessage:err} );
      }

      if( !user ) {
        return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid user"});
      }

      if( user.validatePassword( password ) ) {
        return done(null, user);
      }

      return done(null,false,{statusCode: 500, error: true, errormessage:"Invalid password"});
    })
  }
));

// Add error handling middleware
app.use( function(err,req,res,next) {

  console.log("Request error: ".red + JSON.stringify(err) );
  res.status( err.statusCode || 500 ).json( err );

});


// The very last middleware will report an error 404 
// (will be eventually reached if no error occurred and if
//  the requested endpoint is not matched by any route)
//
app.use( (req,res,next) => {
  res.status(404).json({statusCode:404, error:true, errormessage: "Invalid endpoint"} );
})

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
        
          insertion.getModel().countDocuments({}).then(
              ( count ) => {
                  if( count == 0 ) {
                      console.log("Adding some test data into the database");
                      var ins1 = insertion
                        .getModel()
                        .create({
                          title: "Asd",
                          authors: ["Raffaeta", "Pelillo"],
                          edition: 3,
                          faculty: "informatica",
                          university: "Ca Foscari",
                          insertion_timestamp: new Date(),
                          insertionist: u.id,
                          reserve_price: 10,
                          start_price: 0,
                          current_price: null,
                          expire_date: new Date(),
                          current_winner: null,
                        });
                      /*var m2 = message
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
                        });*/

                      Promise.all([ins1])
                        .then(function() {
                          console.log("Messages saved");
                        })
                        .catch(function(reason) {
                          console.log("Unable to save: " + reason);
                        });

                  }
              })
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
