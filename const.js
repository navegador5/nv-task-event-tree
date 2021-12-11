const sym_debug      = Symbol("")

const {noexist} = require("nv-facutil-basic");


const TYPES = {
   'serial':0,'parallel':1,
    0:'serial',1:'parallel'
}

const INFOS = {
    'ignore_abandoned_cond_fls':'ignore_abandoned_cond_fls',
    'ignore_abandoned_cond_tru':'ignore_abandoned_cond_tru',
    'ignore_abandoned_resolved':'ignore_abandoned_resolved',
    'ignore_abandoned_rejected':'ignore_abandoned_rejected',
}

const ERRORS = {
    'not_supported_type':'not_supported_type',
    'not_supported_reject':'not_supported_reject',
    'leaf_node_should_not_recv_notification':'leaf_node_should_not_recv_notification',
    'only_on_root_task':'only_on_root_task',
    'can_only_start_when_ready':'can_only_start_when_ready',
    'can_only_bpause_when_opened':'can_only_bpause_when_opened',
    'can_only_spause_when_self_executing':'can_only_spause_when_self_executing',
    'can_only_continue_when_paused':'can_only_continue_when_paused',
    'state_not_supported':'state_not_supported',
    'serial_node_should_not_recv_child_noti_when_not_opened':'serial_node_should_not_recv_child_noti_when_not_opened',
    'parallel_node_should_not_recv_child_noti_when_not_OorB':'parallel_node_should_not_recv_child_noti_when_not_OorB',
    'can_only_recover_when_rejected':'can_only_recover_when_rejected',
    'not_supported_signal':'not_supported_signal',
    'serial_should_not_recv_child_noti_when_no_ready':'serial_should_not_recv_child_noti_when_no_ready',
    'should_not_recv_child_noti_if_pending':'should_not_recv_child_noti_if_pending',
    'should_not_recv_child_noti_if_resolved':'should_not_recv_child_noti_if_resolved',
    'should_not_recv_child_pause_noti_if_stopped':'should_not_recv_child_pause_noti_if_stopped',
    'can_soft_reset_only_when_settled':'can_soft_reset_only_when_settled',
}


const sym_state      = Symbol("")

    const sym_state_rdy        = Symbol("")
    const sym_state_conding    = Symbol("")
    const sym_state_open       = Symbol("")
    const sym_state_exec       = Symbol("")
    const sym_state_rs         = Symbol("")
    const sym_state_srj        = Symbol("")
    const sym_state_brj        = Symbol("")
    const sym_state_spause     = Symbol("")
    const sym_state_bpause     = Symbol("")
    const sym_state_im         = Symbol("")


const sym_rdy        = Symbol("")
const sym_conding    = Symbol("")
const sym_open       = Symbol("")
const sym_exec       = Symbol("")
const sym_rs         = Symbol("resolve")
const sym_srj        = Symbol("self_reject")
const sym_brj        = Symbol("bubble_reject")
const sym_spause     = Symbol("self_pause")
const sym_bpause     = Symbol("bubble_pause")
const sym_im         = Symbol("")
const sym_respawn    = Symbol("")


const sym_stuck_origin = Symbol("")
const sym_cond         = Symbol("") 
const sym_rslt         = Symbol("")
const sym_exception    = Symbol("")
const sym_psj          = Symbol("")
const sym_renew_psj    = Symbol("")

const sym_if           = Symbol("")
const sym_elif         = Symbol("")
const sym_else         = Symbol("")
const sym_while        = Symbol("")


const PARSER_USED_PROPS    = ['T','A']

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
    sym_recv,
    //
    DFLT_CU_CONDER   :(rtrn_true,rtrn_false,self)=>{rtrn_true(self)},
    DFLT_CU_EXECUTOR :(rs,rj,self)=>{rs(self)},
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
