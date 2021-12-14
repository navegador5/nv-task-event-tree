module.exports = {
    sym_debug,
    ////
    noexist,
    ////
    TYPES,
    INFOS,
    ERRORS,
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
    sym_stuck_origin,    //getter setter 当前停止在哪个nd ,用来recover(self_rejected)/continue(self_paused)
    sym_cond,            //setter conder 的结果
    sym_rslt,            //setter
    sym_exception,       //setter
    sym_psj,             //getter
    sym_renew_psj,
    ////-----------------------exec
    sym_rdy,
    sym_conding,
    sym_open,
    sym_exec,
    sym_rs,
    sym_srj,
    sym_brj,
    sym_spause,
    sym_bpause,
    sym_im,
    sym_respawn,
    sym_recv,
    //
    DFLT_CU_CONDER   :(rtrn_true,rtrn_false,self)=>{rtrn_true(self)},
    DFLT_CU_EXECUTOR :(rs,rj,self)=>{rs(self)},
    PARSER_USED_PROPS,
    DFLT_COPY:(src,dst)=>{
        for(let k in src) {
            if(typeof(k)==='string' && !PARSER_USED_PROPS.includes(k)) {
                dst[k] = src[k]
            }
        }
    },
    ////
    sym_if,
    sym_elif,
    sym_while,
    sym_else
}

