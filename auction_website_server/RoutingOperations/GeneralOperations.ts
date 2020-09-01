import jsonwebtoken = require('jsonwebtoken');  
import jwt = require('express-jwt');            

export var auth = jwt( {secret: process.env.JWT_SECRET} );

export function addTokenUserInfoIfExists(req, res, next) {
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