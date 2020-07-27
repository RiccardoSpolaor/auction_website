"use strict";
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
 *                                    ?user=
 *     /insertions                        -                POST        Posts a new book auction
 *
 *     /insertions/:id                    -                GET         Gets a book auction by id
 *     /insertions/:id                    -                DELETE      Deletes a book auction by id, can just be done by a mod
 *     /insertions/:id/content            -                PUT         Edits an auction content, can be done by the user who made it or the mod
 *     /insertions/:id/public_messages    -                PUT         Every user can write a new public_message.
 *     /insertions/:id/price              -                PUT         Every user can post a new price offer.
 *
 *     /insertions/:id/public_messages/:m_id     -         PUT         Posts an answer to a message
 *
 *     /private_chat                      -                GET         Returns all the private chats of the current user where he is either the sender or the receiver
 *     /private_chat                      -                POST        Create a new private chat where the sender is the current user and the receiver (è quello dell'nserzione visualizzata al momento e lo stesso vale per l'id )
 *
 *     /private_chat/:id                  -                GET         Returns all the messsages of a specific chat
 *     /private_chat/:id                  -                PUT         Post a message in a specific chat
 *
 *     /users                ?           ?mod               GET         Returns the list of users
 *
 *     /users/:mail           ?           -                GET         Get user info by mail
 *     /users/:id                         -                DELETE      Deletes an user by id, only mod can do it
 *     /users                             -                PUT         Edits the user info or validates him
 *
 *     /users/mods                        -                POST        Add a new mod user
 *     /users/students                    -                POST        Add a new student user
 *
 *     /users/stats                       -                GET         Returns the current user stats
 *
 *
 *     /login                             -                POST        Login an existing user, returning a JWT
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
Object.defineProperty(exports, "__esModule", { value: true });
const result = require('dotenv').config(); // The dotenv module will load a file named ".env"
// file and load all the key-value pairs into
// process.env (environment variable)
if (result.error) {
    console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
    process.exit(-1);
}
if (!process.env.JWT_SECRET) {
    console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
    process.exit(-1);
}
const http = require("http"); // HTTP module
const colors = require("colors");
colors.enabled = true;
const mongoose = require("mongoose");
const insertion = require("./Insertion");
const insertionOperations = require("./RoutingOperations/InsertionOperations");
const userOperations = require("./RoutingOperations/UserOperations");
const generalOperations = require("./RoutingOperations/GeneralOperations");
const message = require("./Message");
const private_chat = require("./PrivateChat");
const user = require("./User");
const express = require("express");
const bodyparser = require("body-parser"); // body-parser middleware is used to parse the request body and
// directly provide a JavaScript object if the "Content-type" is
// application/json
const passport = require("passport"); // authentication middleware for Express
const passportHTTP = require("passport-http"); // implements Basic and Digest authentication for HTTP (used for /login endpoint)
const jsonwebtoken = require("jsonwebtoken"); // JWT generation
const cors = require("cors"); // Enable CORS middleware
const io = require("socket.io"); // Socket.io websocket library
var ios = undefined;
var app = express();
// We create the JWT authentication middleware
// provided by the express-jwt library.  
// 
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.
//
/*
var auth = jwt( {secret: process.env.JWT_SECRET} );
*/
app.use(cors());
// Install the top-level middleware "bodyparser"
// body-parser extracts the entire body portion of an incoming request stream 
// and exposes it on req.body
app.use(bodyparser.json());
// Add API routes to express application
//
app.get("/", (req, res) => {
    res.status(200).json({ api_version: "1.0", endpoints: ["/books", "/books/:id/messages"] }); // json method sends a JSON response (setting the correct Content-Type) to the client
});
app.get("/insertions", insertionOperations.getInsertions);
app.post("/insertions", generalOperations.auth, insertionOperations.postInsertion);
app.get("/insertions/:id", generalOperations.addTokenUserInfoIfExists, insertionOperations.getInsertionById);
app.delete('/insertions/:id', generalOperations.auth, insertionOperations.deleteInsertionById);
app.put('/insertions/:id/content', generalOperations.auth, insertionOperations.putInsertionContentById);
app.put('/insertions/:id/public_messages', generalOperations.auth, insertionOperations.putInsertionPublicMessageById);
app.put('/insertions/:id/public_messages/:m_id', generalOperations.auth, insertionOperations.putInsertionAnswerToPublicMessageById);
app.put('/insertions/:id/price', generalOperations.auth, insertionOperations.putInsertionPriceById);
/* nel body passiamo solo insertion_id e messaggio */
app.post("/private_chat", generalOperations.auth, (req, res, next) => {
    var body = req.body;
    console.log(req.user.id);
    private_chat.getModel().find({ $and: [{ insertion_id: body.insertion_id }, { sender: req.user.id }] }).then((data) => {
        console.log(data);
        if (data.length) // UTILIZZARE app.put("/private_chat/:id")
            return next({ statusCode: 404, error: true, errormessage: "c'è" });
        else {
            insertion.getModel().findById(body.insertion_id).then((insertion) => {
                return insertion;
            }).then((data) => {
                var m = { content: body.message, author: req.user.id, timestamp: new Date() };
                if (message.isMessage(m)) {
                    var messages = [m];
                    var chat = { insertion_id: data.id, insertionist: data.insertionist.toString(), sender: req.user.id, messages: messages };
                    if (private_chat.isPrivateChat(chat)) {
                        private_chat.getModel().create(chat).then((data) => {
                            // Notify all socket.io clients
                            /*ios.emit('broadcast', data );*/
                            return res.status(200).json({ error: false, errormessage: "", id: data._id });
                        }).catch((reason) => {
                            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
                        });
                    }
                    else
                        return next({ statusCode: 404, error: true, errormessage: "Data is not a valid Private Chat" });
                }
                else
                    return next({ statusCode: 404, error: true, errormessage: "Data is not a valid Message" });
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
            });
        }
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.get("/private_chat", generalOperations.auth, (req, res, next) => {
    private_chat.getModel().find({ $or: [{ sender: req.user.id }, { insertionist: req.user.id }] })
        .sort({ "messages.timestamp": -1 }).then((documents) => {
        return res.status(200).json(documents);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.put("/private_chat/:id", generalOperations.auth, (req, res, next) => {
    var body = req.body;
    private_chat.getModel().findById(req.params.id).then((chat) => {
        return chat;
    }).then((data) => {
        if (data.sender == req.user.id || data.insertionist == req.user.id) {
            body.timestamp = new Date();
            body.author = req.user.id;
            if (message.isMessage(body)) {
                var m = message.newMessage(body);
                data.messages.push(m);
                data.save().then((data) => {
                    return res.status(200).json({ error: false, errormessage: "", id: data._id });
                }).catch((reason) => {
                    return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
                });
            }
            else
                return next({ statusCode: 404, error: true, errormessage: "Data is not a valid Message" });
        }
        else
            return next({ statusCode: 404, error: true, errormessage: "You can't post in this chat" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.get("/private_chat/:id", generalOperations.auth, (req, res, next) => {
    private_chat.getModel().findById(req.params.id).then((document) => {
        if (document.sender == req.user.id || document.insertionist == req.user.id)
            return res.status(200).json(document);
        else
            return next({ statusCode: 404, error: true, errormessage: "You can't acces this chat" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
});
app.post('/users/mods', generalOperations.auth, userOperations.postMod);
app.post('/users/students', generalOperations.addTokenUserInfoIfExists, userOperations.postStudent);
/*app.get('/users/:mail', auth, (req,res,next) => {

  // req.params.mail contains the :mail URL component
  user.getModel().findOne( {mail: req.params.mail }, {digest: 0, salt:0 }).then( (user)=> {
    return res.status(200).json( user );
  }).catch( (reason) => {
    return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
  })

});*/
app.get('/users', userOperations.getUsers);
app.put('/users', generalOperations.auth, userOperations.putUser);
app.delete('/users/:id', generalOperations.auth, userOperations.deleteUserById);
/*****************************************DA PROVARE***************************************/
app.get('/users/stats', generalOperations.auth, userOperations.getUserStats);
// Login endpoint uses passport middleware to check
// user credentials before generating a new JWT
app.get("/login", passport.authenticate('basic', { session: false }), (req, res, next) => {
    // If we reach this point, the user is successfully authenticated and
    // has been injected into req.user
    // We now generate a JWT with the useful user data
    // and return it as response
    var tokendata = {
        username: req.user.username,
        mod: req.user.mod,
        mail: req.user.mail,
        id: req.user.id,
        validated: req.user.validated
        //location: req.user.location
    };
    console.log("Login granted. Generating token");
    var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Note: You can manually check the JWT content at https://jwt.io
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
});
// Configure HTTP basic authentication strategy 
// trough passport middleware.
// NOTE: Always use HTTPS with Basic Authentication
passport.use(new passportHTTP.BasicStrategy(function (username, password, done) {
    // Delegate function we provide to passport middleware
    // to verify user credentials 
    console.log("New login attempt from ".green + username);
    user.getModel().findOne({ $or: [{ username: username }, { mail: username }] }, (err, user) => {
        if (err) {
            return done({ statusCode: 500, error: true, errormessage: err });
        }
        if (!user) {
            return done(null, false, { statusCode: 500, error: true, errormessage: "Invalid user" });
        }
        if (user.validatePassword(password)) {
            return done(null, user);
        }
        return done(null, false, { statusCode: 500, error: true, errormessage: "Invalid password" });
    });
}));
// Add error handling middleware
app.use(function (err, req, res, next) {
    console.log("Request error: ".red + JSON.stringify(err));
    res.status(err.statusCode || 500).json(err);
});
// The very last middleware will report an error 404 
// (will be eventually reached if no error occurred and if
//  the requested endpoint is not matched by any route)
//
app.use((req, res, next) => {
    res.status(404).json({ statusCode: 404, error: true, errormessage: "Invalid endpoint" });
});
mongoose.connect('mongodb://localhost:27017/auction_website').then(function onconnected() {
    console.log("Connected to MongoDB");
    var u = user.newUser({
        username: "mod",
        mail: "mod@postmessages.it",
        location: "Italy"
    });
    u.setMod();
    u.setPassword("mod");
    u.validateUser();
    u.save().then(() => {
        console.log("Moderator user created");
        insertion.getModel().countDocuments({}).then((count) => {
            if (count == 0) {
                console.log("Adding some test data into the database");
                var ins1 = insertion
                    .getModel()
                    .create({
                    title: "Asd",
                    authors: ["Raffaeta", "Pelillo"],
                    edition: 3,
                    faculty: "informatica",
                    university: "Ca Foscari",
                    messages: [],
                    history: [],
                    insertion_timestamp: new Date(),
                    insertionist: u.id,
                    reserve_price: 10,
                    start_price: 0,
                    current_price: null,
                    expire_date: new Date(),
                    current_winner: null,
                    closed: false
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
                    .then(function () {
                    console.log("Messages saved");
                })
                    .catch(function (reason) {
                    console.log("Unable to save: " + reason);
                });
            }
        });
    }).catch((err) => {
        console.log("Unable to create moderator user: " + err);
    }).finally(() => {
        let server = http.createServer(app);
        ios = io(server);
        ios.on('connection', function (client) {
            console.log("Socket.io client connected".green);
        });
        server.listen(8080, () => console.log("HTTP Server started on port 8080"));
        setInterval(function () {
            insertion.getModel().find({ $and: [{ expire_date: { $lte: new Date() } }, { closed: { $ne: true } }] }, { messages: 0, reserve_price: 0 }).sort({ insertion_timestamp: -1 }).then((documents) => {
                /*var response = []
                 for(var i in documents){
                   response.push(new AuctionEnded(i));
                 }
                                 // Notify all socket.io clients*/
                ios.emit('broadcast', { data: 'hey', ciao: 'ciao' });
            }).catch((ignore) => {
                console.log(ignore);
            });
        }, 2000);
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
}, function onrejected(err) {
    console.log("Unable to connect to MongoDB" + err);
    process.exit(-2);
});
//# sourceMappingURL=auction_website.js.map