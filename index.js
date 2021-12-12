const consts = require("./const");
const ctrl   = require("./ctrl");
const {
    DFLT_CFG
    load_from_json,
} = require("./parser");
const wrap   = require("./wrap");

globalThis[consts.sym_debug] = false;

module.exports = {
    ////
    debug:(bl)=>{globalThis[consts.sym_debug]=bl}
    ////
    noexist:consts.noexist,
    TYPES:consts.TYPES,
    DFLT_CFG,
    ////
    IF:ctrl.IF,
    ELIF:ctrl.ELIF,
    ELSE:ctrl.ELSE,
    WHILE:ctrl.WHILE,
    ////
    load_from_json,
    ////
    wrap,
}
