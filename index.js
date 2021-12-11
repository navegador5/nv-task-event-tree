const load_from_json = require("./task");
const consts = require("./const");
const ctrl   = require("./ctrl");
const wrap   = require("./wrap");

globalThis[consts.sym_debug] = false;


module.exports = {
    ////
    debug:(bl)=>{globalThis[consts.sym_debug]=bl}
    ////
    noexist:consts.noexist,
    TYPES:consts.TYPES,
    ////
    IF:ctrl.IF,
    ELIF:ctrl.ELIF,
    ELSE:ctrl.ELSE,
    WHILE:ctrl.WHILE,
    ////
    load_from_json,
    wrap,
}
