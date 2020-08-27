"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putInsertionPriceById = exports.putInsertionAnswerToPublicMessageById = exports.putInsertionPublicMessageById = exports.putInsertionContentById = exports.updateInsertionContent = exports.deleteInsertionById = exports.getInsertionById = exports.postInsertion = exports.getInsertions = void 0;
const insertion = require("../Insertion");
const message = require("../Message");
const user = require("../User");
const iosObject = require("../IosObject");
function isInsertion(arg) {
    return arg && arg.title && typeof (arg.title) == 'string'
        && arg.authors && Array.isArray(arg.authors) && arg.authors.length
        && arg.edition != undefined && typeof (arg.edition) == 'number' && arg.edition >= 0
        && arg.faculty && typeof (arg.faculty) == 'string'
        && arg.university && typeof (arg.university) == 'string'
        && arg.insertion_timestamp && arg.insertion_timestamp instanceof Date
        && arg.insertionist && typeof (arg.insertionist) == 'string'
        && arg.start_price != undefined && typeof (arg.start_price) == 'number' && arg.start_price >= 0
        && arg.reserve_price != undefined && typeof (arg.reserve_price) == 'number' && arg.reserve_price > arg.start_price
        && arg.expire_date && arg.expire_date instanceof Date && arg.expire_date > arg.insertion_timestamp;
}
function findFilteredInsertions(req, res, next, data) {
    var filter = {};
    var expressions = [];
    if (req.query.title) {
        expressions.push({ title: { $regex: req.query.title, $options: "i" } });
    }
    if (req.query.faculty) {
        expressions.push({ faculty: { $regex: req.query.faculty, $options: "i" } });
    }
    if (req.query.university) {
        expressions.push({ university: { $regex: req.query.university, $options: "i" } });
    }
    if (req.query.price) {
        expressions.push({ current_price: { $eq: Number(req.query.price) } });
    }
    if (data) {
        expressions.push({ insertionist: { $in: data } });
    }
    filter = expressions.length ? { $and: expressions } : {};
    console.log("Using filter: " + JSON.stringify(filter));
    console.log(" Using query: " + JSON.stringify(req.query));
    //Slice ritorna con -1 ultimo elemento dell'array, populate aggrega gli oggetti degli schema.
    insertion.getModel().find(filter, { messages: 0, reserve_price: 0, history: { $slice: -1 } })
        .populate('history.user', ['_id', 'username', 'mail'])
        .populate('insertionist', ['_id', 'username', 'mail', 'location']).sort({ insertion_timestamp: -1 }).then((documents) => {
        return res.status(200).json(documents);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
function findFilteredInsertionsByUsers(req, res, next, userfilter) {
    user.getModel().find(userfilter).select("_id").then((data) => {
        findFilteredInsertions(req, res, next, data);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
function getInsertions(req, res, next) {
    var userfilter = {};
    var userexpressions = [];
    if (req.query.location) {
        userexpressions.push({ location: { $regex: req.query.location, $options: "i" } });
    }
    if (req.query.user) {
        userexpressions.push({ $or: [{ username: { $regex: req.query.user, $options: "i" } }, { mail: { $regex: req.query.user, $options: "i" } }] });
    }
    userfilter = userexpressions.length ? { $and: userexpressions } : null;
    if (userfilter) {
        findFilteredInsertionsByUsers(req, res, next, userfilter);
    }
    else {
        findFilteredInsertions(req, res, next, null);
    }
}
exports.getInsertions = getInsertions;
function postInsertion(req, res, next) {
    console.log("Received: " + JSON.stringify(req.body));
    // Checks if user is not a Mod
    if (req.user.mod) {
        return next({ statusCode: 404, error: true, errormessage: "Unauthorized: Mods can't create new Insertions" });
    }
    var recinsertion = req.body;
    recinsertion.expire_date = new Date(recinsertion.expire_date.year, recinsertion.expire_date.month, recinsertion.expire_date.day, recinsertion.expire_date.hours, recinsertion.expire_date.minutes);
    recinsertion.insertion_timestamp = new Date();
    recinsertion.insertionist = req.user.id;
    if (isInsertion(recinsertion)) {
        insertion.getModel().create(recinsertion).then((data) => {
            // Notify all socket.io clients
            ios.emit('broadcast', iosObject.createIosInsertion(data.id));
            return res.status(200).json({ error: false, errormessage: "", id: data._id });
        }).catch((reason) => {
            return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
        });
    }
    else {
        return next({ statusCode: 404, error: true, errormessage: "Data is not a valid Insertion" });
    }
}
exports.postInsertion = postInsertion;
function getInsertionById(req, res, next) {
    insertion.getModel().findById(req.params.id).then((data) => {
        if (data) {
            if (!req.user || ((!req.user.mod || !req.user.validated) && req.user.id != data.insertionist))
                data.reserve_price = undefined;
            data.populate([{
                    path: 'messages.author',
                    select: '_id mail username'
                },
                {
                    path: 'messages.responses.author',
                    select: '_id mail username'
                },
                {
                    path: 'history.user',
                    select: '_id mail username'
                },
                {
                    path: 'insertionist',
                    select: '_id mail username location'
                },
                {
                    path: 'current_winner',
                    select: '_id mail username'
                }]).execPopulate().then((data) => {
                return res.status(200).json(data);
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
            });
        }
        else
            return res.status(200).json(data);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.getInsertionById = getInsertionById;
function deleteInsertionById(req, res, next) {
    // Check mod role
    if (!req.user.mod || !req.user.validated) {
        return next({ statusCode: 404, error: true, errormessage: "Unauthorized: user is not a moderator" });
    }
    // req.params.id contains the :id URL component
    insertion.getModel().findByIdAndDelete(req.params.id).then(() => {
        return res.status(200).json({ error: false, errormessage: "" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.deleteInsertionById = deleteInsertionById;
function areReserveAndStartPriceCompatible(body_start, body_reserve, db_start, db_reserve) {
    if (body_start != undefined && body_reserve != undefined) {
        if (typeof (body_start) == 'number' && typeof (body_reserve) == 'number')
            return body_start < body_reserve;
        else
            return false;
    }
    if (body_start != undefined) {
        if (typeof (body_start) == 'number')
            return body_start < db_reserve;
        else
            return false;
    }
    if (body_reserve != undefined) {
        if (typeof (body_reserve) == 'number')
            return body_reserve > db_start;
        else
            return false;
    }
    return true;
}
function updateInsertionContent(req, res, next, body, data) {
    var errors = [];
    if (!body)
        return next({ statusCode: 404, error: true, errormessage: "Missing Data" });
    if (body.title)
        if (typeof (body.title) != 'string')
            errors.push('Invalid Title');
        else
            data.title = body.title;
    if (body.authors)
        if (!Array.isArray(body.authors) || !body.authors.length)
            errors.push('Invalid Authors List');
        else
            data.authors = body.authors;
    if (body.edition != undefined)
        if (typeof (body.edition) != 'number' || body.edition < 0)
            errors.push('Invalid Edition');
        else
            data.edition = body.edition;
    if (body.faculty)
        if (typeof (body.faculty) != 'string')
            errors.push('Invalid Faculty');
        else
            data.faculty = body.faculty;
    if (!areReserveAndStartPriceCompatible(body.start_price, body.reserve_price, data.start_price, data.reserve_price))
        errors.push('Reserve or Start Price Invalid or Incompatible');
    else {
        if (body.start_price != undefined)
            data.start_price = body.start_price;
        if (body.reserve_price != undefined)
            data.reserve_price = body.reserve_price;
    }
    if (body.university)
        if (typeof (body.university) != 'string')
            errors.push('Invalid University');
        else
            data.university = body.university;
    if (body.expire_date) {
        var expire_date = new Date(body.expire_date.year, body.expire_date.month, body.expire_date.day, body.expire_date.hours, body.expire_date.minutes);
        if (!expire_date.getDate || isNaN(expire_date.getDate()) || expire_date <= data.insertion_timestamp)
            errors.push('Invalid Expire Date');
        else
            data.expire_date = expire_date;
    }
    if (errors.length)
        return next({ statusCode: 404, error: true, errormessage: "Errors: " + errors });
    data.save().then((data) => {
        console.log("Database Update");
        return res.status(200).json({ error: false, errormessage: "", id: data._id });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
    });
}
exports.updateInsertionContent = updateInsertionContent;
function putInsertionContentById(req, res, next) {
    var body = req.body;
    insertion.getModel().findById(req.params.id).then((data) => {
        if ((!req.user.mod || !req.user.validated) && req.user.id != data.insertionist)
            return next({ statusCode: 404, error: true, errormessage: "Unauthorized: user is not a moderator or the insertionist." });
        if (data.closed)
            return next({ statusCode: 404, error: true, errormessage: "Unauthorized: closed auctions can't be edited." });
        updateInsertionContent(req, res, next, body, data);
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.putInsertionContentById = putInsertionContentById;
function putInsertionPublicMessageById(req, res, next) {
    var body = req.body;
    insertion.getModel().findById(req.params.id).then((data) => {
        body.timestamp = new Date();
        body.author = req.user.id;
        if (message.isMessage(body)) {
            var m = message.newMessage(body);
            data.messages.unshift(m);
            data.save().then((data) => {
                return res.status(200).json({ error: false, errormessage: "", id: data._id });
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
            });
        }
        else
            return next({ statusCode: 404, error: true, errormessage: "Data is not a valid Message" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.putInsertionPublicMessageById = putInsertionPublicMessageById;
function putInsertionAnswerToPublicMessageById(req, res, next) {
    var body = req.body;
    insertion.getModel().findById(req.params.id).then((data) => {
        body.timestamp = new Date();
        body.author = req.user.id;
        if (message.isMessage(body)) {
            var m = message.newMessage(body);
            data.messages.find((info) => {
                return info._id == req.params.m_id;
            }).responses.push(m);
            data.save().then((data) => {
                return res.status(200).json({ error: false, errormessage: "", id: data._id });
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
            });
        }
        else
            return next({ statusCode: 404, error: true, errormessage: "Data is not a valid Message" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.putInsertionAnswerToPublicMessageById = putInsertionAnswerToPublicMessageById;
function putInsertionPriceById(req, res, next) {
    if (req.user.mod)
        return next({ statusCode: 500, error: true, errormessage: "Moderators can't bet on someone's insertion" });
    var body = req.body;
    insertion.getModel().findById(req.params.id).then((data) => {
        if (data.closed)
            return next({ statusCode: 500, error: true, errormessage: "Insertion is already closed" });
        if (data.insertionist == req.user.id)
            return next({ statusCode: 500, error: true, errormessage: "Insetionists can't bet on their own insertion" });
        if (body.current_price != undefined && typeof body.current_price == 'number' &&
            (body.current_price > data.start_price) &&
            (data.current_price == undefined || data.current_price < body.current_price)) {
            data.history.push({
                user: req.user.id,
                timestamp: new Date(),
                price: body.current_price
            });
            data.current_price = body.current_price;
            data.current_winner = req.user.id;
            data.save().then((data) => {
                return res.status(200).json({ error: false, errormessage: "", id: data._id });
            }).catch((reason) => {
                return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason.errmsg });
            });
        }
        else
            return next({ statusCode: 404, error: true, errormessage: "Invalid Data" });
    }).catch((reason) => {
        return next({ statusCode: 404, error: true, errormessage: "DB error: " + reason });
    });
}
exports.putInsertionPriceById = putInsertionPriceById;
//# sourceMappingURL=InsertionOperations.js.map