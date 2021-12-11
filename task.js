const {
    sym_debug,
    ////
    noexist,
    ////
    TYPES,
    ERRORS,
    INFOS,
    ////---------------state
    sym_state,         //getter
    sym_state_rdy        ,
    sym_state_conding    ,
    sym_state_open       ,
    sym_state_exec       ,
    sym_state_rs         ,
    sym_state_srj        ,
    sym_state_brj        ,
    sym_state_spause     ,
    sym_state_bpause     ,
    sym_state_im         ,
    ////--------------------completion
    sym_stuck_origin,    //setter 当前停止在哪个nd ,用来recover(self_rejected)/continue(self_paused)
    sym_cond,            //setter conder 的结果
    sym_rslt,            //setter
    sym_exception,       //setter
    sym_psj,             //getter
    sym_renew_psj,
    ////-----------------------exec
    sym_rdy,           //软重启 非conding 非pending 状态可用
    sym_exec_conder,
    sym_open,
    sym_exec,
    sym_rs,
    sym_srj,
    sym_brj,
    sym_spause,
    sym_bpause,
    sym_im,
    sym_respawn,
    sym_reset,          //硬重启
    //sym_recv,           //getter setter
    //
    DFLT_CU_CONDER,
    DFLT_CU_EXECUTOR,
    DFLT_COPY,
    ////
    sym_if,
    sym_elif,
    sym_else,
    sym_while,
} = require("./const");


const DEBUG = require("./debug");

const Exec = require("./exec");

class Task extends Exec {

}

