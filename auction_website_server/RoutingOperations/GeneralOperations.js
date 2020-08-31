"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTokenUserInfoIfExists = exports.auth = void 0;
const jsonwebtoken = require("jsonwebtoken"); // JWT generation
const jwt = require("express-jwt"); // JWT parsing middleware for express
//import { AuctionEnded, IosObject } from '../IosObject';
// We create the JWT authentication middleware
// provided by the express-jwt library.  
// 
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.
//
exports.auth = jwt({ secret: process.env.JWT_SECRET });
function addTokenUserInfoIfExists(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        next();
    }
    else {
        jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, user) => {
            console.log(err);
            if (err)
                return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
}
exports.addTokenUserInfoIfExists = addTokenUserInfoIfExists;
//# sourceMappingURL=GeneralOperations.js.map