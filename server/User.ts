import mongoose = require('mongoose');
import crypto = require('crypto');


export interface User extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    username: string,
    mail: string,
    location: string,
    admin: boolean,
    salt: string,
    digest: string,
    setPassword: (pwd:string)=>void,
    validatePassword: (pwd:string)=>boolean,
    hasAdminRole: ()=>boolean,
    setAdmin: ()=>void,
}

var userSchema = new mongoose.Schema( {
    username: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    mail: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    location: {
        type: mongoose.SchemaTypes.String,
        required: false,
    },
    admin:  {
        type: mongoose.SchemaTypes.Boolean,
        required: false,
        default: false
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

// Here we add some methods to the user Schema

userSchema.methods.setPassword = function( pwd:string ) {

    this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt

    // We use the hash function sha512 to hash both the password and salt to
    // obtain a password digest 
    // 
    // From wikipedia: (https://en.wikipedia.org/wiki/HMAC)
    // In cryptography, an HMAC (sometimes disabbreviated as either keyed-hash message 
    // authentication code or hash-based message authentication code) is a specific type 
    // of message authentication code (MAC) involving a cryptographic hash function and 
    // a secret cryptographic key.
    //
    var hmac = crypto.createHmac('sha512', this.salt );
    hmac.update( pwd );
    this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
}

userSchema.methods.validatePassword = function( pwd:string ):boolean {

    // To validate the password, we compute the digest with the
    // same HMAC to check if it matches with the digest we stored
    // in the database.
    //
    var hmac = crypto.createHmac('sha512', this.salt );
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.digest === digest);
}

userSchema.methods.hasAdminRole = function(): boolean {
    return this.admin;
}

userSchema.methods.setAdmin = function() {
    if( !this.hasAdminRole() )
        this.admin = true;
}

export function getSchema() { return userSchema; }

// Mongoose Model
var userModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< User >  { // Return Model as singleton
    if( !userModel ) {
        userModel = mongoose.model('User', getSchema() )
    }
    return userModel;
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
}


export function isUser(arg: any): boolean {
    return arg && arg.username && typeof(arg.username) == 'string' 
               && arg.mail && typeof(arg.mail) == 'string' && validateEmail(arg.mail)
               && arg.location && typeof(arg.location) == 'string' 
}

export function newUser( data ): User {
    var usermodel = getModel();
    var user = new usermodel( data );

    return user;
}