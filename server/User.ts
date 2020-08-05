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
        unique: true
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
    // a secret cryptographic key.    at processTicksAndRejections (internal/process/task_queues.js:79:11) {
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
var userModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< User >  { // Return Model as singleton
    if( !userModel ) {
        userModel = mongoose.model('User', getSchema() )
    }
    return userModel;
}


/*
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
}
*/

/*
export function validateMod (req: any, res : any, next : any, body : any, data : User) {
    var errors : Array<string> = [];

    if (!body)
        return next({ statusCode:404, error: true, errormessage: "Missing Data"});

    if (!body.username || !(typeof(body.username) == 'string'))
        errors.push('Missing or invalid Username');
    
    if (!body.mail || typeof(body.mail) != 'string' || !validateEmail(body.mail))
        errors.push('Missing or invalid Mail');
    
    if (!body.password || !(typeof(body.password) == 'string'))
        errors.push('Missing or invalid Password');
    
    if (!body.name || !(typeof(body.name) == 'string'))
        errors.push('Missing or invalid Name');
    
    if (!body.surname || !(typeof(body.surname) == 'string'))
        errors.push('Missing or invalid Surname');
    
    if (!body.location || !(typeof(body.location) == 'string'))
        errors.push('Missing or invalid Location');

    if (errors.length)
        return next({ statusCode:404, error: true, errormessage: "Errors: " + errors});
    
    data.setPassword( body.password );
    data.username = body.username;
    data.name = body.name;
    data.surname = body.surname;
    data.location = body.location;
    data.mail = body.mail;
    data.validateUser();  
}

*/

/*
export function updateUser (req: any, res : any, next : any, body : any, data : User) {
    var errors : Array<string> = [];

    if (!body)
        return next({ statusCode:404, error: true, errormessage: "Missing Data"});

    if (body.username)
        if(!(typeof(body.username) == 'string'))
            errors.push('Invalid Username');
        else
            data.username = body.username;
    
    if (body.mail)
        if(typeof(body.mail) != 'string' || !validateEmail(body.mail))
            errors.push('Invalid Mail');
        else
            data.mail = body.mail;
    
    if (body.name)
        if(!(typeof(body.name) == 'string'))
            errors.push('Invalid Name');
        else
            data.name = body.name;

    if (body.surname)
        if(!(typeof(body.surname) == 'string'))
            errors.push('Invalid Surname');
        else
            data.surname = body.surname;
        
    if (body.location)
        if(!(typeof(body.location) == 'string'))
            errors.push('Invalid Location');
        else
            data.location = body.location;
    
    if (errors.length)
        return next({ statusCode:404, error: true, errormessage: "Errors: " + errors});  
} */
/*
export function isUser(arg: any): boolean {
    return arg && arg.username && typeof(arg.username) == 'string'
               && arg.name && typeof(arg.name) == 'string'
               && arg.surname && typeof(arg.surname) == 'string'
               && arg.mail && typeof(arg.mail) == 'string' && validateEmail(arg.mail)
               && arg.location && typeof(arg.location) == 'string' 
               && arg.mod==undefined && arg.validated==undefined && arg.salt==undefined && arg.digest==undefined 
}
*/
/*
export function isCorrectUpdate(arg: any): boolean {
    return arg && (!arg.username ||  typeof(arg.username) == 'string' )
               && (!arg.name || typeof(arg.name) == 'string')
               && (!arg.surname || typeof(arg.surname) == 'string')
               && (!arg.mail || (typeof(arg.mail) == 'string' && validateEmail(arg.mail)))
               && (!arg.location || typeof(arg.location) == 'string') 
               && arg.mod==undefined && arg.validated==undefined && arg.salt==undefined && arg.digest==undefined 
}
*/

/*
export function isMod(arg: any): boolean {
    return arg && arg.username && typeof(arg.username) == 'string'
               && arg.mail==undefined && arg.name==undefined && arg.surname==undefined && arg.location==undefined
               && arg.mod==undefined && arg.validated==undefined && arg.salt==undefined && arg.digest==undefined 
}
*/

export function newUser( data ): User {
    var usermodel = getModel();
    var user = new usermodel( data );

    return user;
}