import mongoose = require('mongoose');
import crypto = require('crypto');

export interface User extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    username: string,
    name: string,
    surname: string,
    mail: string,
    location: string,
    mod: boolean,
    validated: boolean,
    salt: string,
    digest: string,
    setPassword: (pwd:string)=>void,
    validatePassword: (pwd:string)=>boolean,
    hasModRole: ()=>boolean,
    setMod: ()=>void,
    validateUser: ()=>void,
    isValidated: ()=>boolean
}

// Mongoose Schema
var userSchema = new mongoose.Schema( {
    mod:  {
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
    },
    validated:  {
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
    },
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    name: {
        type: mongoose.SchemaTypes.String,
        required: function(){return !this.mod}
    },
    surname: {
        type: mongoose.SchemaTypes.String,
        required: function(){return !this.mod}
    },
    mail: {
        type: mongoose.SchemaTypes.String,
        required: function(){return !this.mod},
        unique: true,
        sparse: true
    },
    location: {
        type: mongoose.SchemaTypes.String,
        required: false,
    },
    salt:  {
        type: mongoose.SchemaTypes.String,
        required: false 
    },
    digest:  {
        type: mongoose.SchemaTypes.String,
        required: false 
    }
})

userSchema.methods.setPassword = function( pwd:string ) {

    this.salt = crypto.randomBytes(16).toString('hex'); 
    var hmac = crypto.createHmac('sha512', this.salt );
    hmac.update( pwd );
    this.digest = hmac.digest('hex'); 
}

userSchema.methods.validatePassword = function( pwd:string ):boolean {

    var hmac = crypto.createHmac('sha512', this.salt );
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.digest === digest);
}

userSchema.methods.hasModRole = function(): boolean {
    return this.mod;
}

userSchema.methods.setMod = function() {
    if( !this.hasModRole() )
        this.mod = true;
}

userSchema.methods.isValidated = function(): boolean {
    return this.validated;
}

userSchema.methods.validateUser = function() {
    if( !this.isValidated() )
        this.validated = true;
}

export function getSchema() { return userSchema; }

// Mongoose Model
var userModel;  
export function getModel() : mongoose.Model< User >  { 
    if( !userModel ) {
        userModel = mongoose.model('User', getSchema() )
    }
    return userModel;
}

export function newUser( data ): User {
    var usermodel = getModel();
    var user = new usermodel( data );

    return user;
}