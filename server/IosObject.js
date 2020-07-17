"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionEnded = exports.IosObject = void 0;
var Kinds;
(function (Kinds) {
    Kinds["auctionEnded"] = "auctionEnded";
})(Kinds || (Kinds = {}));
class IosObject {
    constructor(kind) {
        this.kind = kind;
    }
}
exports.IosObject = IosObject;
class AuctionEnded {
    constructor(document) {
        this.insertion = document.id;
        this.insertionist = document.insertionist;
        this.winner = document.current_winner;
    }
}
exports.AuctionEnded = AuctionEnded;
//# sourceMappingURL=IosObject.js.map