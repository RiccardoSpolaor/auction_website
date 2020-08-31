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
 *     /private_chats                     -                GET         Returns all the private chats of the current user where he is either the sender or the receiver
 *     /private_chats                     -                POST        Create a new private chat where the sender is the current user and the receiver (è quello dell'nserzione visualizzata al momento e lo stesso vale per l'id )
 *     /private_chats/unreadcount         -                GET         Returns the number of unread chats of the current user
 *
 *
 *     /private_chats/:id                  -                GET         Returns all the messsages of a specific chat
 *     /private_chats/:id/message          -                PUT         Post a message in a specific chat
 *     /private_chats/:id/read             -                PUT         Signals the chat as read by the current user
 *
 *     /notifications                     -               GET         Returns the notifications of the current user
 *     /notifications/unreadcount         -                 GET         Returns the number of unread notifications of the current user
 *     /notifications/:id                 -                 PUT         Signals the notification as read
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
const privateChatOperations = require("./RoutingOperations/PrivateChatOperations");
const notificationOperations = require("./RoutingOperations/NotificationOperations");
const generalOperations = require("./RoutingOperations/GeneralOperations");
const notification = require("./Notification");
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
// import { AuctionEnded, IosObject } from './IosObject';
const iosObject = require("./IosObject");
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
app.use((req, res, next) => {
    req.ios = ios;
    next();
});
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
app.post("/private_chats", generalOperations.auth, privateChatOperations.postPrivateChat);
app.get("/private_chats", generalOperations.auth, privateChatOperations.getPrivateChat);
app.put("/private_chats/:id/message", generalOperations.auth, privateChatOperations.putPrivateChatMessage);
app.put("/private_chats/:id/read", generalOperations.auth, privateChatOperations.putPrivateChatRead);
app.get("/private_chats/unreadcount", generalOperations.auth, privateChatOperations.getUnreadChatsCount);
app.get("/private_chats/:id", generalOperations.auth, privateChatOperations.getPrivateChatById);
app.post('/users/mods', generalOperations.auth, userOperations.postMod);
app.post('/users/students', generalOperations.addTokenUserInfoIfExists, userOperations.postStudent);
app.get('/users', generalOperations.auth, userOperations.getUsers);
app.put('/users', generalOperations.auth, userOperations.putUser);
app.delete('/users/:id', generalOperations.auth, userOperations.deleteUserById);
/*****************************************DA PROVARE***************************************/
app.get('/users/stats', generalOperations.auth, userOperations.getUserStats);
app.get('/notifications', generalOperations.auth, notificationOperations.getNotifications);
app.get('/notifications/unreadcount', generalOperations.auth, notificationOperations.getUnreadNotificationsCount);
app.put('/notifications/:id', generalOperations.auth, notificationOperations.putNotificationAsRead);
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
    var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    var m = user.newUser({
        username: "mod",
        mail: "mod@auction_website.it",
        name: "Mode",
        surname: "Rator",
        location: "Italy"
    });
    m.setMod();
    m.setPassword("mod");
    m.validateUser();
    var s1 = user.newUser({
        username: "student1",
        mail: "student1@auction_website.it",
        name: "Silvia",
        surname: "Zilio",
        location: "Italy"
    });
    s1.setPassword("student1");
    s1.validateUser();
    var s2 = user.newUser({
        username: "student2",
        mail: "student2@auction_website.it",
        name: "Riccardo",
        surname: "Spolaor",
        location: "Italy"
    });
    s2.setPassword("student2");
    s2.validateUser();
    m.save().then(() => {
        s1.save().then(() => {
            s2.save().then(() => {
                insertion.getModel().countDocuments({}).then((count) => {
                    if (count == 0) {
                        var todayDate = new Date();
                        console.log("Adding some test data into the database");
                        var ins1 = insertion
                            .getModel()
                            .create({
                            title: "Tecnologie e Applicazioni Web",
                            authors: ["Filippo Bergamasco"],
                            edition: 1,
                            faculty: "Informatica",
                            university: "Ca Foscari Venezia",
                            messages: [],
                            history: [],
                            insertion_timestamp: todayDate,
                            insertionist: s1.id,
                            reserve_price: 50,
                            start_price: 0,
                            current_price: null,
                            expire_date: todayDate.setHours(todayDate.getHours() + 24),
                            current_winner: null,
                            closed: false
                        });
                        todayDate = new Date();
                        var ins2 = insertion
                            .getModel()
                            .create({
                            title: "Algoritmi e Strutture Dati",
                            authors: ["Alessandra Raffaetà", "Marcelllo Pelillo"],
                            edition: 3,
                            faculty: "Informatica",
                            university: "Ca Foscari Venezia",
                            messages: [],
                            history: [],
                            insertion_timestamp: new Date(),
                            insertionist: s2.id,
                            reserve_price: 40,
                            start_price: 0,
                            current_price: null,
                            expire_date: todayDate.setMinutes(todayDate.getMinutes() + 5),
                            current_winner: null,
                            closed: false
                        });
                        Promise.all([ins1, ins2]).then(function () {
                            console.log("Insertions saved");
                        }).catch(function (reason) {
                            console.log("Unable to save: " + reason);
                        });
                    }
                });
            }).catch((err) => {
                console.log("Unable to create student2 user: " + err);
            });
        }).catch((err) => {
            console.log("Unable to create student1 user: " + err);
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
            insertion.getModel().find({ $and: [{ expire_date: { $lte: new Date() } }, { closed: { $ne: true } }] }, { messages: 0 }).sort({ insertion_timestamp: -1 }).then((documents) => {
                if (documents.length) {
                    var notifications = [];
                    var iosMessages = [];
                    documents.forEach(doc => {
                        doc.closed = true;
                        doc.save();
                        if (doc.current_winner) {
                            console.log(doc.current_price);
                            console.log(doc.reserve_price);
                            var notifWinner = notification
                                .getModel()
                                .create({
                                timestamp: new Date(),
                                content: (doc.current_price >= doc.reserve_price) ? 'You won the insertion!' : "You won the insertion, but you didn't reach the reserve price!",
                                read: false,
                                insertion: doc.id,
                                to: doc.current_winner
                            });
                            notifications.push(notifWinner);
                            iosMessages.push(iosObject.createIosNotification(doc.current_winner));
                        }
                        var notifInsertionist = notification
                            .getModel()
                            .create({
                            timestamp: new Date(),
                            content: (doc.current_winner && doc.current_price >= doc.reserve_price) ? 'Somebody won your insertion!' : 'No one won your insertion!',
                            read: false,
                            insertion: doc.id,
                            to: doc.insertionist
                        });
                        notifications.push(notifInsertionist);
                        iosMessages.push(iosObject.createIosNotification(doc.insertionist));
                        //iosMessages.push({type: 'notification', user: doc.insertionist})
                    });
                    Promise.all(documents)
                        .then(() => {
                        console.log("Insertions closed");
                        Promise.all(notifications).then(() => {
                            // Notify all socket.io clients INSERTION CLOSED*/
                            iosMessages.forEach(m => {
                                ios.emit('broadcast', m);
                            });
                        }).catch(function (reason) {
                            console.log("Unable to send notifications: " + reason);
                        });
                    }).catch(function (reason) {
                        console.log("Unable to close: " + reason);
                    });
                }
            }).catch((ignore) => {
                console.log(ignore);
            });
        }, 2000);
    });
}, function onrejected(err) {
    console.log("Unable to connect to MongoDB" + err);
    process.exit(-2);
});
//# sourceMappingURL=auction_website.js.map