"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTokenUserInfoIfExists = exports.auth = void 0;
const jsonwebtoken = require("jsonwebtoken");
const jwt = require("express-jwt");
exports.auth = jwt({ secret: process.env.JWT_SECRET });
function addTokenUserInfoIfExists(req, res, next) {
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