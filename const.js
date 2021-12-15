const sym_debug      = Symbol("")

const {
    noexist,
    creat_ksym_dict_with_prefix,
    add_ksyms_to_exports,
} = require("nv-facutil-basic");

const dict_desc = require("nv-dict-desc");

const TYPES = dict_desc.mdict(['serial','parallel']);

const kkject = require("nv-facutil-kkject");

const INFOS = kkject(
    'INFOS',[
        'ignore_abandoned_cond_fls',
        'ignore_abandoned_cond_tru',
        'ignore_abandoned_resolved',
        'ignore_abandoned_rejected'
    ]
)

const ERRORS = kkject(
    'ERRORS',[
          'not_supported_type',
          'not_supported_reject',
          'leaf_node_should_not_recv_notification',
          'only_on_root_task',
          'can_only_start_when_ready',
          'can_only_bpause_when_opened',
          'can_only_spause_when_self_executing',
          'can_only_continue_when_paused',
          'state_not_supported',
          'serial_node_should_not_recv_child_noti_when_not_opened',
          'parallel_node_should_not_recv_child_noti_when_not_OorB',
          'can_only_recover_when_rejected',
          'not_supported_signal',
          'serial_should_not_recv_child_noti_when_no_ready',
          'should_not_recv_child_noti_if_pending',
          'should_not_recv_child_noti_if_resolved',
          'should_not_recv_child_pause_noti_if_stopped',
          'can_soft_reset_only_when_settled_or_impossible'
    ]
)

const STATE_SYMS = creat_ksym_dict_with_prefix(
    [
       'state',
          'state_rdy',
          'state_conding',
          'state_open',
          'state_exec',
          'state_rs',
          'state_srj',
          'state_brj',
          'state_spause',
          'state_bpause',
          'state_im'
    ]
);

const EXEC_SYMS = creat_ksym_dict_with_prefix(
    [  
        'rdy',
        'conding',
        'open',
        'exec',
        'rs',
        'srj','brj',
        'spause','bpause',
        'im',
        'respawn',
        'recv'
    ]
);


const COMPLETION_SYMS = creat_ksym_dict_with_prefix(
    [
        'reject_origin',
        'cond',
        'rslt',
        'exception',
        'psj','renew_psj'
    ]
);

const CTRL_SYMS = creat_ksym_dict_with_prefix(
    [
        "if","elif","else",
        "while"
    ]
);


const PARSER_USED_PROPS    = ['T','A']
const NEXT_SIGN = '-> ';
const PARA_SIGN = '-| ' ;
const SLBLK = '(';
const SRBLK = ')';
const PLBLK = '{';
const PRBLK = '}'



module.exports = {
    sym_debug,
    ////
    noexist,
    ////
    TYPES,
    INFOS,
    ERRORS,
    DFLT_CU_CONDER   :(rtrn_true,rtrn_false,self)=>{rtrn_true(self)},
    DFLT_CU_EXECUTOR :(rs,rj,self)=>{rs(self)},
    ////
    PARSER_USED_PROPS,
    NEXT_SIGN,SLBLK,SRBLK,
    PARA_SIGN,PLBLK,PRBLK,
    ////
    DFLT_COPY:(src,dst)=>{
        for(let k of Object.keys(src)) {
            if(typeof(k)==='string' && !PARSER_USED_PROPS.includes(k)) {
                dst[k] = src[k]
            }
        }
    },
    ////
}



add_ksyms_to_exports(
    module.exports,
    STATE_SYMS,EXEC_SYMS,COMPLETION_SYMS,CTRL_SYMS
);



