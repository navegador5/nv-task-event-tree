const consts = require("./const");
const ctrl   = require("./ctrl");
const {
    load_from_blue_print,
    load_from_json,
} = require("./parser");

const wrap   = require("./wrap");
const oper   = require("./oper");

const State           = require("./state");
const Completion      = require("./completion");
const Task            = require("./task");



globalThis[consts.sym_debug] = false;

module.exports = {
    ////
    debug:(bl)=>{globalThis[consts.sym_debug]=bl},
    ////
    noexist:consts.noexist,
    TYPES:consts.TYPES,
    ////
    DFLT_TAG_PARSER:consts.DFLT_TAG_PARSER,
    load_from_blue_print,
    DFLT_CFG:consts.DFLT_CFG,
    load_from_json,
    ////
    IF:ctrl.IF,
    ELIF:ctrl.ELIF,
    ELSE:ctrl.ELSE,
    WHILE:ctrl.WHILE,
    ////
    wrap,
    ////
    oper,
    ////
    consts,
    State,
    Completion,
    Task,
}
