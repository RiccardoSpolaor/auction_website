"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteUserById = exports.putUser = exports.getUsers = exports.postStudent = exports.postMod = void 0;
const insertion = require("../Objects/Insertion");
const user = require("../Objects/User");
const iosObject = require("../Objects/IosObject");
const jsonwebtoken = require("jsonwebtoken");
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
}
function isUser(arg) {
    return arg && arg.username && typeof (arg.username) == 'string'
        && arg.name && typeof (arg.name) == 'string'
        && arg.surname && typeof (arg.surname) == 'string'
        && arg.mail && typeof (arg.mail) == 'string' && validateEmail(arg.mail)
        && arg.location && typeof (arg.location) == 'string'
        && arg.mod == undefined && arg.validated == undefined && arg.salt == undefined && arg.digest == undefined;
}
function isMod(arg) {
    return arg && arg.username && typeof (arg.username) == 'string'
        && arg.mail == undefined && arg.name == undefined && arg.surname == undefined && arg.location == undefined
        && arg.mod == undefined && arg.validated == undefined && arg.salt == undefined && arg.digest == undefined;
}
function postMod(req, res, next) {
    if (req.user.mod && req.user.validated) {
        if (!isMod(req.body))
            return next({ statusCode: 404, error: true, errormessage: "Invalid Moderator Data" });
        var u = user.newUser(req.body);
        if (!req.body.password) {
            return next({ statusCode: 404, error: true, errormessage: "Password field missing" });
        }
        u.setPassword(req.body.password);
        u.setMod();
        u.save().then((data) => {
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch((reason) => {
            if (reason.code === 11000)
                return next({ statusCode: 404, error: true, errormessage: "Mod already exists" });
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
        });
    }
    else
        return next({ statusCode: 404, error: true, errormessage: "Just a validated moderator can add a new moderator" });
}
exports.postMod = postMod;
function postStudent(req, res, next) {
    if (!req.user) {
        if (!isUser(req.body))
            return next({ statusCode: 404, error: true, errormessage: "Invalid Data" });
        var u = user.newUser(req.body);
        if (!req.body.password) {
            return next({ statusCode: 404, error: true, errormessage: "Password field missing" });
        }
        u.setPassword(req.body.password);
        u.validateUser();
        u.save().then((data) => {
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch((reason) => {
            if (reason.code === 11000)
                return next({ statusCode: 404, error: true, errormessage: "User already exists" });
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
        });
    }
    else
        return next({ statusCode: 404, error: true, errormessage: "You can't sign up a new user while you are logged in" });
}
exports.postStudent = postStudent;
function getUsers(req, res, next) {
    if (!req.user.mod || !req.user.validated)
        return next({ statusCode: 404, error: true, errormessage: "Unauthorized: user is not an moderator" });
    user.getModel().find({}, { digest: 0, salt: 0 }).then((user) => {
        return res.status(200).json(user);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.getUsers = getUsers;
function validateMod(req, res, next, body, data) {
    var errors = [];
    if (!body)
        return next({ statusCode: 404, error: true, errormessage: "Missing Data" });
    if (!body.username || !(typeof (body.username) == 'string'))
        errors.push('Missing or invalid Username');
    if (!body.mail || typeof (body.mail) != 'string' || !validateEmail(body.mail))
        errors.push('Missing or invalid Mail');
    if (!body.password || !(typeof (body.password) == 'string'))
        errors.push('Missing or invalid Password');
    if (!body.name || !(typeof (body.name) == 'string'))
        errors.push('Missing or invalid Name');
    if (!body.surname || !(typeof (body.surname) == 'string'))
        errors.push('Missing or invalid Surname');
    if (!body.location || !(typeof (body.location) == 'string'))
        errors.push('Missing or invalid Location');
    if (errors.length)
        return next({ statusCode: 404, error: true, errormessage: "Errors: " + errors });
    data.setPassword(body.password);
    data.username = body.username;
    data.name = body.name;
    data.surname = body.surname;
    data.location = body.location;
    data.mail = body.mail;
    data.validateUser();
}
function updateUser(req, res, next, body, data) {
    var errors = [];
    if (!body)
        return next({ statusCode: 404, error: true, errormessage: "Missing Data" });
    if (body.username)
        if (!(typeof (body.username) == 'string'))
            errors.push('Invalid Username');
        else
            data.username = body.username;
    if (body.mail)
        if (typeof (body.mail) != 'string' || !validateEmail(body.mail))
            errors.push('Invalid Mail');
        else
            data.mail = body.mail;
    if (body.name)
        if (!(typeof (body.name) == 'string'))
            errors.push('Invalid Name');
        else
            data.name = body.name;
    if (body.surname)
        if (!(typeof (body.surname) == 'string'))
            errors.push('Invalid Surname');
        else
            data.surname = body.surname;
    if (body.location)
        if (!(typeof (body.location) == 'string'))
            errors.push('Invalid Location');
        else
            data.location = body.location;
    if (errors.length)
        return next({ statusCode: 404, error: true, errormessage: "Errors: " + errors });
}
function putUser(req, res, next) {
    var body = req.body;
    user.getModel().findById(req.user.id).then((user) => {
        return user;
    }).then((data) => {
        if (req.user.mod && !req.user.validated)
            validateMod(req, res, next, body, data);
        else
            updateUser(req, res, next, body, data);
        data.save().then((data) => {
            req.ios.emit('broadcast', iosObject.createIosUser());
            var tokendata = {
                username: data.username,
                mod: data.mod,
                mail: data.mail,
                id: data._id,
                validated: data.validated
            };
            console.log("Regenerating Token");
            var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({ error: false, errormessage: "", id: data._id, token: token_signed });
        }).catch((reason) => {
            if (reason.code === 11000)
                return next({ statusCode: 404, error: true, errormessage: "User already exists" });
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
        });
    });
}
exports.putUser = putUser;
function deleteUserOpenInsertions(data) {
    return insertion.getModel().deleteMany({ $and: [{ closed: { $ne: true } }, { insertionist: data.id }] });
}
function changeCurrentWinnersAndCurrentPrice(data) {
    return insertion.getModel().find({ current_winner: data.id }).populate('history.user', '_id').then((documents) => {
        documents.forEach(doc => {
            console.log(JSON.stringify(doc.history));
            var i = doc.history.length - 1;
            var flag = true;
            while (flag && i >= 0) {
                if (doc.history[i].user && doc.history[i].user._id != data.id) {
                    flag = false;
                    doc.current_winner = doc.history[i].user;
                    doc.current_price = doc.history[i].price;
                }
                i--;
            }
            if (flag) {
                doc.current_winner = null;
                doc.current_price = null;
            }
            doc.save();
        });
        return Promise.all(documents);
    });
}
function deleteUserById(req, res, next) {
    if (!req.user.mod || !req.user.validated) {
        return next({ statusCode: 404, error: true, errormessage: "Unauthorized: user is not an moderator" });
    }
    user.getModel().findById(req.params.id).then((data) => {
        if (!data.hasModRole()) {
            deleteUserOpenInsertions(data).then(() => {
                changeCurrentWinnersAndCurrentPrice(data).then(() => {
                    data.remove().then(() => {
                        req.ios.emit('broadcast', iosObject.createIosUserDeleted(req.params.id));
                        return res.status(200).json({ error: false, errormessage: "" });
                    }).catch((reason) => {
                        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
                    });
                }).catch((reason) => {
                    return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
                });
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
            });
        }
        else
            return next({ statusCode: 404, error: true, errormessage: "Unauthorized: moderator can't be deleted" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.deleteUserById = deleteUserById;
function getUserStats(req, res, next) {
    if (req.user.mod) {
        if (!req.user.validated)
            return next({ statusCode: 404, error: true, errormessage: "Unauthorized: moderator is not validated" });
        var active_insertion_list = insertion.getModel().countDocuments({ closed: { $ne: true } });
        var completed_insertion_list = insertion.getModel().countDocuments({ $and: [
                { closed: { $eq: true } },
                { $expr: { $gte: ["$current_price", "$reserve_price"] } }
            ] });
        var unsuccesfully_completed_insertion_list = insertion.getModel().countDocuments({ $and: [
                { closed: { $eq: true } },
                { $expr: { $lt: ["$current_price", "$reserve_price"] } }
            ] });
        Promise.all([active_insertion_list, completed_insertion_list, unsuccesfully_completed_insertion_list]).then(function (result) {
            var obj = {
                active_insertion_list: result[0],
                completed_insertion_list: result[1],
                unsuccesfully_completed_insertion_list: result[2]
            };
            return res.status(200).json(obj);
        })
            .catch(function (reason) {
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
        });
    }
    else {
        var user_insertion_list = insertion.getModel().find({ insertionist: { $eq: req.user.id } }).select('_id title');
        var user_participation_list = insertion.getModel().find({ 'history.user': req.user.id }).select('_id title');
        var user_winner_list = insertion.getModel().find({ $and: [{ current_winner: { $eq: req.user.id } }, { closed: { $eq: true } }] }).select('_id title');
        Promise.all([user_insertion_list, user_participation_list, user_winner_list]).then(function (result) {
            var obj = {
                insertion_list: result[0],
                participation_list: result[1],
                winner_list: result[2]
            };
            return res.status(200).json(obj);
        })
            .catch(function (reason) {
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
        });
    }
}
exports.getUserStats = getUserStats;
//# sourceMappingURL=UserOperations.js.map